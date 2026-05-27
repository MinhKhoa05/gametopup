using Moq;
using GameTopUp.DAL.Interfaces.Orders;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.Common;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities;
using Xunit;
using FluentAssertions;

namespace GameTopUp.Tests.UnitTests.Services
{
    public class OrderServiceTests
    {
        private readonly Mock<IOrderRepository> _orderRepoMock;
        private readonly Mock<IOrderHistoryRepository> _orderHistoryRepoMock;
        private readonly OrderService _orderService;

        public OrderServiceTests()
        {
            _orderRepoMock = new Mock<IOrderRepository>();
            _orderHistoryRepoMock = new Mock<IOrderHistoryRepository>();
            _orderService = new OrderService(_orderRepoMock.Object, _orderHistoryRepoMock.Object);
        }

        [Fact]
        public async Task PickOrderAsync_ShouldSucceed_WhenOrderIsPaid()
        {
            // Arrange
            var admin = new UserContext(1, "admin", "Admin");
            var order = new Order { Id = 123, Status = OrderStatus.Paid, AssignTo = 0 };

            OrderHistory? history = null;
            _orderHistoryRepoMock
                .Setup(r => r.CreateAsync(It.IsAny<OrderHistory>()))
                .Callback<OrderHistory>(h => history = h)
                .ReturnsAsync(1);

            // Act
            await _orderService.PickOrderAsync(order, admin);

            // Assert
            order.Status.Should().Be(OrderStatus.Processing);
            order.AssignTo.Should().Be(admin.UserId);

            history.Should().NotBeNull();
            history!.OrderId.Should().Be(order.Id);
            history.FromStatus.Should().Be(OrderStatus.Paid);
            history.ToStatus.Should().Be(OrderStatus.Processing);
            history.ActionBy.Should().Be(admin.UserId);
            history.IsAdmin.Should().BeTrue();
        }

        [Fact]
        public async Task PickOrderAsync_ShouldThrowBusinessException_WhenOrderNotPaid()
        {
            // Arrange
            var admin = new UserContext(1, "admin", "Admin");
            var order = new Order { Status = OrderStatus.Pending };

            // Act
            Func<Task> act = () => _orderService.PickOrderAsync(order, admin);

            // Assert
            await act.Should().ThrowAsync<BusinessException>()
                .WithMessage("Chỉ có thể tiếp nhận đơn hàng đã thanh toán.");
        }

        [Fact]
        public async Task PickOrderAsync_ShouldThrowBusinessException_WhenOrderAlreadyAssigned()
        {
            // Arrange
            var admin = new UserContext(1, "admin", "Admin");
            var order = new Order { Status = OrderStatus.Processing, AssignTo = 2 };

            // Act
            Func<Task> act = () => _orderService.PickOrderAsync(order, admin);

            // Assert
            await act.Should().ThrowAsync<BusinessException>()
                .WithMessage("Đơn hàng đã được admin khác tiếp nhận.");
        }

        [Fact]
        public async Task CompleteOrderAsync_ShouldSucceed_WhenValid()
        {
            // Arrange
            var admin = new UserContext(1, "admin", "Admin");
            var order = new Order { Id = 123, Status = OrderStatus.Processing, AssignTo = admin.UserId };

            OrderHistory? history = null;
            _orderHistoryRepoMock
                .Setup(r => r.CreateAsync(It.IsAny<OrderHistory>()))
                .Callback<OrderHistory>(h => history = h)
                .ReturnsAsync(1);

            // Act
            await _orderService.CompleteOrderAsync(order, admin);

            // Assert
            order.Status.Should().Be(OrderStatus.Completed);

            history.Should().NotBeNull();
            history!.OrderId.Should().Be(order.Id);
            history.FromStatus.Should().Be(OrderStatus.Processing);
            history.ToStatus.Should().Be(OrderStatus.Completed);
            history.ActionBy.Should().Be(admin.UserId);
            history.IsAdmin.Should().BeTrue();
        }

        [Fact]
        public async Task CompleteOrderAsync_ShouldThrowBusinessException_WhenOrderNotProcessing()
        {
            // Arrange
            var admin = new UserContext(1, "admin", "Admin");
            var order = new Order { Status = OrderStatus.Paid, AssignTo = admin.UserId };

            // Act
            Func<Task> act = () => _orderService.CompleteOrderAsync(order, admin);

            // Assert
            await act.Should().ThrowAsync<BusinessException>()
                .WithMessage("Trạng thái đơn hàng không hợp lệ để hoàn thành.");
        }

        [Fact]
        public async Task CompleteOrderAsync_ShouldThrowBusinessException_WhenAssignedToAnotherAdmin()
        {
            // Arrange
            var admin = new UserContext(1, "admin", "Admin");
            var order = new Order { Status = OrderStatus.Processing, AssignTo = 999 };

            // Act
            Func<Task> act = () => _orderService.CompleteOrderAsync(order, admin);

            // Assert
            await act.Should().ThrowAsync<BusinessException>()
                .WithMessage("Bạn không thể can thiệp vào đơn hàng của người khác.");
        }

