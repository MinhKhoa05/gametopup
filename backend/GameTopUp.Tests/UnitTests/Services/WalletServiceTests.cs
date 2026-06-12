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
    public async Task GetBalanceAsync_ShouldReturnBalance_WhenWalletExists()
    {
        _walletRepository
            .Setup(repo => repo.GetByUserIdAsync(7))
            .ReturnsAsync(new Wallet { Id = 9, UserId = 7, Balance = 125000m });

        var balance = await _service.GetBalanceAsync(new UserContext { UserId = 7 });

        balance.Should().Be(125000m);
    }

    [Fact]
    public async Task DepositAsync_ShouldCreateTransaction_WhenAmountIsValid()
    {
        var wallet = new Wallet { Id = 9, UserId = 7, Balance = 100000m };
        WalletTransaction? createdTransaction = null;

        _walletRepository
            .Setup(repo => repo.GetWithLockByUserIdAsync(7))
            .ReturnsAsync(wallet);
        _walletRepository
            .Setup(repo => repo.UpdateBalanceAsync(wallet.Id, 150000m))
            .ReturnsAsync(1);
        _transactionRepository
            .Setup(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()))
            .ReturnsAsync(42)
            .Callback<WalletTransaction>(transaction => createdTransaction = transaction);

        var result = await _service.DepositAsync(7, 50000m);

        result.TransactionId.Should().Be(42);
        createdTransaction.Should().NotBeNull();
        createdTransaction!.Amount.Should().Be(50000m);
        createdTransaction.BalanceBefore.Should().Be(100000m);
        createdTransaction.BalanceAfter.Should().Be(150000m);
        createdTransaction.Type.Should().Be(WalletTransactionType.Deposit);
    }

    [Fact]
    public async Task PayOrderAsync_ShouldThrow_WhenWalletBalanceIsInsufficient()
    {
        _walletRepository
            .Setup(repo => repo.GetWithLockByUserIdAsync(7))
            .ReturnsAsync(new Wallet { Id = 9, UserId = 7, Balance = 10000m });

        var act = async () => await _service.PayOrderAsync(7, 55, 15000m);

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InsufficientWalletBalance);
    }
}
