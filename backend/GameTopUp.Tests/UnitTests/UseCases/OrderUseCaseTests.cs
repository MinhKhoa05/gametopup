using FluentAssertions;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Interfaces;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.Services.Games;
using GameTopUp.BLL.UseCases;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.DAL.Interfaces.Games;
using GameTopUp.DAL.Interfaces.Orders;
using GameTopUp.DAL.Interfaces.Wallets;
using GameTopUp.DAL.Queries.Orders;
using Microsoft.Data.Sqlite;
using Moq;

namespace GameTopUp.Tests.UnitTests.UseCases;

public class OrderUseCaseTests : IDisposable
{
    private readonly Mock<IGamePackageRepository> _packageRepository = new();
    private readonly Mock<IGameRepository> _gameRepository = new();
    private readonly Mock<IImageStorageService> _imageStorageService = new();
    private readonly Mock<IWalletRepository> _walletRepository = new();
    private readonly Mock<IWalletTransactionRepository> _walletTransactionRepository = new();
    private readonly Mock<IOrderRepository> _orderRepository = new();
    private readonly Mock<IOrderHistoryRepository> _orderHistoryRepository = new();
    private readonly DatabaseContext _database;
    private readonly OrderUseCase _useCase;

    public OrderUseCaseTests()
    {
        _database = CreateDatabaseContext();

        var packageService = new GamePackageService(_packageRepository.Object, _gameRepository.Object, _imageStorageService.Object);
        var walletService = new WalletService(_walletRepository.Object, _walletTransactionRepository.Object);
        var orderService = new OrderService(_orderRepository.Object, _orderHistoryRepository.Object, new OrderQuery(_database));
        _useCase = new OrderUseCase(
            packageService,
            walletService,
            orderService,
            _orderRepository.Object,
            _orderHistoryRepository.Object,
            _walletRepository.Object,
            _walletTransactionRepository.Object,
            _database);
    }

    [Fact]
    public async Task PurchaseOrderAsync_ShouldTrimGameAccountInfoAndChargeWalletOnce()
    {
        var createdOrder = default(Order);
        var createdHistory = default(OrderHistory);
        WalletTransaction? createdTransaction = null;
        decimal? updatedBalance = null;

        _packageRepository.Setup(repo => repo.GetByIdAsync(44))
            .ReturnsAsync(new GamePackage
            {
                Id = 44,
                SalePrice = 199m,
                IsActive = true
            });
        _orderRepository.Setup(repo => repo.CreateAsync(It.IsAny<Order>()))
            .ReturnsAsync(88)
            .Callback<Order>(order => createdOrder = order);
        _orderHistoryRepository.Setup(repo => repo.CreateAsync(It.IsAny<OrderHistory>()))
            .ReturnsAsync(12)
            .Callback<OrderHistory>(history => createdHistory = history);
        _walletRepository.Setup(repo => repo.GetWithLockByUserIdAsync(7))
            .ReturnsAsync(new Wallet { Id = 11, UserId = 7, Balance = 500m });
        _walletRepository.Setup(repo => repo.UpdateBalanceAsync(11, It.IsAny<decimal>()))
            .ReturnsAsync(1)
            .Callback<long, decimal>((_, newBalance) => updatedBalance = newBalance);
        _walletTransactionRepository.Setup(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()))
            .ReturnsAsync(101)
            .Callback<WalletTransaction>(transaction => createdTransaction = transaction);
        _packageRepository.Setup(repo => repo.DecreaseStockAsync(44, 1))
            .ReturnsAsync(1);

        var order = await _useCase.PurchaseOrderAsync(new UserContext { UserId = 7 }, new PurchaseOrderRequestDTO
        {
            GamePackageId = 44,
            GameAccountInfo = "  HERO-123  "
        });

