using FluentAssertions;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Options;
using GameTopUp.BLL.Services.Wallets;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.DAL.Interfaces.Wallets;
using Microsoft.Extensions.Options;
using Moq;

namespace GameTopUp.Tests.UnitTests.Services;

public class WalletDepositServiceTests
{
    private readonly Mock<IWalletDepositRepository> _repository = new();
    private readonly WalletDepositService _service;

    public WalletDepositServiceTests()
    {
        _service = CreateService(new VietQrSettings
        {
            BankId = "VCB",
            AccountNo = "123456789",
            AccountName = "GameTopUp",
            Template = "compact2"
        });
    }

    [Fact]
    public async Task GetByIdOrThrow_ShouldReturnDeposit_WhenOwner()
    {
        var actor = MemberContext(10);
        var deposit = CreateDeposit(actor.UserId);

        _repository
            .Setup(repo => repo.GetByIdAsync(deposit.Id))
            .ReturnsAsync(deposit);

        var result = await _service.GetByIdOrThrowAsync(actor, deposit.Id);

        result.Id.Should().Be(deposit.Id);
        result.UserId.Should().Be(actor.UserId);
        result.Amount.Should().Be(deposit.Amount);
    }

    [Fact]
    public async Task GetByIdOrThrow_ShouldReturnDeposit_WhenAdmin()
    {
        var admin = AdminContext(1);
        var deposit = CreateDeposit(userId: 10);

        _repository
            .Setup(repo => repo.GetByIdAsync(deposit.Id))
            .ReturnsAsync(deposit);

        var result = await _service.GetByIdOrThrowAsync(admin, deposit.Id);

        result.Id.Should().Be(deposit.Id);
        result.UserId.Should().Be(deposit.UserId);
    }

    [Fact]
    public async Task GetByIdOrThrow_ShouldThrowForbidden_WhenMemberReadsOtherUserDeposit()
    {
        var actor = MemberContext(20);
        var deposit = CreateDeposit(userId: 10);

        _repository
            .Setup(repo => repo.GetByIdAsync(deposit.Id))
            .ReturnsAsync(deposit);

        var act = () => _service.GetByIdOrThrowAsync(actor, deposit.Id);

        await act.Should()
            .ThrowAsync<ForbiddenException>()
            .Where(ex => ex.ErrorCode == ErrorCode.Forbidden);
    }

    [Fact]
    public async Task GetByIdOrThrow_ShouldThrowNotFound_WhenDepositDoesNotExist()
    {
        var actor = MemberContext(10);

        _repository
            .Setup(repo => repo.GetByIdAsync(999))
            .ReturnsAsync((WalletDeposit?)null);

        var act = () => _service.GetByIdOrThrowAsync(actor, 999);

        await act.Should()
            .ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.DepositRequestNotFound);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrow_WhenVietQrSettingsMissing()
    {
        var service = CreateService(new VietQrSettings());

        var act = () => service.CreateAsync(MemberContext(7), 100_000m);

        await act.Should()
            .ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.VietQrSettingsMissing);
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateDeposit_WhenSettingsAreValid()
    {
        WalletDeposit? created = null;

        _repository
            .Setup(repo => repo.CreateAsync(It.IsAny<WalletDeposit>()))
            .ReturnsAsync(123)
            .Callback<WalletDeposit>(deposit => created = deposit);

        await _service.CreateAsync(MemberContext(7), 100_000m);

        created.Should().NotBeNull();
        created!.UserId.Should().Be(7);
        created.Amount.Should().Be(100_000m);
        created.Code.Should().MatchRegex(@"^GTU-\d{4}-\d{5}$");
        created.TransferContent.Should().Be(created.Code);
        created.Status.Should().Be(WalletDepositStatus.Pending);
    }

    [Theory]
    [InlineData(0, ErrorCode.AmountMustBePositive)]
    [InlineData(-1, ErrorCode.AmountMustBePositive)]
    [InlineData(100000.5, ErrorCode.DepositAmountMustBeInteger)]
    public async Task CreateAsync_ShouldRejectInvalidAmount(decimal amount, ErrorCode expectedError)
    {
        var act = () => _service.CreateAsync(MemberContext(7), amount);

        await act.Should()
            .ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == expectedError);

