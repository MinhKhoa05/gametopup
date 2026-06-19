using FluentAssertions;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Options;
using GameTopUp.BLL.Services;
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
    public async Task CreateAsync_ShouldThrow_WhenVietQrSettingsMissing()
    {
        var service = CreateService(new VietQrSettings());

        var act = async () => await service.CreateAsync(new UserContext { UserId = 7 }, 100000m);

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.VietQrSettingsMissing);
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateRequest_WhenSettingsAreValid()
    {
        WalletDeposit? created = null;
        _repository
            .Setup(repo => repo.CreateAsync(It.IsAny<WalletDeposit>()))
            .ReturnsAsync(123)
            .Callback<WalletDeposit>(request => created = request);

        await _service.CreateAsync(new UserContext { UserId = 7 }, 100000m);

        created.Should().NotBeNull();
        created!.Amount.Should().Be(100000m);
        created.Code.Should().MatchRegex(@"^GTU-\d{4}-\d{5}$");
        created.TransferContent.Should().Be(created.Code);
        created.Status.Should().Be(WalletDepositStatus.Pending);
    }

    [Fact]
    public async Task CreateAsync_ShouldUseDefaultTemplate_WhenTemplateIsMissing()
    {
        WalletDeposit? created = null;
        _repository
            .Setup(repo => repo.CreateAsync(It.IsAny<WalletDeposit>()))
            .ReturnsAsync(123)
            .Callback<WalletDeposit>(request => created = request);

        var service = CreateService(new VietQrSettings
        {
            BankId = "VCB",
            AccountNo = "123456789",
            AccountName = "GameTopUp",
            Template = "   "
        });

        var response = await service.CreateAsync(new UserContext { UserId = 7 }, 100000m);

        response.QrImageUrl.Should().Contain("-compact2.png");
        response.QrImageUrl.Should().NotContain("?");
        created.Should().NotBeNull();
        created!.Status.Should().Be(WalletDepositStatus.Pending);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task CreateAsync_ShouldThrow_WhenAmountIsNotPositive(decimal amount)
    {
        var act = async () => await _service.CreateAsync(new UserContext { UserId = 7 }, amount);

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.AmountMustBePositive);

        _repository.Verify(repo => repo.CreateAsync(It.IsAny<WalletDeposit>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrow_WhenAmountIsNotAnInteger()
    {
        var act = async () => await _service.CreateAsync(new UserContext { UserId = 7 }, 100000.5m);

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.DepositAmountMustBeInteger);

        _repository.Verify(repo => repo.CreateAsync(It.IsAny<WalletDeposit>()), Times.Never);
    }

    [Fact]
    public void Confirm_ShouldMarkRequestConfirmed_WhenOwnerAndPending()
    {
        var request = WalletDeposit.Create(7, 100000m, "CODE", "CODE");

        var result = _service.Confirm(request, new UserContext { UserId = 7 }, DateTime.UtcNow);

        result.Should().BeSameAs(request);
        request.Status.Should().Be(WalletDepositStatus.UserConfirmed);
        request.UserConfirmedAt.Should().NotBeNull();
    }

    [Fact]
    public void Confirm_ShouldThrow_WhenActorDoesNotOwnRequest()
    {
        var request = WalletDeposit.Create(9, 100000m, "CODE", "CODE");

        var act = () => _service.Confirm(request, new UserContext { UserId = 7 }, DateTime.UtcNow);

        act.Should().Throw<ForbiddenException>()
            .Where(ex => ex.ErrorCode == ErrorCode.DepositRequestForbidden);
    }

    [Fact]
    public void Confirm_ShouldThrow_WhenRequestIsNotPending()
    {
        var request = WalletDeposit.Create(7, 100000m, "CODE", "CODE");
        request.Status = WalletDepositStatus.Approved;

        var act = () => _service.Confirm(request, new UserContext { UserId = 7 }, DateTime.UtcNow);

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.DepositConfirmOnlyPending);
    }

    [Fact]
    public void Approve_ShouldMarkRequestApproved_WhenConfirmed()
    {
        var request = WalletDeposit.Create(7, 100000m, "CODE", "CODE");
        request.MarkUserConfirmed(DateTime.UtcNow);

        var result = _service.Approve(request, new UserContext { UserId = 1 }, DateTime.UtcNow, "verified");

        result.Should().BeSameAs(request);
        request.Status.Should().Be(WalletDepositStatus.Approved);
        request.ReviewedBy.Should().Be(1);
        request.AdminNote.Should().Be("verified");
        request.ReviewedAt.Should().NotBeNull();
    }

    [Fact]
    public void Approve_ShouldThrow_WhenRequestIsNotConfirmed()
    {
        var request = WalletDeposit.Create(7, 100000m, "CODE", "CODE");

        var act = () => _service.Approve(request, new UserContext { UserId = 1 }, DateTime.UtcNow, "verified");

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.DepositApproveOnlyUserConfirmed);
    }

    [Fact]
    public void Reject_ShouldMarkRequestRejected_WhenRequestIsNotApproved()
    {
        var request = WalletDeposit.Create(7, 100000m, "CODE", "CODE");
        request.MarkUserConfirmed(DateTime.UtcNow);

        var result = _service.Reject(request, new UserContext { UserId = 1 }, DateTime.UtcNow, "not enough proof");

        result.Should().BeSameAs(request);
        request.Status.Should().Be(WalletDepositStatus.Rejected);
        request.ReviewedBy.Should().Be(1);
        request.AdminNote.Should().Be("not enough proof");
        request.ReviewedAt.Should().NotBeNull();
    }

    [Fact]
    public void Reject_ShouldThrow_WhenRequestWasAlreadyApproved()
    {
        var request = WalletDeposit.Create(7, 100000m, "CODE", "CODE");
        request.Status = WalletDepositStatus.Approved;

        var act = () => _service.Reject(request, new UserContext { UserId = 1 }, DateTime.UtcNow, "too late");

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.ApprovedDepositCannotBeRejected);
    }

    private WalletDepositService CreateService(VietQrSettings settings)
    {
        return new WalletDepositService(_repository.Object, Options.Create(settings));
    }
}
