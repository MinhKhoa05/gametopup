using FluentAssertions;
using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Mappers.Games;
using GameTopUp.BLL.Mappers.Orders;
using GameTopUp.BLL.Mappers.Wallets;
using GameTopUp.BLL.Options;
using GameTopUp.BLL.Queries.Games;
using GameTopUp.BLL.Queries.Orders;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.DAL.Entities.Wallets;

namespace GameTopUp.Tests.UnitTests.Mappers;

public class BackendMapsterMapperTests
{
    [Fact]
    public void GameMapper_ToPublicResponse_ForGame_ShouldMapSharedFields()
    {
        var game = new Game
        {
            Id = 7,
            Name = "PUBG",
            ImageUrl = "https://cdn.test/pubg.png"
        };

        var response = GameMapper.ToPublicResponse(game);

        response.Id.Should().Be(7);
        response.Name.Should().Be("PUBG");
        response.ImageUrl.Should().Be("https://cdn.test/pubg.png");
    }

    [Fact]
    public void GameMapper_ToPublicResponse_ForPackage_ShouldDeriveAvailability()
    {
        var package = new GamePackage
        {
            Id = 15,
            Name = "VIP",
            ImageUrl = "https://cdn.test/vip.png",
            SalePrice = 100000m,
            OriginalPrice = 120000m,
            StockQuantity = 8
        };

        var response = GameMapper.ToPublicResponse(package);

        response.Id.Should().Be(15);
        response.Name.Should().Be("VIP");
        response.ImageUrl.Should().Be("https://cdn.test/vip.png");
        response.Description.Should().BeNull();
        response.SalePrice.Should().Be(100000m);
        response.OriginalPrice.Should().Be(120000m);
        response.IsAvailable.Should().BeTrue();
    }

    [Fact]
    public void GameMapper_ToAdminSummaryResponse_ShouldMapRow()
    {
        var row = new AdminGameSummaryRow
        {
            Id = 21,
            Name = "Free Fire",
            ImageUrl = "https://cdn.test/freefire.png",
            IsActive = true,
            PackageCount = 12,
            CreatedAt = new DateTime(2025, 1, 1),
            UpdatedAt = new DateTime(2025, 1, 2)
        };

        var response = GameMapper.ToAdminSummaryResponse(row);

        response.Id.Should().Be(21);
        response.Name.Should().Be("Free Fire");
        response.ImageUrl.Should().Be("https://cdn.test/freefire.png");
        response.IsActive.Should().BeTrue();
        response.PackageCount.Should().Be(12);
        response.CreatedAt.Should().Be(new DateTime(2025, 1, 1));
        response.UpdatedAt.Should().Be(new DateTime(2025, 1, 2));
    }

    [Fact]
    public void OrderMapper_ToMyOrderSummaryResponse_ShouldCopyUnitPriceIntoTotal()
    {
        var row = new MyOrderSummaryRow
        {
            Id = 33,
            GameAccountInfo = "hero-123",
            GamePackageId = 44,
            GameId = 55,
            GameName = "MLBB",
            GameImageUrl = "https://cdn.test/mlbb.png",
            PackageName = "Weekly Pass",
            PackageImageUrl = "https://cdn.test/weekly.png",
            UnitPrice = 99000m,
            Status = OrderStatus.Processing,
            CreatedAt = new DateTime(2025, 2, 1),
            UpdatedAt = new DateTime(2025, 2, 2)
        };

        var response = OrderMapper.ToMyOrderSummaryResponse(row);

        response.Id.Should().Be(33);
        response.GameAccountInfo.Should().Be("hero-123");
        response.GamePackageId.Should().Be(44);
        response.GameId.Should().Be(55);
        response.GameName.Should().Be("MLBB");
        response.GameImageUrl.Should().Be("https://cdn.test/mlbb.png");
        response.PackageName.Should().Be("Weekly Pass");
        response.PackageImageUrl.Should().Be("https://cdn.test/weekly.png");
        response.UnitPrice.Should().Be(99000m);
        response.Total.Should().Be(99000m);
        response.Status.Should().Be(OrderStatus.Processing);
        response.CreatedAt.Should().Be(new DateTime(2025, 2, 1));
        response.UpdatedAt.Should().Be(new DateTime(2025, 2, 2));
    }

    [Fact]
    public void OrderMapper_ToAdminOrderSummaryResponse_ShouldMapRow()
    {
        var row = new AdminOrderSummaryRow
        {
            Id = 66,
            UserId = 77,
            GameAccountInfo = "user-77",
            GamePackageId = 88,
            UnitPrice = 123000m,
            Total = 123000m,
            AssignedTo = 99,
            AssignedAt = new DateTime(2025, 3, 1),
            Status = OrderStatus.Completed,
            CreatedAt = new DateTime(2025, 3, 2),
            UpdatedAt = new DateTime(2025, 3, 3)
        };

        var response = OrderMapper.ToAdminOrderSummaryResponse(row);

        response.Id.Should().Be(66);
        response.UserId.Should().Be(77);
        response.GameAccountInfo.Should().Be("user-77");
        response.GamePackageId.Should().Be(88);
        response.UnitPrice.Should().Be(123000m);
        response.Total.Should().Be(123000m);
        response.AssignedTo.Should().Be(99);
        response.AssignedAt.Should().Be(new DateTime(2025, 3, 1));
        response.Status.Should().Be(OrderStatus.Completed);
        response.CreatedAt.Should().Be(new DateTime(2025, 3, 2));
        response.UpdatedAt.Should().Be(new DateTime(2025, 3, 3));
    }

