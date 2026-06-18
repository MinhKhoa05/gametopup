using FluentAssertions;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.DAL.Interfaces.Wallets;
using Moq;

namespace GameTopUp.Tests.UnitTests.Services;

public class WalletServiceTests
{
    private readonly Mock<IWalletRepository> _walletRepository = new();
    private readonly Mock<IWalletTransactionRepository> _transactionRepository = new();
    private readonly WalletService _service;

    public WalletServiceTests()
    {
        _service = new WalletService(_walletRepository.Object, _transactionRepository.Object);
    }

    [Fact]
    public async Task GetBalanceAsync_ShouldThrow_WhenWalletIsMissing()
    {
        _walletRepository.Setup(repo => repo.GetByUserIdAsync(7)).ReturnsAsync((Wallet?)null);

        var act = async () => await _service.GetBalanceAsync(new UserContext { UserId = 7 });

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.WalletNotFound);
    }

    [Fact]
    public async Task DepositAsync_ShouldCreditWalletAndRecordDepositTransaction()
    {
        Wallet? updatedWallet = null;
        WalletTransaction? createdTransaction = null;
        _walletRepository.Setup(repo => repo.GetWithLockByUserIdAsync(7))
            .ReturnsAsync(new Wallet { Id = 11, UserId = 7, Balance = 200m });
        _walletRepository.Setup(repo => repo.UpdateBalanceAsync(11, 350m))
            .ReturnsAsync(1)
            .Callback<long, decimal>((_, newBalance) => updatedWallet = new Wallet { Id = 11, UserId = 7, Balance = newBalance });
        _transactionRepository.Setup(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()))
            .ReturnsAsync(99)
            .Callback<WalletTransaction>(transaction => createdTransaction = transaction);

        var response = await _service.DepositAsync(7, 150m);

        response.TransactionId.Should().Be(99);
        updatedWallet.Should().NotBeNull();
        updatedWallet!.Balance.Should().Be(350m);
        createdTransaction.Should().NotBeNull();
        createdTransaction!.Amount.Should().Be(150m);
        createdTransaction.BalanceBefore.Should().Be(200m);
        createdTransaction.BalanceAfter.Should().Be(350m);
        createdTransaction.Type.Should().Be(WalletTransactionType.Deposit);
        createdTransaction.Description.Should().Contain("Deposit wallet: 150");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task DepositAsync_ShouldThrow_WhenAmountIsNotPositive(decimal amount)
    {
        var act = async () => await _service.DepositAsync(7, amount);

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.AmountMustBePositive);

        _walletRepository.Verify(repo => repo.GetWithLockByUserIdAsync(It.IsAny<long>()), Times.Never);
        _walletRepository.Verify(repo => repo.UpdateBalanceAsync(It.IsAny<long>(), It.IsAny<decimal>()), Times.Never);
        _transactionRepository.Verify(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()), Times.Never);
    }

    [Fact]
    public async Task ChargeOrderAsync_ShouldDecreaseWalletBalanceAndCreatePurchaseTransaction()
    {
        Wallet? updatedWallet = null;
        WalletTransaction? createdTransaction = null;
        _walletRepository.Setup(repo => repo.GetWithLockByUserIdAsync(7))
            .ReturnsAsync(new Wallet { Id = 11, UserId = 7, Balance = 500m });
        _walletRepository.Setup(repo => repo.UpdateBalanceAsync(11, 380m))
            .ReturnsAsync(1)
            .Callback<long, decimal>((_, newBalance) => updatedWallet = new Wallet { Id = 11, UserId = 7, Balance = newBalance });
        _transactionRepository.Setup(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()))
            .ReturnsAsync(100)
            .Callback<WalletTransaction>(transaction => createdTransaction = transaction);

        await _service.ChargeOrderAsync(7, 123, 120m);

        updatedWallet.Should().NotBeNull();
        updatedWallet!.Balance.Should().Be(380m);
        createdTransaction.Should().NotBeNull();
        createdTransaction!.Amount.Should().Be(-120m);
        createdTransaction.BalanceBefore.Should().Be(500m);
        createdTransaction.BalanceAfter.Should().Be(380m);
        createdTransaction.Type.Should().Be(WalletTransactionType.PurchaseOrder);
        createdTransaction.OrderId.Should().Be(123);
        createdTransaction.Description.Should().Contain("Purchase order #123");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    public async Task ChargeOrderAsync_ShouldThrow_WhenAmountIsNotPositive(decimal amount)
    {
        var act = async () => await _service.ChargeOrderAsync(7, 123, amount);

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.AmountMustBePositive);

        _walletRepository.Verify(repo => repo.GetWithLockByUserIdAsync(It.IsAny<long>()), Times.Never);
        _walletRepository.Verify(repo => repo.UpdateBalanceAsync(It.IsAny<long>(), It.IsAny<decimal>()), Times.Never);
        _transactionRepository.Verify(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()), Times.Never);
    }

    [Fact]
    public async Task ChargeOrderAsync_ShouldThrow_WhenBalanceWouldBeNegative()
    {
        _walletRepository.Setup(repo => repo.GetWithLockByUserIdAsync(7))
            .ReturnsAsync(new Wallet { Id = 11, UserId = 7, Balance = 50m });

        var act = async () => await _service.ChargeOrderAsync(7, 123, 120m);

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InsufficientWalletBalance);

        _walletRepository.Verify(repo => repo.UpdateBalanceAsync(It.IsAny<long>(), It.IsAny<decimal>()), Times.Never);
        _transactionRepository.Verify(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()), Times.Never);
    }

    [Fact]
    public async Task RefundOrderAsync_ShouldCreditWalletAndRecordRefundReason()
    {
        WalletTransaction? createdTransaction = null;
        _walletRepository.Setup(repo => repo.GetWithLockByUserIdAsync(7))
            .ReturnsAsync(new Wallet { Id = 11, UserId = 7, Balance = 80m });
        _walletRepository.Setup(repo => repo.UpdateBalanceAsync(11, 120m))
            .ReturnsAsync(1);
        _transactionRepository.Setup(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()))
            .ReturnsAsync(101)
            .Callback<WalletTransaction>(transaction => createdTransaction = transaction);

        await _service.RefundOrderAsync(7, 321, 40m, "customer requested cancellation");

        createdTransaction.Should().NotBeNull();
        createdTransaction!.Amount.Should().Be(40m);
        createdTransaction.BalanceBefore.Should().Be(80m);
        createdTransaction.BalanceAfter.Should().Be(120m);
        createdTransaction.Type.Should().Be(WalletTransactionType.Refund);
        createdTransaction.OrderId.Should().Be(321);
        createdTransaction.Description.Should().Contain("Refund order #321.");
        createdTransaction.Description.Should().Contain("Reason: customer requested cancellation");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public async Task RefundOrderAsync_ShouldThrow_WhenAmountIsNotPositive(decimal amount)
    {
        var act = async () => await _service.RefundOrderAsync(7, 321, amount, "reason");

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.AmountMustBePositive);

        _walletRepository.Verify(repo => repo.GetWithLockByUserIdAsync(It.IsAny<long>()), Times.Never);
        _walletRepository.Verify(repo => repo.UpdateBalanceAsync(It.IsAny<long>(), It.IsAny<decimal>()), Times.Never);
        _transactionRepository.Verify(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()), Times.Never);
    }

    [Fact]
    public async Task CreateWalletAsync_ShouldUpsertWalletForNewUser()
    {
        Wallet? createdWallet = null;
        _walletRepository
            .Setup(repo => repo.UpsertWalletAsync(It.IsAny<Wallet>()))
            .Returns(Task.CompletedTask)
            .Callback<Wallet>(wallet => createdWallet = wallet);

        await _service.CreateWalletAsync(7);

        createdWallet.Should().NotBeNull();
        createdWallet!.UserId.Should().Be(7);
        createdWallet.Balance.Should().Be(0m);
    }

    [Fact]
    public async Task GetTransactionsAsync_ShouldMapRepositoryRowsToResponseDto()
    {
        _transactionRepository.Setup(repo => repo.GetByUserIdAsync(7))
            .ReturnsAsync(new List<WalletTransaction>
            {
                new WalletTransaction
                {
                    Id = 15,
                    UserId = 7,
                    Amount = 250m,
                    BalanceBefore = 100m,
                    BalanceAfter = 350m,
                    Type = WalletTransactionType.Deposit,
                    Description = "Deposit wallet: 250 VND",
                    CreatedAt = new DateTime(2025, 01, 02, 03, 04, 05, DateTimeKind.Utc)
                }
            });

        var transactions = await _service.GetTransactionsAsync(new UserContext { UserId = 7 });

        transactions.Should().ContainSingle();
        var transaction = transactions.Single();
        transaction.Id.Should().Be(15);
        transaction.Amount.Should().Be(250m);
        transaction.BalanceBefore.Should().Be(100m);
        transaction.BalanceAfter.Should().Be(350m);
        transaction.Type.Should().Be(WalletTransactionType.Deposit);
        transaction.Description.Should().Be("Deposit wallet: 250 VND");
        transaction.OrderId.Should().BeNull();
        transaction.CreatedAt.Should().Be(new DateTime(2025, 01, 02, 03, 04, 05, DateTimeKind.Utc));
    }
}
