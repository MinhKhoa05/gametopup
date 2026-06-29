using FluentAssertions;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services.Images;
using GameTopUp.BLL.Services.Orders;
using GameTopUp.BLL.Services.Games;
using GameTopUp.BLL.Services.Wallets;
using GameTopUp.BLL.UseCases;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
using Moq;

namespace GameTopUp.Tests.UnitTests.UseCases;

public class OrderUseCaseTests
{
    private readonly Mock<IGamePackageRepository> _packageRepository = new();
    private readonly Mock<IGameRepository> _gameRepository = new();
    private readonly Mock<IImageStorageService> _imageStorageService = new();
    private readonly Mock<IWalletRepository> _walletRepository = new();
    private readonly Mock<IWalletTransactionRepository> _walletTransactionRepository = new();
    private readonly Mock<IOrderRepository> _orderRepository = new();
    private readonly Mock<IOrderHistoryRepository> _orderHistoryRepository = new();
    private readonly ITransactionManager _transaction = new ImmediateTransactionManager();
    private readonly OrderUseCase _useCase;

    public OrderUseCaseTests()
    {
        var packageService = new GamePackageService(_packageRepository.Object, _gameRepository.Object, _imageStorageService.Object);
        var walletService = new WalletService(_walletRepository.Object, _walletTransactionRepository.Object);
        var orderService = new OrderService(_orderRepository.Object, _orderHistoryRepository.Object);
        _useCase = new OrderUseCase(
            packageService,
            _gameRepository.Object,
            walletService,
            orderService,
            _transaction);
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
                GameId = 9,
                Name = "Diamond 86",
                SalePrice = 199m,
                IsActive = true
            });
        _gameRepository.Setup(repo => repo.GetByIdAsync(9))
            .ReturnsAsync(new Game
            {
                Id = 9,
                Name = "Mobile Legends"
            });
        _orderRepository.Setup(repo => repo.CreateAsync(It.IsAny<Order>()))
            .ReturnsAsync(88)
            .Callback<Order>(order => createdOrder = order);
        _orderHistoryRepository.Setup(repo => repo.CreateAsync(It.IsAny<OrderHistory>()))
            .ReturnsAsync(12)
            .Callback<OrderHistory>(history => createdHistory = history);
        var fundedWallet = Wallet.CreateForUser(7, 500m);
        fundedWallet.Id = 11;
        _walletRepository.Setup(repo => repo.GetWithLockByUserIdAsync(7))
            .ReturnsAsync(fundedWallet);
        _walletRepository.Setup(repo => repo.UpdateBalanceAsync(11, It.IsAny<decimal>()))
            .ReturnsAsync(1)
            .Callback<long, decimal>((_, newBalance) => updatedBalance = newBalance);
        _walletTransactionRepository.Setup(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()))
            .ReturnsAsync(101)
            .Callback<WalletTransaction>(transaction => createdTransaction = transaction);
        _packageRepository.Setup(repo => repo.DecreaseStockAsync(44, 1))
            .ReturnsAsync(1);

        var order = await _useCase.PurchaseOrderAsync(new UserContext { UserId = 7 }, new PurchaseOrderRequest
        {
            GamePackageId = 44,
            GameAccountInfo = "  HERO-123  "
        });

        order.OrderId.Should().Be(88);
        createdOrder.Should().NotBeNull();
        createdOrder!.GameAccountInfo.Should().Be("HERO-123");
        createdOrder.PackageName.Should().Be("Diamond 86");
        createdOrder.PackageCost.Should().Be(0m);
        createdOrder.Status.Should().Be(OrderStatus.Pending);
        createdHistory.Should().NotBeNull();
        createdHistory!.OrderId.Should().Be(88);
        createdHistory.ToStatus.Should().Be(OrderStatus.Pending);
        updatedBalance.Should().Be(301m);
        createdTransaction.Should().NotBeNull();
        createdTransaction!.Amount.Should().Be(-199m);
        createdTransaction.ReferenceId.Should().Be("88");
        createdTransaction.Type.Should().Be(WalletTransactionType.PurchaseOrder);
        _packageRepository.Verify(repo => repo.DecreaseStockAsync(44, 1), Times.Once);
    }

    [Fact]
    public async Task PurchaseOrderAsync_ShouldThrow_WhenGameAccountInfoIsBlank()
    {
        var act = async () => await _useCase.PurchaseOrderAsync(new UserContext { UserId = 7 }, new PurchaseOrderRequest
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
                GameId = 9,
                Name = "Diamond 86",
                SalePrice = 199m,
                IsActive = false
            });
        _gameRepository.Setup(repo => repo.GetByIdAsync(9))
            .ReturnsAsync(new Game
            {
                Id = 9,
                Name = "Mobile Legends"
            });

        var act = async () => await _useCase.PurchaseOrderAsync(new UserContext { UserId = 7 }, new PurchaseOrderRequest
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
    public async Task PurchaseOrderAsync_ShouldNotReserveStockOrCreateOrder_WhenWalletBalanceIsInsufficient()
    {
        _packageRepository.Setup(repo => repo.GetByIdAsync(44))
            .ReturnsAsync(new GamePackage
            {
                Id = 44,
                GameId = 9,
                Name = "Diamond 86",
                SalePrice = 199m,
                IsActive = true
            });
        _gameRepository.Setup(repo => repo.GetByIdAsync(9))
            .ReturnsAsync(new Game
            {
                Id = 9,
                Name = "Mobile Legends"
            });
        var lowBalanceWallet = Wallet.CreateForUser(7, 100m);
        lowBalanceWallet.Id = 11;
        _walletRepository.Setup(repo => repo.GetWithLockByUserIdAsync(7))
            .ReturnsAsync(lowBalanceWallet);

        var act = async () => await _useCase.PurchaseOrderAsync(new UserContext { UserId = 7 }, new PurchaseOrderRequest
        {
            GamePackageId = 44,
            GameAccountInfo = "HERO-123"
        });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InsufficientWalletBalance);
        _packageRepository.Verify(repo => repo.DecreaseStockAsync(It.IsAny<long>(), It.IsAny<int>()), Times.Never);
        _orderRepository.Verify(repo => repo.CreateAsync(It.IsAny<Order>()), Times.Never);
        _walletRepository.Verify(repo => repo.UpdateBalanceAsync(It.IsAny<long>(), It.IsAny<decimal>()), Times.Never);
        _walletTransactionRepository.Verify(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()), Times.Never);
    }

    [Fact]
    public async Task PurchaseOrderAsync_ShouldNotCreateOrderOrChargeWallet_WhenStockReservationFails()
    {
        _packageRepository.Setup(repo => repo.GetByIdAsync(44))
            .ReturnsAsync(new GamePackage
            {
                Id = 44,
                GameId = 9,
                Name = "Diamond 86",
                SalePrice = 199m,
                IsActive = true
            });
        _gameRepository.Setup(repo => repo.GetByIdAsync(9))
            .ReturnsAsync(new Game
            {
                Id = 9,
                Name = "Mobile Legends"
            });
        var fundedWallet = Wallet.CreateForUser(7, 500m);
        fundedWallet.Id = 11;
        _walletRepository.Setup(repo => repo.GetWithLockByUserIdAsync(7))
            .ReturnsAsync(fundedWallet);
        _packageRepository.Setup(repo => repo.DecreaseStockAsync(44, 1))
            .ReturnsAsync(0);

        var act = async () => await _useCase.PurchaseOrderAsync(new UserContext { UserId = 7 }, new PurchaseOrderRequest
        {
            GamePackageId = 44,
            GameAccountInfo = "HERO-123"
        });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.PackageOutOfStock);
        _orderRepository.Verify(repo => repo.CreateAsync(It.IsAny<Order>()), Times.Never);
        _orderHistoryRepository.Verify(repo => repo.CreateAsync(It.IsAny<OrderHistory>()), Times.Never);
        _walletRepository.Verify(repo => repo.UpdateBalanceAsync(It.IsAny<long>(), It.IsAny<decimal>()), Times.Never);
        _walletTransactionRepository.Verify(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()), Times.Never);
    }

    [Fact]
    public async Task PickOrderAsync_ShouldReturnUnchanged_WhenSameAdminAlreadyPickedOrder()
    {
        var order = Order.Create(7, 44, 199m, "Diamond 86", "hero-123", OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 3;
        order.AssignedAt = DateTimeOffset.UtcNow.AddMinutes(-5);
        _packageRepository.Setup(repo => repo.GetByIdAsync(44))
            .ReturnsAsync(new GamePackage
            {
                Id = 44,
                GameId = 9,
                Name = "Diamond 86"
            });
        _gameRepository.Setup(repo => repo.GetByIdAsync(9))
            .ReturnsAsync(new Game
            {
                Id = 9,
                Name = "Mobile Legends"
            });

        _orderRepository.Setup(repo => repo.GetWithLockByIdAsync(88))
            .ReturnsAsync(order);

        await _useCase.PickOrderAsync(88, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        order.Status.Should().Be(OrderStatus.Processing);
        order.AssignedTo.Should().Be(3);
        _orderRepository.Verify(repo => repo.UpdateAsync(It.IsAny<Order>()), Times.Never);
        _orderHistoryRepository.Verify(repo => repo.CreateAsync(It.IsAny<OrderHistory>()), Times.Never);
    }

    [Fact]
    public async Task CompleteOrderAsync_ShouldReturnUnchanged_WhenOrderIsAlreadyCompleted()
    {
        var order = Order.Create(7, 44, 199m, "Diamond 86", "hero-123", OrderStatus.Completed);
        order.Id = 88;
        order.AssignedTo = 3;
        _packageRepository.Setup(repo => repo.GetByIdAsync(44))
            .ReturnsAsync(new GamePackage
            {
                Id = 44,
                GameId = 9,
                Name = "Diamond 86"
            });
        _gameRepository.Setup(repo => repo.GetByIdAsync(9))
            .ReturnsAsync(new Game
            {
                Id = 9,
                Name = "Mobile Legends"
            });

        _orderRepository.Setup(repo => repo.GetWithLockByIdAsync(88))
            .ReturnsAsync(order);

        await _useCase.CompleteOrderAsync(88, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        order.Status.Should().Be(OrderStatus.Completed);
        _orderRepository.Verify(repo => repo.UpdateAsync(It.IsAny<Order>()), Times.Never);
        _orderHistoryRepository.Verify(repo => repo.CreateAsync(It.IsAny<OrderHistory>()), Times.Never);
    }

    [Fact]
    public async Task CancelOrderAsync_ShouldRestoreStockAndRefundWallet_WhenCancellationChangesState()
    {
        var order = Order.Create(7, 44, 199m, "Diamond 86", "hero-123", OrderStatus.Pending);
        order.Id = 88;
        OrderHistory? createdHistory = null;
        WalletTransaction? refundTransaction = null;
        decimal? updatedBalance = null;
        _packageRepository.Setup(repo => repo.GetByIdAsync(44))
            .ReturnsAsync(new GamePackage
            {
                Id = 44,
                GameId = 9,
                Name = "Diamond 86"
            });
        _gameRepository.Setup(repo => repo.GetByIdAsync(9))
            .ReturnsAsync(new Game
            {
                Id = 9,
                Name = "Mobile Legends"
            });

        _orderRepository.Setup(repo => repo.GetWithLockByIdAsync(88))
            .ReturnsAsync(order);
        _orderRepository.Setup(repo => repo.UpdateAsync(It.IsAny<Order>()))
            .ReturnsAsync(true);
        _orderHistoryRepository.Setup(repo => repo.CreateAsync(It.IsAny<OrderHistory>()))
            .ReturnsAsync(12)
            .Callback<OrderHistory>(history => createdHistory = history);
        _packageRepository.Setup(repo => repo.IncreaseStockAsync(44, 1))
            .ReturnsAsync(1);
        var walletAfterPurchase = Wallet.CreateForUser(7, 301m);
        walletAfterPurchase.Id = 11;
        _walletRepository.Setup(repo => repo.GetWithLockByUserIdAsync(7))
            .ReturnsAsync(walletAfterPurchase);
        _walletRepository.Setup(repo => repo.UpdateBalanceAsync(11, It.IsAny<decimal>()))
            .ReturnsAsync(1)
            .Callback<long, decimal>((_, newBalance) => updatedBalance = newBalance);
        _walletTransactionRepository.Setup(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()))
            .ReturnsAsync(102)
            .Callback<WalletTransaction>(transaction => refundTransaction = transaction);

        await _useCase.CancelOrderAsync(88, new UserContext { UserId = 7 }, "changed my mind");

        order.Status.Should().Be(OrderStatus.Cancelled);
        updatedBalance.Should().Be(500m);
        createdHistory.Should().NotBeNull();
        createdHistory!.FromStatus.Should().Be(OrderStatus.Pending);
        createdHistory.ToStatus.Should().Be(OrderStatus.Cancelled);
        createdHistory.Note.Should().Be("changed my mind");
        refundTransaction.Should().NotBeNull();
        refundTransaction!.Amount.Should().Be(199m);
        refundTransaction.Type.Should().Be(WalletTransactionType.Refund);
        refundTransaction.ReferenceId.Should().Be("88");
        _packageRepository.Verify(repo => repo.IncreaseStockAsync(44, 1), Times.Once);
    }

    [Fact]
    public async Task CancelOrderAsync_ShouldNotRefundWallet_WhenStockRestoreFails()
    {
        var order = Order.Create(7, 44, 199m, "Diamond 86", "hero-123", OrderStatus.Pending);
        order.Id = 88;
        _packageRepository.Setup(repo => repo.GetByIdAsync(44))
            .ReturnsAsync(new GamePackage
            {
                Id = 44,
                GameId = 9,
                Name = "Diamond 86"
            });
        _gameRepository.Setup(repo => repo.GetByIdAsync(9))
            .ReturnsAsync(new Game
            {
                Id = 9,
                Name = "Mobile Legends"
            });

        _orderRepository.Setup(repo => repo.GetWithLockByIdAsync(88))
            .ReturnsAsync(order);
        _orderRepository.Setup(repo => repo.UpdateAsync(It.IsAny<Order>()))
            .ReturnsAsync(true);
        _orderHistoryRepository.Setup(repo => repo.CreateAsync(It.IsAny<OrderHistory>()))
            .ReturnsAsync(12);
        _packageRepository.Setup(repo => repo.IncreaseStockAsync(44, 1))
            .ReturnsAsync(0);

        var act = async () => await _useCase.CancelOrderAsync(88, new UserContext { UserId = 7 });

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.GamePackageNotFound);
        _walletRepository.Verify(repo => repo.GetWithLockByUserIdAsync(It.IsAny<long>()), Times.Never);
        _walletRepository.Verify(repo => repo.UpdateBalanceAsync(It.IsAny<long>(), It.IsAny<decimal>()), Times.Never);
        _walletTransactionRepository.Verify(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()), Times.Never);
    }

    [Fact]
    public async Task CancelOrderAsync_ShouldNotRestoreStockOrRefund_WhenOrderWasAlreadyCancelled()
    {
        var order = Order.Create(7, 44, 199m, "Diamond 86", "hero-123", OrderStatus.Cancelled);
        order.Id = 88;
        _packageRepository.Setup(repo => repo.GetByIdAsync(44))
            .ReturnsAsync(new GamePackage
            {
                Id = 44,
                GameId = 9,
                Name = "Diamond 86"
            });
        _gameRepository.Setup(repo => repo.GetByIdAsync(9))
            .ReturnsAsync(new Game
            {
                Id = 9,
                Name = "Mobile Legends"
            });

        _orderRepository.Setup(repo => repo.GetWithLockByIdAsync(88))
            .ReturnsAsync(order);

        await _useCase.CancelOrderAsync(88, new UserContext { UserId = 7 });

        order.Status.Should().Be(OrderStatus.Cancelled);
        _orderRepository.Verify(repo => repo.UpdateAsync(It.IsAny<Order>()), Times.Never);
        _orderHistoryRepository.Verify(repo => repo.CreateAsync(It.IsAny<OrderHistory>()), Times.Never);
        _packageRepository.Verify(repo => repo.IncreaseStockAsync(It.IsAny<long>(), It.IsAny<int>()), Times.Never);
        _walletRepository.Verify(repo => repo.GetWithLockByUserIdAsync(It.IsAny<long>()), Times.Never);
        _walletTransactionRepository.Verify(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()), Times.Never);
    }
}
