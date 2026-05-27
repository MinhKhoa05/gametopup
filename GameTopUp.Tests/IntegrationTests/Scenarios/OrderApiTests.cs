using System.Net;
using FluentAssertions;
using GameTopUp.DAL.Entities;
using Xunit;

using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios
{
    [Collection("IntegrationTests")]
    public class OrderApiTests : BaseIntegrationTest
    {
        public OrderApiTests(CustomWebApplicationFactory<Program> factory) : base(factory)
        {
        }

        private async Task<(Game Game, GamePackage Package, User Customer)> SeedBaseDataAsync(
            string prefix,
            Action<GamePackage>? customizePackage = null)
        {
            var game = await Factory.SeedGameAsync($"{prefix} Game");
            var package = await Factory.SeedGamePackageAsync(game.Id, $"{prefix} Package", customizePackage);
            var customer = await Factory.SeedUserAsync($"{prefix.ToLower()}_customer");
            return (game, package, customer);
        }

        [Fact]
        public async Task PickOrder_ConcurrentRequests_OnlyOneShouldSucceed()
        {
            // Arrange
            var (_, package, customer) = await SeedBaseDataAsync("Pick");
            var seededOrder = await Factory.SeedOrderAsync(customer.Id, package.Id, customize: o => o.Status = OrderStatus.Paid);
            var orderId = seededOrder.Id;

            int concurrentRequests = 10;
            var tasks = new List<Task<HttpResponseMessage>>();

            // Act
            for (int i = 0; i < concurrentRequests; i++)
            {
                var req = new HttpRequestMessage(HttpMethod.Post, $"/api/orders/{orderId}/pick")
                    .WithTestAuth(i + 100, "Admin");
                
                tasks.Add(Client.SendAsync(req));
            }

            var responses = await Task.WhenAll(tasks);

            // Assert
            var successCount = responses.Count(r => r.StatusCode == HttpStatusCode.OK);
            var failureCount = responses.Count(r => r.StatusCode == HttpStatusCode.BadRequest);

            // Chỉ có đúng 1 Admin nhận được đơn hàng
            successCount.Should().Be(1, "Exactly one request should succeed in picking the order");
            failureCount.Should().Be(concurrentRequests - 1, "All other requests should fail with 400");

            // Kiểm tra trạng thái cuối cùng trong DB
            var order = await Factory.GetOrderAsync(orderId);
            order!.Status.Should().Be(OrderStatus.Processing);
            order.AssignTo.Should().BeInRange(100, 109);
        }

        [Fact]
        public async Task CancelOrder_ConcurrentRequests_AllShouldReturnOk_ButOnlyOneRefund()
        {
            // Arrange
            decimal packagePrice = 200;
            var (_, package, customer) = await SeedBaseDataAsync("Cancel", p => 
            {
                p.SalePrice = packagePrice;
                p.StockQuantity = 10;
            });
            decimal initialBalance = 500;
            int orderQuantity = 1;
            decimal orderTotal = packagePrice * orderQuantity;
            
            await Factory.SeedWalletAsync(customer.Id, initialBalance);
            var seededOrder = await Factory.SeedOrderAsync(customer.Id, package.Id, customize: o => 
            {
                o.Quantity = orderQuantity;
                o.UnitPrice = packagePrice;
                o.Status = OrderStatus.Paid;
            });
            var customerId = customer.Id;
            var orderId = seededOrder.Id;
            
            int concurrentRequests = 10;
            var tasks = new List<Task<HttpResponseMessage>>();

            // Act
            for (int i = 0; i < concurrentRequests; i++)
            {
                var req = new HttpRequestMessage(HttpMethod.Post, $"/api/orders/{orderId}/cancel")
                    .WithTestAuth(customerId, "User");
                tasks.Add(Client.SendAsync(req));
            }

            var responses = await Task.WhenAll(tasks);

            // Assert
            // Tính Idempotent: Tất cả đều trả về 200 OK
            foreach (var response in responses)
            {
                response.StatusCode.Should().Be(HttpStatusCode.OK);
            }

            // Kiểm tra Database: Số dư chỉ được hoàn 1 lần duy nhất
            var wallet = await Factory.GetWalletAsync(customerId);
            wallet!.Balance.Should().Be(initialBalance + orderTotal);

            // Kiểm tra Database: Tồn kho được hoàn trả lại đúng 1 lần (từ 10 tăng lên 11)
            var packageInDb = await Factory.GetPackageAsync(package.Id);
            packageInDb!.StockQuantity.Should().Be(11);

            // Kiểm tra Database: Trạng thái đơn hàng là Cancelled
            var order = await Factory.GetOrderAsync(orderId);
            order!.Status.Should().Be(OrderStatus.Cancelled);

            // Kiểm tra History: Chỉ có 1 bản ghi log cho việc hủy
            var historyCount = await Factory.GetOrderHistoryCountAsync(orderId);
            historyCount.Should().Be(1);
        }

        [Fact]
        public async Task CompleteOrder_ShouldSucceed_WhenAdminCompletesAssignedOrder()
        {
            // Arrange
            var (_, package, customer) = await SeedBaseDataAsync("Complete");
            // Đơn hàng phải được THANH TOÁN (Paid) thì Admin mới Pick được
            var seededOrder = await Factory.SeedOrderAsync(customer.Id, package.Id, customize: o => o.Status = OrderStatus.Paid);

            // Seed Admin để đảm bủo ID tồn tại trong DB cho FK AssignTo
            var admin = await Factory.SeedUserAsync("admin_comp");
            var orderId = seededOrder.Id;
            var adminId = admin.Id;

            // Admin picks the order first
            var pickRequest = new HttpRequestMessage(HttpMethod.Post, $"/api/orders/{orderId}/pick")
                .WithTestAuth(adminId, "Admin");
            var pickResponse = await Client.SendAsync(pickRequest);
            pickResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Act
            var request = new HttpRequestMessage(HttpMethod.Post, $"/api/orders/{orderId}/complete")
                .WithTestAuth(adminId, "Admin");
            var response = await Client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var order = await Factory.GetOrderAsync(orderId);
            order!.Status.Should().Be(OrderStatus.Completed);

            var historyCount = await Factory.GetOrderHistoryCountAsync(orderId);
            historyCount.Should().Be(2); // 1 for Pick, 1 for Complete
        }

        [Fact]
        public async Task CompleteOrder_ConcurrentRequests_ShouldBeIdempotent()
        {
            // Arrange
            var (_, package, customer) = await SeedBaseDataAsync("CompRace");
            // Đơn hàng phải được THANH TOÁN (Paid) thì Admin mới Pick được
            var seededOrder = await Factory.SeedOrderAsync(customer.Id, package.Id, customize: o => o.Status = OrderStatus.Paid);
            var orderId = seededOrder.Id;
            var admin = await Factory.SeedUserAsync("admin_comp_race", u => u.Role = UserRole.Admin);
            var adminId = admin.Id;

            // Admin picks the order
            var pickRequest = new HttpRequestMessage(HttpMethod.Post, $"/api/orders/{orderId}/pick")
                .WithTestAuth(adminId, "Admin");
            await Client.SendAsync(pickRequest);

            int concurrentRequests = 10;
            var tasks = new List<Task<HttpResponseMessage>>();

            // Act
            for (int i = 0; i < concurrentRequests; i++)
            {
                var req = new HttpRequestMessage(HttpMethod.Post, $"/api/orders/{orderId}/complete")
                    .WithTestAuth(adminId, "Admin");
                tasks.Add(Client.SendAsync(req));
            }

            var responses = await Task.WhenAll(tasks);

            // Assert
            foreach (var response in responses)
            {
                response.StatusCode.Should().Be(HttpStatusCode.OK);
            }

            var order = await Factory.GetOrderAsync(orderId);
            order!.Status.Should().Be(OrderStatus.Completed);

            var historyCount = await Factory.GetOrderHistoryCountAsync(orderId);
            historyCount.Should().Be(2);
        }
        
        #region PlaceOrder Tests

        [Fact]
        public async Task PlaceOrder_HappyPath_ShouldCreateOrderAndDecreaseStock()
        {
            // Arrange
            var (_, package, customer) = await SeedBaseDataAsync("Happy", p => p.StockQuantity = 10);
            var customerId = customer.Id;
            var packageId = package.Id;
            var placeDto = new { GamePackageId = packageId, Quantity = 2, GameAccountInfo = "player_123" };

            // Act
            var request = new HttpRequestMessage(HttpMethod.Post, "api/orders/place")
                .WithTestAuth(customerId, "User")
                .WithJson(placeDto);
            var response = await Client.SendAsync(request);
            
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            var orderId = await response.ReadDataAsync<long>();
            
            // Assert
            var order = await Factory.GetOrderAsync(orderId);
            order!.Status.Should().Be(OrderStatus.Pending);

            var packageInDb = await Factory.GetPackageAsync(packageId);
            packageInDb!.StockQuantity.Should().Be(8); // Ban đầu là 10, mua 2, kiểm tra còn 8.
        }

        [Fact]
        public async Task PlaceOrder_Concurrent_ShouldNotExceedStock()
        {
            // Arrange
            var (_, package, _) = await SeedBaseDataAsync("Race", p => p.StockQuantity = 5); // Chỉ có 5 item
            int concurrentRequests = 10;
            var packageId = package.Id;
            var placeDto = new { GamePackageId = packageId, Quantity = 1, GameAccountInfo = "race_player" };

            // Tạo 10 User khaân nhau để bypass rule "mỗi user chỉ có 1 đơn Pending"
            var userIds = new List<long>();
            for (int i = 1; i <= concurrentRequests; i++)
            {
                var user = await Factory.SeedUserAsync($"race_user_{i}");
                userIds.Add(user.Id);
            }

            // Act
            var tasks = new List<Task<HttpResponseMessage>>();
            foreach (var userId in userIds)
            {
                var req = new HttpRequestMessage(HttpMethod.Post, "api/orders/place")
                    .WithTestAuth(userId, "User")
                    .WithJson(placeDto);
                tasks.Add(Client.SendAsync(req));
            }

            var responses = await Task.WhenAll(tasks);

            // Assert
            var packageInDb = await Factory.GetPackageAsync(packageId);
            packageInDb!.StockQuantity.Should().Be(0);

            var successCount = responses.Count(r => r.StatusCode == HttpStatusCode.Created);
            successCount.Should().Be(5);
            
            var failedCount = responses.Count(r => r.StatusCode == HttpStatusCode.BadRequest);
            failedCount.Should().Be(5);
        }

        #endregion
    }
}