        order.Id.Should().Be(88);
        order.GameAccountInfo.Should().Be("HERO-123");
        order.Status.Should().Be(OrderStatus.Pending);
        createdOrder.Should().NotBeNull();
        createdOrder!.GameAccountInfo.Should().Be("HERO-123");
        createdOrder.Status.Should().Be(OrderStatus.Pending);
        createdHistory.Should().NotBeNull();
        createdHistory!.OrderId.Should().Be(88);
        createdHistory.FromStatus.Should().Be(OrderStatus.Pending);
        createdHistory.ToStatus.Should().Be(OrderStatus.Pending);
        createdHistory.Note.Should().Be("Order created in pending state.");
        updatedBalance.Should().Be(301m);
        createdTransaction.Should().NotBeNull();
        createdTransaction!.Amount.Should().Be(-199m);
        createdTransaction.OrderId.Should().Be(88);
        createdTransaction.Type.Should().Be(WalletTransactionType.PurchaseOrder);
        _orderRepository.Verify(repo => repo.CreateAsync(It.IsAny<Order>()), Times.Once);
        _orderHistoryRepository.Verify(repo => repo.CreateAsync(It.IsAny<OrderHistory>()), Times.Once);
        _packageRepository.Verify(repo => repo.DecreaseStockAsync(44, 1), Times.Once);
    }

    [Fact]
    public async Task PurchaseOrderAsync_ShouldThrow_WhenGameAccountInfoIsBlank()
    {
        var act = async () => await _useCase.PurchaseOrderAsync(new UserContext { UserId = 7 }, new PurchaseOrderRequestDTO
        {
            GamePackageId = 44,
            GameAccountInfo = "   "
        });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.BadRequest);

        _packageRepository.Verify(repo => repo.GetByIdAsync(It.IsAny<long>()), Times.Never);
        _walletRepository.Verify(repo => repo.GetWithLockByUserIdAsync(It.IsAny<long>()), Times.Never);
        _packageRepository.Verify(repo => repo.DecreaseStockAsync(It.IsAny<long>(), It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task PurchaseOrderAsync_ShouldThrow_WhenPackageIsInactive()
    {
        _packageRepository.Setup(repo => repo.GetByIdAsync(44))
            .ReturnsAsync(new GamePackage
            {
                Id = 44,
                SalePrice = 199m,
                IsActive = false
            });

        var act = async () => await _useCase.PurchaseOrderAsync(new UserContext { UserId = 7 }, new PurchaseOrderRequestDTO
        {
            GamePackageId = 44,
            GameAccountInfo = "HERO-123"
        });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.GamePackageInactive);

        _walletRepository.Verify(repo => repo.GetWithLockByUserIdAsync(It.IsAny<long>()), Times.Never);
        _packageRepository.Verify(repo => repo.DecreaseStockAsync(It.IsAny<long>(), It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task PickOrderAsync_ShouldReturnUnchanged_WhenSameAdminAlreadyPickedOrder()
    {
        var order = Order.Create(7, 44, 199m, "hero-123", OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 3;
        order.AssignedAt = DateTime.UtcNow.AddMinutes(-5);

        _orderRepository.Setup(repo => repo.GetWithLockByIdAsync(88))
            .ReturnsAsync(order);

        var result = await _useCase.PickOrderAsync(88, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        result.Status.Should().Be(OrderStatus.Processing);
        result.AssignedTo.Should().Be(3);
        _orderRepository.Verify(repo => repo.UpdateAsync(It.IsAny<Order>()), Times.Never);
        _orderHistoryRepository.Verify(repo => repo.CreateAsync(It.IsAny<OrderHistory>()), Times.Never);
    }

    [Fact]
    public async Task CompleteOrderAsync_ShouldReturnUnchanged_WhenOrderIsAlreadyCompleted()
    {
        var order = Order.Create(7, 44, 199m, "hero-123", OrderStatus.Completed);
        order.Id = 88;
        order.AssignedTo = 3;

        _orderRepository.Setup(repo => repo.GetWithLockByIdAsync(88))
            .ReturnsAsync(order);

        var result = await _useCase.CompleteOrderAsync(88, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        result.Status.Should().Be(OrderStatus.Completed);
        _orderRepository.Verify(repo => repo.UpdateAsync(It.IsAny<Order>()), Times.Never);
        _orderHistoryRepository.Verify(repo => repo.CreateAsync(It.IsAny<OrderHistory>()), Times.Never);
    }

    [Fact]
    public async Task CancelOrderAsync_ShouldRestoreStockAndRefundWallet_WhenCancellationChangesState()
    {
        var order = Order.Create(7, 44, 199m, "hero-123", OrderStatus.Pending);
        order.Id = 88;
        OrderHistory? createdHistory = null;
        WalletTransaction? refundTransaction = null;
        decimal? updatedBalance = null;

        _orderRepository.Setup(repo => repo.GetWithLockByIdAsync(88))
            .ReturnsAsync(order);
        _orderRepository.Setup(repo => repo.UpdateAsync(It.IsAny<Order>()))
            .ReturnsAsync(true);
        _orderHistoryRepository.Setup(repo => repo.CreateAsync(It.IsAny<OrderHistory>()))
            .ReturnsAsync(12)
            .Callback<OrderHistory>(history => createdHistory = history);
        _packageRepository.Setup(repo => repo.IncreaseStockAsync(44, 1))
            .ReturnsAsync(1);
        _walletRepository.Setup(repo => repo.GetWithLockByUserIdAsync(7))
            .ReturnsAsync(new Wallet { Id = 11, UserId = 7, Balance = 301m });
        _walletRepository.Setup(repo => repo.UpdateBalanceAsync(11, It.IsAny<decimal>()))
            .ReturnsAsync(1)
            .Callback<long, decimal>((_, newBalance) => updatedBalance = newBalance);
        _walletTransactionRepository.Setup(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()))
            .ReturnsAsync(102)
            .Callback<WalletTransaction>(transaction => refundTransaction = transaction);

        var result = await _useCase.CancelOrderAsync(88, new UserContext { UserId = 7 }, "changed my mind");

        result.Status.Should().Be(OrderStatus.Cancelled);
        updatedBalance.Should().Be(500m);
        createdHistory.Should().NotBeNull();
        createdHistory!.FromStatus.Should().Be(OrderStatus.Pending);
        createdHistory.ToStatus.Should().Be(OrderStatus.Cancelled);
        createdHistory.Note.Should().Be("Order cancelled. Reason: changed my mind");
        refundTransaction.Should().NotBeNull();
        refundTransaction!.Amount.Should().Be(199m);
        refundTransaction.Type.Should().Be(WalletTransactionType.Refund);
        refundTransaction.OrderId.Should().Be(88);
        _orderRepository.Verify(repo => repo.UpdateAsync(order), Times.Once);
        _orderHistoryRepository.Verify(repo => repo.CreateAsync(It.IsAny<OrderHistory>()), Times.Once);
        _packageRepository.Verify(repo => repo.IncreaseStockAsync(44, 1), Times.Once);
        _walletRepository.Verify(repo => repo.UpdateBalanceAsync(11, 500m), Times.Once);
    }

    [Fact]
    public async Task CancelOrderAsync_ShouldNotRestoreStockOrRefund_WhenOrderWasAlreadyCancelled()
    {
        var order = Order.Create(7, 44, 199m, "hero-123", OrderStatus.Cancelled);
        order.Id = 88;

        _orderRepository.Setup(repo => repo.GetWithLockByIdAsync(88))
            .ReturnsAsync(order);

        var result = await _useCase.CancelOrderAsync(88, new UserContext { UserId = 7 });

        result.Status.Should().Be(OrderStatus.Cancelled);
        _orderRepository.Verify(repo => repo.UpdateAsync(It.IsAny<Order>()), Times.Never);
        _orderHistoryRepository.Verify(repo => repo.CreateAsync(It.IsAny<OrderHistory>()), Times.Never);
        _packageRepository.Verify(repo => repo.IncreaseStockAsync(It.IsAny<long>(), It.IsAny<int>()), Times.Never);
        _walletRepository.Verify(repo => repo.GetWithLockByUserIdAsync(It.IsAny<long>()), Times.Never);
        _walletTransactionRepository.Verify(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()), Times.Never);
    }

    private static DatabaseContext CreateDatabaseContext()
    {
        var connection = new SqliteConnection("Data Source=:memory:");
        connection.Open();
        return new DatabaseContext(connection);
    }

    public void Dispose()
    {
        _database.Dispose();
    }
}