        _repository.Verify(repo => repo.CreateAsync(It.IsAny<WalletDeposit>()), Times.Never);
    }

    [Fact]
    public void Confirm_ShouldMarkDepositConfirmed_WhenOwnerAndPending()
    {
        var deposit = CreateDeposit(userId: 7);

        _service.Confirm(deposit, MemberContext(7), DateTimeOffset.UtcNow);

        deposit.Status.Should().Be(WalletDepositStatus.UserConfirmed);
        deposit.UserConfirmedAt.Should().NotBeNull();
    }

    [Fact]
    public void Confirm_ShouldThrow_WhenActorDoesNotOwnDeposit()
    {
        var deposit = CreateDeposit(userId: 9);

        var act = () => _service.Confirm(deposit, MemberContext(7), DateTimeOffset.UtcNow);

        act.Should()
            .Throw<ForbiddenException>()
            .Where(ex => ex.ErrorCode == ErrorCode.Forbidden);
    }

    [Fact]
    public void Confirm_ShouldThrow_WhenDepositIsNotPending()
    {
        var deposit = CreateDeposit(userId: 7);
        deposit.Status = WalletDepositStatus.Approved;

        var act = () => _service.Confirm(deposit, MemberContext(7), DateTimeOffset.UtcNow);

        act.Should()
            .Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InvalidDepositStatus);
    }

    [Fact]
    public void Approve_ShouldMarkDepositApproved_WhenConfirmed()
    {
        var deposit = CreateDeposit(userId: 7);
        deposit.MarkUserConfirmed(DateTimeOffset.UtcNow);

        _service.Approve(deposit, AdminContext(1), DateTimeOffset.UtcNow, "verified");

        deposit.Status.Should().Be(WalletDepositStatus.Approved);
        deposit.ReviewedBy.Should().Be(1);
        deposit.AdminNote.Should().Be("verified");
        deposit.ReviewedAt.Should().NotBeNull();
    }

    [Fact]
    public void Approve_ShouldThrow_WhenDepositIsNotConfirmed()
    {
        var deposit = CreateDeposit(userId: 7);

        var act = () => _service.Approve(deposit, AdminContext(1), DateTimeOffset.UtcNow, "verified");

        act.Should()
            .Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InvalidDepositStatus);
    }

    [Fact]
    public void Reject_ShouldMarkDepositRejected_WhenDepositIsNotApproved()
    {
        var deposit = CreateDeposit(userId: 7);
        deposit.MarkUserConfirmed(DateTimeOffset.UtcNow);

        _service.Reject(deposit, AdminContext(1), DateTimeOffset.UtcNow, "not enough proof");

        deposit.Status.Should().Be(WalletDepositStatus.Rejected);
        deposit.ReviewedBy.Should().Be(1);
        deposit.AdminNote.Should().Be("not enough proof");
        deposit.ReviewedAt.Should().NotBeNull();
    }

    [Fact]
    public void Reject_ShouldThrow_WhenDepositWasAlreadyApproved()
    {
        var deposit = CreateDeposit(userId: 7);
        deposit.Status = WalletDepositStatus.Approved;

        var act = () => _service.Reject(deposit, AdminContext(1), DateTimeOffset.UtcNow, "too late");

        act.Should()
            .Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InvalidDepositStatus);
    }

    private WalletDepositService CreateService(VietQrSettings settings)
    {
        return new WalletDepositService(_repository.Object, Options.Create(settings));
    }

    private static WalletDeposit CreateDeposit(long userId, decimal amount = 100_000m)
    {
        return WalletDeposit.Create(userId, amount, "CODE", "CODE");
    }

    private static UserContext MemberContext(long userId)
    {
        return new UserContext
        {
            UserId = userId,
            Role = UserRole.Member
        };
    }

    private static UserContext AdminContext(long userId)
    {
        return new UserContext
        {
            UserId = userId,
            Role = UserRole.Admin
        };
    }
}