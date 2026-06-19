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
    public void DepositFromVietQr_ShouldMutateBalanceAndReturnDepositTransaction()
    {
        var wallet = new Wallet { Id = 11, UserId = 7, Balance = 200m };

        var transaction = _service.DepositFromVietQr(wallet, 150m, "GTU-1406-40734");

        wallet.Balance.Should().Be(350m);
        transaction.Amount.Should().Be(150m);
        transaction.BalanceBefore.Should().Be(200m);
        transaction.BalanceAfter.Should().Be(350m);
        transaction.Type.Should().Be(WalletTransactionType.Deposit);
        transaction.Description.Should().Contain("Approve VietQR deposit #GTU-1406-40734: 150");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void DepositFromVietQr_ShouldThrow_WhenAmountIsNotPositive(decimal amount)
    {
        var wallet = new Wallet { Id = 11, UserId = 7, Balance = 200m };

        Action act = () => _service.DepositFromVietQr(wallet, amount, "GTU-1406-40734");

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.AmountMustBePositive);
    }

    [Fact]
    public void ChargeOrder_ShouldMutateBalanceAndReturnPurchaseTransaction()
    {
        var wallet = new Wallet { Id = 11, UserId = 7, Balance = 500m };

        var transaction = _service.ChargeOrder(wallet, 123, 120m);

        wallet.Balance.Should().Be(380m);
        transaction.Amount.Should().Be(-120m);
        transaction.BalanceBefore.Should().Be(500m);
        transaction.BalanceAfter.Should().Be(380m);
        transaction.Type.Should().Be(WalletTransactionType.PurchaseOrder);
        transaction.OrderId.Should().Be(123);
        transaction.Description.Should().Contain("Purchase order #123");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    public void ChargeOrder_ShouldThrow_WhenAmountIsNotPositive(decimal amount)
    {
        var wallet = new Wallet { Id = 11, UserId = 7, Balance = 500m };

        Action act = () => _service.ChargeOrder(wallet, 123, amount);

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.AmountMustBePositive);
    }

    [Fact]
    public void ChargeOrder_ShouldThrow_WhenBalanceWouldBeNegative()
    {
        var wallet = new Wallet { Id = 11, UserId = 7, Balance = 50m };

        Action act = () => _service.ChargeOrder(wallet, 123, 120m);

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InsufficientWalletBalance);
    }

    [Fact]
    public void RefundOrder_ShouldMutateBalanceAndReturnRefundTransaction()
    {
        var wallet = new Wallet { Id = 11, UserId = 7, Balance = 80m };

        var transaction = _service.RefundOrder(wallet, 321, 40m, "customer requested cancellation");

        wallet.Balance.Should().Be(120m);
        transaction.Amount.Should().Be(40m);
        transaction.BalanceBefore.Should().Be(80m);
        transaction.BalanceAfter.Should().Be(120m);
        transaction.Type.Should().Be(WalletTransactionType.Refund);
        transaction.OrderId.Should().Be(321);
        transaction.Description.Should().Contain("Refund order #321.");
        transaction.Description.Should().Contain("Reason: customer requested cancellation");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public void RefundOrder_ShouldThrow_WhenAmountIsNotPositive(decimal amount)
    {
        var wallet = new Wallet { Id = 11, UserId = 7, Balance = 80m };

        Action act = () => _service.RefundOrder(wallet, 321, amount, "reason");

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.AmountMustBePositive);
    }
}
