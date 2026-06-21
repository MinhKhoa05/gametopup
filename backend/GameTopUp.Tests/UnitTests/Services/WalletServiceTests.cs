using FluentAssertions;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services.Wallets;
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
    public void Credit_ShouldCreateCreditTransactionAndUpdateBalance()
    {
        var wallet = Wallet.CreateForUser(7, 200m);

        var transaction = _service.Credit(wallet, 150m, WalletTransactionType.Deposit, "GTU-1406-40734");

        wallet.Balance.Should().Be(350m);
        transaction.Amount.Should().Be(150m);
        transaction.BalanceBefore.Should().Be(200m);
        transaction.BalanceAfter.Should().Be(350m);
        transaction.Type.Should().Be(WalletTransactionType.Deposit);
        transaction.ReferenceId.Should().Be("GTU-1406-40734");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Credit_ShouldThrow_WhenAmountIsNotPositive(decimal amount)
    {
        var wallet = Wallet.CreateForUser(7, 200m);

        Action act = () => _service.Credit(wallet, amount, WalletTransactionType.Deposit, "GTU-1406-40734");

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.AmountMustBePositive);
    }

    [Fact]
    public async Task LockByUserIdOrThrowAsync_ShouldThrow_WhenWalletDoesNotExist()
    {
        _walletRepository.Setup(repo => repo.GetWithLockByUserIdAsync(7))
            .ReturnsAsync((Wallet?)null);

        var act = async () => await _service.LockByUserIdOrThrowAsync(7);

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.WalletNotFound);
    }

    [Fact]
    public void EnsureSufficientBalance_ShouldThrow_WhenWalletHasNotEnoughBalance()
    {
        var wallet = Wallet.CreateForUser(7, 50m);

        var act = () => _service.EnsureSufficientBalance(wallet, 120m);

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InsufficientWalletBalance);
    }

    [Fact]
    public void Debit_ShouldCreateDebitTransactionAndUpdateBalance()
    {
        var wallet = Wallet.CreateForUser(7, 500m);

        var transaction = _service.Debit(wallet, 120m, WalletTransactionType.PurchaseOrder, "123");

        wallet.Balance.Should().Be(380m);
        transaction.Amount.Should().Be(-120m);
        transaction.BalanceBefore.Should().Be(500m);
        transaction.BalanceAfter.Should().Be(380m);
        transaction.Type.Should().Be(WalletTransactionType.PurchaseOrder);
        transaction.ReferenceId.Should().Be("123");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    public void Debit_ShouldThrow_WhenAmountIsNotPositive(decimal amount)
    {
        var wallet = Wallet.CreateForUser(7, 500m);

        Action act = () => _service.Debit(wallet, amount, WalletTransactionType.PurchaseOrder, "123");

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.AmountMustBePositive);
    }

    [Fact]
    public void Debit_ShouldThrow_WhenBalanceWouldBeNegative()
    {
        var wallet = Wallet.CreateForUser(7, 50m);

        Action act = () => _service.Debit(wallet, 120m, WalletTransactionType.PurchaseOrder, "123");

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InsufficientWalletBalance);
    }
}
