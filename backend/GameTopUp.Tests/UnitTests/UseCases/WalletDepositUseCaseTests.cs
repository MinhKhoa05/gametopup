using FluentAssertions;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Options;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.UseCases;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.DAL.Interfaces.Wallets;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Options;
using Moq;

namespace GameTopUp.Tests.UnitTests.UseCases;

public class WalletDepositUseCaseTests : IDisposable
{
    private readonly Mock<IWalletRepository> _walletRepository = new();
    private readonly Mock<IWalletTransactionRepository> _walletTransactionRepository = new();
    private readonly Mock<IWalletDepositRepository> _depositRequestRepository = new();
    private readonly DatabaseContext _database;
    private readonly WalletDepositUseCase _useCase;
    private readonly WalletDepositService _depositRequestService;

    public WalletDepositUseCaseTests()
    {
        _database = CreateDatabaseContext();

        var walletService = new WalletService(_walletRepository.Object, _walletTransactionRepository.Object);
        _depositRequestService = new WalletDepositService(
            _depositRequestRepository.Object,
            Options.Create(new VietQrSettings
            {
                BankId = "VCB",
                AccountNo = "123456789",
                AccountName = "GameTopUp"
            }));

        _useCase = new WalletDepositUseCase(
            walletService,
            _depositRequestService,
            _depositRequestRepository.Object,
            _walletRepository.Object,
            _walletTransactionRepository.Object,
            _database);
    }

    [Fact]
    public async Task ConfirmDepositTransferAsync_ShouldMarkRequestUserConfirmed()
    {
        var request = WalletDeposit.Create(7, 100000m, "GTU7CODE", "NAP GTU7CODE");

        _depositRequestRepository.Setup(repo => repo.GetWithLockByIdAsync(5))
            .ReturnsAsync(request);
        _depositRequestRepository.Setup(repo => repo.UpdateAsync(It.IsAny<WalletDeposit>()))
            .ReturnsAsync(true);

        var response = await _useCase.ConfirmDepositTransferAsync(5, new UserContext { UserId = 7 });

        response.Status.Should().Be(WalletDepositStatus.UserConfirmed);
        request.Status.Should().Be(WalletDepositStatus.UserConfirmed);
        request.UserConfirmedAt.Should().NotBeNull();
        _depositRequestRepository.Verify(repo => repo.GetWithLockByIdAsync(5), Times.Once);
        _depositRequestRepository.Verify(repo => repo.UpdateAsync(request), Times.Once);
    }

    [Fact]
    public async Task ConfirmDepositTransferAsync_ShouldBeIdempotent_WhenRequestWasAlreadyConfirmed()
    {
        var request = WalletDeposit.Create(7, 100000m, "GTU7CODE", "NAP GTU7CODE");
        request.MarkUserConfirmed(DateTime.UtcNow);

        _depositRequestRepository.Setup(repo => repo.GetWithLockByIdAsync(5))
            .ReturnsAsync(request);

        var response = await _useCase.ConfirmDepositTransferAsync(5, new UserContext { UserId = 7 });

        response.Status.Should().Be(WalletDepositStatus.UserConfirmed);
        _depositRequestRepository.Verify(repo => repo.GetWithLockByIdAsync(5), Times.Once);
        _depositRequestRepository.Verify(repo => repo.UpdateAsync(It.IsAny<WalletDeposit>()), Times.Never);
    }

    [Fact]
    public async Task ConfirmDepositTransferAsync_ShouldThrow_WhenRequestBelongsToAnotherUser()
    {
        var request = WalletDeposit.Create(9, 100000m, "GTU7CODE", "NAP GTU7CODE");

        _depositRequestRepository.Setup(repo => repo.GetWithLockByIdAsync(5))
            .ReturnsAsync(request);

        var act = async () => await _useCase.ConfirmDepositTransferAsync(5, new UserContext { UserId = 7 });

        await act.Should().ThrowAsync<ForbiddenException>()
            .Where(ex => ex.ErrorCode == ErrorCode.DepositRequestForbidden);
        _depositRequestRepository.Verify(repo => repo.GetWithLockByIdAsync(5), Times.Once);
        _depositRequestRepository.Verify(repo => repo.UpdateAsync(It.IsAny<WalletDeposit>()), Times.Never);
    }