    [Fact]
    public void OrderTimelineMapper_ToTimelineResponse_ShouldReturnOrderStateAndHistoryEvents()
    {
        var order = new Order
        {
            Id = 90,
            Status = OrderStatus.Completed,
            CreatedAt = new DateTime(2025, 6, 1, 8, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2025, 6, 1, 9, 0, 0, DateTimeKind.Utc),
        };
        var histories = new List<OrderHistory>
        {
            new()
            {
                OrderId = 90,
                FromStatus = OrderStatus.Pending,
                ToStatus = OrderStatus.Pending,
                Note = "Created from checkout",
                CreatedAt = new DateTime(2025, 6, 1, 8, 1, 0, DateTimeKind.Utc),
            },
            new()
            {
                OrderId = 90,
                FromStatus = OrderStatus.Processing,
                ToStatus = OrderStatus.Completed,
                Note = "Delivered by admin",
                CreatedAt = new DateTime(2025, 6, 1, 8, 55, 0, DateTimeKind.Utc),
            },
        };

        var response = OrderTimelineMapper.ToTimelineResponse(order, histories);

        response.Status.Should().Be(OrderStatus.Completed);
        response.CreatedAt.Should().Be(order.CreatedAt);
        response.UpdatedAt.Should().Be(order.UpdatedAt);
        response.Events.Should().HaveCount(2);
        response.Events[0].ToStatus.Should().Be(OrderStatus.Pending);
        response.Events[0].Note.Should().Be("Created from checkout");
        response.Events[0].CreatedAt.Should().Be(new DateTime(2025, 6, 1, 8, 1, 0, DateTimeKind.Utc));
        response.Events[1].FromStatus.Should().Be(OrderStatus.Processing);
        response.Events[1].ToStatus.Should().Be(OrderStatus.Completed);
        response.Events[1].Note.Should().Be("Delivered by admin");
        response.Events[1].CreatedAt.Should().Be(new DateTime(2025, 6, 1, 8, 55, 0, DateTimeKind.Utc));
    }

    [Fact]
    public void WalletMapper_ToTransactionResponse_ShouldMapFields()
    {
        var transaction = new WalletTransaction
        {
            Id = 11,
            Amount = 150000m,
            BalanceBefore = 500000m,
            BalanceAfter = 650000m,
            Type = WalletTransactionType.Deposit,
            Description = "Deposit wallet",
            OrderId = 101,
            CreatedAt = new DateTime(2025, 4, 1)
        };

        var response = WalletMapper.ToTransactionResponse(transaction);

        response.Id.Should().Be(11);
        response.Amount.Should().Be(150000m);
        response.BalanceBefore.Should().Be(500000m);
        response.BalanceAfter.Should().Be(650000m);
        response.Type.Should().Be(WalletTransactionType.Deposit);
        response.Description.Should().Be("Deposit wallet");
        response.OrderId.Should().Be(101);
        response.CreatedAt.Should().Be(new DateTime(2025, 4, 1));
    }

    [Fact]
    public void WalletMapper_ToPublicDepositRequestResponse_ShouldFillQrAndSettings()
    {
        var request = WalletDepositRequest.Create(7, 100000m, "GTU-1406-40734", "GTU-1406-40734");
        request.Id = 99;
        request.Status = WalletDepositRequestStatus.UserConfirmed;

        var response = WalletMapper.ToPublicDepositRequestResponse(request, new VietQrSettings
        {
            BankId = "VCB",
            AccountNo = "123456789",
            AccountName = "GameTopUp",
            Template = "compact2"
        });

        response.Id.Should().Be(99);
        response.Amount.Should().Be(100000m);
        response.Code.Should().Be("GTU-1406-40734");
        response.TransferContent.Should().Be("GTU-1406-40734");
        response.QrImageUrl.Should().Contain("https://img.vietqr.io/image/");
        response.BankId.Should().Be("VCB");
        response.AccountNo.Should().Be("123456789");
        response.AccountName.Should().Be("GameTopUp");
        response.Status.Should().Be(WalletDepositRequestStatus.UserConfirmed);
    }

    [Fact]
    public void WalletMapper_ToAdminDepositRequestResponse_ShouldMapFields()
    {
        var request = WalletDepositRequest.Create(7, 100000m, "GTU-1406-40734", "GTU-1406-40734");
        request.Id = 99;
        request.MarkUserConfirmed(new DateTime(2025, 5, 1));
        request.MarkApproved(8, "ok", new DateTime(2025, 5, 2));

        var response = WalletMapper.ToAdminDepositRequestResponse(request);

        response.Id.Should().Be(99);
        response.UserId.Should().Be(7);
        response.Amount.Should().Be(100000m);
        response.Code.Should().Be("GTU-1406-40734");
        response.Status.Should().Be(WalletDepositRequestStatus.Approved);
        response.UserConfirmedAt.Should().Be(new DateTime(2025, 5, 1));
        response.ReviewedBy.Should().Be(8);
        response.ReviewedAt.Should().Be(new DateTime(2025, 5, 2));
        response.AdminNote.Should().Be("ok");
    }
}
