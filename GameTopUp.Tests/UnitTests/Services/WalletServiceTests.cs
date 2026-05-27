using Moq;
using GameTopUp.DAL.Interfaces.Wallets;
using GameTopUp.BLL.Services;
using GameTopUp.DAL.Entities;
using GameTopUp.BLL.Exceptions;
using Xunit;
using FluentAssertions;

namespace GameTopUp.Tests.UnitTests.Services
{
    public class WalletServiceTests
    {
        private readonly Mock<IWalletRepository> _walletRepoMock;
        private readonly Mock<IWalletTransactionRepository> _walletTxRepoMock;
        private readonly WalletService _walletService;

        public WalletServiceTests()
        {
            _walletRepoMock = new Mock<IWalletRepository>();
            _walletTxRepoMock = new Mock<IWalletTransactionRepository>();
            _walletService = new WalletService(_walletRepoMock.Object, _walletTxRepoMock.Object);
        }

        [Fact]
        public async Task DepositAsync_ShouldUpdateBalanceAndRecordHistory()
        {
            // Arrange
            var wallet = new Wallet { Id = 1, UserId = 1, Balance = 100 };
            decimal amount = 50;
            _walletRepoMock.Setup(r => r.GetWithLockByUserIdAsync(1)).ReturnsAsync(wallet);
            _walletRepoMock.Setup(r => r.UpdateBalanceAsync(wallet.Id, 150)).ReturnsAsync(1);
            
            WalletTransaction? createdTx = null;
            _walletTxRepoMock.Setup(r => r.CreateAsync(It.IsAny<WalletTransaction>()))
                .Callback<WalletTransaction>(tx => createdTx = tx)
                .ReturnsAsync(999);

            // Act
            await _walletService.DepositAsync(1, amount);

            // Assert
            wallet.Balance.Should().Be(150);
            
            createdTx.Should().NotBeNull();
            createdTx!.Amount.Should().Be(amount);
            createdTx.BalanceBefore.Should().Be(100);
            createdTx.BalanceAfter.Should().Be(150);
        }

        [Fact]
        public async Task WithdrawAsync_ShouldUpdateBalanceAndRecordHistory()
        {
            // Arrange
            var wallet = new Wallet { Id = 1, UserId = 1, Balance = 200 };
            decimal amount = 80;
            _walletRepoMock.Setup(r => r.GetWithLockByUserIdAsync(1)).ReturnsAsync(wallet);
            _walletRepoMock.Setup(r => r.UpdateBalanceAsync(wallet.Id, 120)).ReturnsAsync(1);
            
            WalletTransaction? createdTx = null;
            _walletTxRepoMock.Setup(r => r.CreateAsync(It.IsAny<WalletTransaction>()))
                .Callback<WalletTransaction>(tx => createdTx = tx)
                .ReturnsAsync(999);

            // Act
            await _walletService.WithdrawAsync(1, amount);

            // Assert
            wallet.Balance.Should().Be(120);
            
            createdTx.Should().NotBeNull();
            createdTx!.Amount.Should().Be(-amount);
            createdTx.BalanceBefore.Should().Be(200);
            createdTx.BalanceAfter.Should().Be(120);
        }

        [Fact]
        public async Task WithdrawAsync_ShouldThrow_WhenBalanceInsufficient()
        {
            // Arrange
            var wallet = new Wallet { Id = 1, UserId = 1, Balance = 50 };
            decimal amount = 100;
            _walletRepoMock.Setup(r => r.GetWithLockByUserIdAsync(1)).ReturnsAsync(wallet);

            // Act
            Func<Task> act = () => _walletService.WithdrawAsync(1, amount);

            // Assert
            await act.Should().ThrowAsync<BusinessException>().WithMessage("Số dư ví không đủ*");
        }
    }
}