    [Fact]
    public async Task ConfirmDepositTransferAsync_ShouldThrow_WhenRequestIsNotPending()
    {
        var request = WalletDeposit.Create(7, 100000m, "GTU7CODE", "NAP GTU7CODE");
        request.Status = WalletDepositStatus.Approved;

        _depositRequestRepository.Setup(repo => repo.GetWithLockByIdAsync(5))
            .ReturnsAsync(request);

        var act = async () => await _useCase.ConfirmDepositTransferAsync(5, new UserContext { UserId = 7 });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.DepositConfirmOnlyPending);
        _depositRequestRepository.Verify(repo => repo.GetWithLockByIdAsync(5), Times.Once);
        _depositRequestRepository.Verify(repo => repo.UpdateAsync(It.IsAny<WalletDeposit>()), Times.Never);
    }

    [Fact]
    public async Task ApproveDepositRequestAsync_ShouldCreditWalletAndMarkRequestApproved()
    {
        WalletTransaction? createdTransaction = null;
        var request = WalletDeposit.Create(7, 100000m, "GTU7CODE", "NAP GTU7CODE");
        request.MarkUserConfirmed(DateTime.UtcNow);

        _depositRequestRepository.Setup(repo => repo.GetWithLockByIdAsync(5))
            .ReturnsAsync(request);
        _depositRequestRepository.Setup(repo => repo.UpdateAsync(It.IsAny<WalletDeposit>()))
            .ReturnsAsync(true);
        _walletRepository.Setup(repo => repo.GetWithLockByUserIdAsync(7))
            .ReturnsAsync(new Wallet
            {
                Id = 11,
                UserId = 7,
                Balance = 0m
            });
        _walletRepository.Setup(repo => repo.UpdateBalanceAsync(11, 100000m))
            .ReturnsAsync(1);
        _walletTransactionRepository.Setup(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()))
            .ReturnsAsync(101)
            .Callback<WalletTransaction>(transaction => createdTransaction = transaction);

        var response = await _useCase.ApproveDepositRequestAsync(5, new UserContext
        {
            UserId = 1,
            DisplayName = "Admin",
            Role = DAL.Entities.Users.UserRole.Admin
        }, "verified");

        response.Status.Should().Be(WalletDepositStatus.Approved);
        request.Status.Should().Be(WalletDepositStatus.Approved);
        request.ReviewedBy.Should().Be(1);
        request.AdminNote.Should().Be("verified");
        _depositRequestRepository.Verify(repo => repo.GetWithLockByIdAsync(5), Times.Once);
        createdTransaction.Should().NotBeNull();
        createdTransaction!.Type.Should().Be(WalletTransactionType.Deposit);
        createdTransaction.Amount.Should().Be(100000m);
        createdTransaction.BalanceBefore.Should().Be(0m);
        createdTransaction.BalanceAfter.Should().Be(100000m);
        request.ReviewedBy.Should().Be(1);
        request.AdminNote.Should().Be("verified");
    }

    [Fact]
    public async Task ApproveDepositRequestAsync_ShouldBeIdempotent_WhenRequestIsAlreadyApproved()
    {
        var request = WalletDeposit.Create(7, 100000m, "GTU7CODE", "NAP GTU7CODE");
        request.Status = WalletDepositStatus.Approved;

        _depositRequestRepository.Setup(repo => repo.GetWithLockByIdAsync(5))
            .ReturnsAsync(request);

        var response = await _useCase.ApproveDepositRequestAsync(5, new UserContext
        {
            UserId = 1,
            DisplayName = "Admin",
            Role = DAL.Entities.Users.UserRole.Admin
        }, "verified");

        response.Status.Should().Be(WalletDepositStatus.Approved);
        _walletRepository.Verify(repo => repo.GetWithLockByUserIdAsync(It.IsAny<long>()), Times.Never);
        _depositRequestRepository.Verify(repo => repo.UpdateAsync(It.IsAny<WalletDeposit>()), Times.Never);
        _walletTransactionRepository.Verify(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()), Times.Never);
        _depositRequestRepository.Verify(repo => repo.GetWithLockByIdAsync(5), Times.Once);
    }

    [Fact]
    public async Task ApproveDepositRequestAsync_ShouldThrow_WhenRequestIsNotUserConfirmed()
    {
        var request = WalletDeposit.Create(7, 100000m, "GTU7CODE", "NAP GTU7CODE");

        _depositRequestRepository.Setup(repo => repo.GetWithLockByIdAsync(5))
            .ReturnsAsync(request);

        var act = async () => await _useCase.ApproveDepositRequestAsync(5, new UserContext
        {
            UserId = 1,
            DisplayName = "Admin",
            Role = DAL.Entities.Users.UserRole.Admin
        }, "verified");

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.DepositApproveOnlyUserConfirmed);
        _depositRequestRepository.Verify(repo => repo.GetWithLockByIdAsync(5), Times.Once);
        _depositRequestRepository.Verify(repo => repo.UpdateAsync(It.IsAny<WalletDeposit>()), Times.Never);
        _walletRepository.Verify(repo => repo.GetWithLockByUserIdAsync(It.IsAny<long>()), Times.Never);
    }

    [Fact]
    public async Task RejectDepositRequestAsync_ShouldMarkRequestRejected()
    {
        var request = WalletDeposit.Create(7, 100000m, "GTU7CODE", "NAP GTU7CODE");
        request.MarkUserConfirmed(DateTime.UtcNow);

        _depositRequestRepository.Setup(repo => repo.GetWithLockByIdAsync(5))
            .ReturnsAsync(request);
        _depositRequestRepository.Setup(repo => repo.UpdateAsync(It.IsAny<WalletDeposit>()))
            .ReturnsAsync(true);

        var response = await _useCase.RejectDepositRequestAsync(5, new UserContext
        {
            UserId = 1,
            DisplayName = "Admin",
            Role = DAL.Entities.Users.UserRole.Admin
        }, "not enough proof");

        response.Status.Should().Be(WalletDepositStatus.Rejected);
        request.Status.Should().Be(WalletDepositStatus.Rejected);
        request.ReviewedBy.Should().Be(1);
        request.AdminNote.Should().Be("not enough proof");
        _depositRequestRepository.Verify(repo => repo.GetWithLockByIdAsync(5), Times.Once);
        _walletRepository.Verify(repo => repo.UpdateBalanceAsync(It.IsAny<long>(), It.IsAny<decimal>()), Times.Never);
        _walletTransactionRepository.Verify(repo => repo.CreateAsync(It.IsAny<WalletTransaction>()), Times.Never);
    }

    [Fact]
    public async Task RejectDepositRequestAsync_ShouldBeIdempotent_WhenRequestWasAlreadyRejected()
    {
        var request = WalletDeposit.Create(7, 100000m, "GTU7CODE", "NAP GTU7CODE");
        request.Status = WalletDepositStatus.Rejected;

        _depositRequestRepository.Setup(repo => repo.GetWithLockByIdAsync(5))
            .ReturnsAsync(request);

        var response = await _useCase.RejectDepositRequestAsync(5, new UserContext
        {
            UserId = 1,
            DisplayName = "Admin",
            Role = DAL.Entities.Users.UserRole.Admin
        }, "not enough proof");

        response.Status.Should().Be(WalletDepositStatus.Rejected);
        _depositRequestRepository.Verify(repo => repo.GetWithLockByIdAsync(5), Times.Once);
        _depositRequestRepository.Verify(repo => repo.UpdateAsync(It.IsAny<WalletDeposit>()), Times.Never);
    }

    [Fact]
    public async Task RejectDepositRequestAsync_ShouldThrow_WhenRequestWasAlreadyApproved()
    {
        var request = WalletDeposit.Create(7, 100000m, "GTU7CODE", "NAP GTU7CODE");
        request.Status = WalletDepositStatus.Approved;

        _depositRequestRepository.Setup(repo => repo.GetWithLockByIdAsync(5))
            .ReturnsAsync(request);

        var act = async () => await _useCase.RejectDepositRequestAsync(5, new UserContext
        {
            UserId = 1,
            DisplayName = "Admin",
            Role = DAL.Entities.Users.UserRole.Admin
        }, "too late");

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.ApprovedDepositCannotBeRejected);
        _depositRequestRepository.Verify(repo => repo.GetWithLockByIdAsync(5), Times.Once);
        _depositRequestRepository.Verify(repo => repo.UpdateAsync(It.IsAny<WalletDeposit>()), Times.Never);
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