        [Fact]
        public async Task CancelOrderAsync_ShouldSucceed_WhenValid()
        {
            // Arrange
            var admin = new UserContext(1, "admin", "Admin");
            var order = new Order { Id = 123, Status = OrderStatus.Pending, UserId = 999, AssignTo = admin.UserId };

            OrderHistory? history = null;
            _orderHistoryRepoMock
                .Setup(r => r.CreateAsync(It.IsAny<OrderHistory>()))
                .Callback<OrderHistory>(h => history = h)
                .ReturnsAsync(1);

            // Act
            var result = await _orderService.CancelOrderAsync(order, admin);

            // Assert
            result.Should().Be(OrderStatus.Pending);
            order.Status.Should().Be(OrderStatus.Cancelled);

            history.Should().NotBeNull();
            history!.OrderId.Should().Be(order.Id);
            history.FromStatus.Should().Be(OrderStatus.Pending);
            history.ToStatus.Should().Be(OrderStatus.Cancelled);
            history.ActionBy.Should().Be(admin.UserId);
        }

        [Fact]
        public async Task CancelOrderAsync_ShouldBeIdempotent_WhenAlreadyCancelled()
        {
            // Arrange
            var admin = new UserContext(1, "admin", "Admin");
            var order = new Order { Status = OrderStatus.Cancelled };

            // Act
            var result = await _orderService.CancelOrderAsync(order, admin);

            // Assert
            result.Should().BeNull();
            _orderRepoMock.Verify(r => r.UpdateAsync(It.IsAny<Order>()), Times.Never);
            _orderHistoryRepoMock.Verify(r => r.CreateAsync(It.IsAny<OrderHistory>()), Times.Never);
        }

        [Fact]
        public async Task CancelOrderAsync_ShouldThrowBusinessException_WhenOrderCompleted()
        {
            // Arrange
            var admin = new UserContext(1, "admin", "Admin");
            var order = new Order { Status = OrderStatus.Completed };

            // Act
            Func<Task> act = () => _orderService.CancelOrderAsync(order, admin);

            // Assert
            await act.Should().ThrowAsync<BusinessException>()
                .WithMessage("Đơn hàng đã hoàn thành không thể hủy.");
        }

        [Fact]
        public async Task CreateOrderAsync_ShouldThrowBusinessException_WhenUserAlreadyHasPendingOrder()
        {
            // Arrange
            var userContext = new UserContext(1, "testuser", "User");
            var package = new GamePackage { Id = 10, SalePrice = 50000 };
            _orderRepoMock.Setup(r => r.HasPendingOrderAsync(1)).ReturnsAsync(true);

            // Act
            Func<Task> act = () => _orderService.CreateOrderAsync(userContext, package, 1, "account_info");

            // Assert
            await act.Should().ThrowAsync<BusinessException>()
                .WithMessage("Bạn đang có một đơn hàng chờ thanh toán*");
            _orderRepoMock.Verify(r => r.CreateAsync(It.IsAny<Order>()), Times.Never);
        }

        [Fact]
        public async Task CreateOrderAsync_ShouldSucceed_WhenUserHasNoPendingOrder()
        {
            // Arrange
            var userContext = new UserContext(1, "testuser", "User");
            var package = new GamePackage { Id = 10, SalePrice = 50000 };
            _orderRepoMock.Setup(r => r.HasPendingOrderAsync(1)).ReturnsAsync(false);

            Order? createdOrder = null;
            _orderRepoMock
                .Setup(r => r.CreateAsync(It.IsAny<Order>()))
                .Callback<Order>(o => createdOrder = o)
                .ReturnsAsync(999L);

            OrderHistory? createdHistory = null;
            _orderHistoryRepoMock
                .Setup(r => r.CreateAsync(It.IsAny<OrderHistory>()))
                .Callback<OrderHistory>(h => createdHistory = h)
                .ReturnsAsync(1);

            // Act
            var orderId = await _orderService.CreateOrderAsync(userContext, package, 2, "account_info");

            // Assert
            orderId.Should().Be(999L);

            createdOrder.Should().NotBeNull();
            createdOrder!.UserId.Should().Be(1);
            createdOrder.GamePackageId.Should().Be(10);
            createdOrder.UnitPrice.Should().Be(50000);
            createdOrder.Quantity.Should().Be(2);
            createdOrder.GameAccountInfo.Should().Be("account_info");
            createdOrder.Status.Should().Be(OrderStatus.Pending);

            createdHistory.Should().NotBeNull();
            createdHistory!.OrderId.Should().Be(999L);
            createdHistory.FromStatus.Should().Be(OrderStatus.Pending);
            createdHistory.ToStatus.Should().Be(OrderStatus.Pending);
            createdHistory.ActionBy.Should().Be(1);
        }
    }
}
