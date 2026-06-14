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

public class WalletDepositRequestServiceTests
{
    private readonly Mock<IWalletDepositRequestRepository> _repository = new();
    private readonly WalletDepositRequestService _service;

    public WalletDepositRequestServiceTests()
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
        WalletDepositRequest? created = null;
        _repository
            .Setup(repo => repo.CreateAsync(It.IsAny<WalletDepositRequest>()))
            .ReturnsAsync(123)
            .Callback<WalletDepositRequest>(request => created = request);

        var response = await _service.CreateAsync(new UserContext { UserId = 7 }, 100000m);

        response.Id.Should().Be(123);
        response.Code.Should().MatchRegex(@"^GTU-\d{4}-\d{5}$");
        response.TransferContent.Should().Be(response.Code);
        response.QrImageUrl.Should().Contain("-compact2.png");
        response.QrImageUrl.Should().NotContain("?");
        created.Should().NotBeNull();
        created!.Amount.Should().Be(100000m);
        created.Code.Should().MatchRegex(@"^GTU-\d{4}-\d{5}$");
        created.TransferContent.Should().Be(created.Code);
        created.Status.Should().Be(WalletDepositRequestStatus.Pending);
    }

    [Fact]
    public async Task CreateAsync_ShouldUseDefaultTemplate_WhenTemplateIsMissing()
    {
        WalletDepositRequest? created = null;
        _repository
            .Setup(repo => repo.CreateAsync(It.IsAny<WalletDepositRequest>()))
            .ReturnsAsync(123)
            .Callback<WalletDepositRequest>(request => created = request);

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
        created!.Status.Should().Be(WalletDepositRequestStatus.Pending);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task CreateAsync_ShouldThrow_WhenAmountIsNotPositive(decimal amount)
    {
        var act = async () => await _service.CreateAsync(new UserContext { UserId = 7 }, amount);

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.AmountMustBePositive);

        _repository.Verify(repo => repo.CreateAsync(It.IsAny<WalletDepositRequest>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrow_WhenAmountIsNotAnInteger()
    {
        var act = async () => await _service.CreateAsync(new UserContext { UserId = 7 }, 100000.5m);

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.DepositAmountMustBeInteger);

        _repository.Verify(repo => repo.CreateAsync(It.IsAny<WalletDepositRequest>()), Times.Never);
    }

    [Fact]
    public async Task ConfirmTransferAsync_ShouldThrow_WhenRequestBelongsToAnotherUser()
    {
        _repository.Setup(repo => repo.GetWithLockByIdAsync(5))
            .ReturnsAsync(WalletDepositRequest.Create(9, 100000m, "GTU-1406-40734", "GTU-1406-40734"));

        var act = async () => await _service.ConfirmTransferAsync(5, new UserContext { UserId = 7 });

        await act.Should().ThrowAsync<ForbiddenException>()
            .Where(ex => ex.ErrorCode == ErrorCode.DepositRequestForbidden);
    }

    [Fact]
    public async Task ConfirmTransferAsync_ShouldBeIdempotent_WhenRequestWasAlreadyConfirmed()
    {
        var request = WalletDepositRequest.Create(7, 100000m, "GTU-1406-40734", "GTU-1406-40734");
        request.MarkUserConfirmed(DateTime.UtcNow);
        _repository.Setup(repo => repo.GetWithLockByIdAsync(5))
            .ReturnsAsync(request);

        var response = await _service.ConfirmTransferAsync(5, new UserContext { UserId = 7 });

        response.Status.Should().Be(WalletDepositRequestStatus.UserConfirmed);
        _repository.Verify(repo => repo.UpdateAsync(It.IsAny<WalletDepositRequest>()), Times.Never);
    }

    [Fact]
    public async Task ConfirmTransferAsync_ShouldThrow_WhenRequestIsNotPending()
    {
        var request = WalletDepositRequest.Create(7, 100000m, "GTU-1406-40734", "GTU-1406-40734");
        request.Status = WalletDepositRequestStatus.Approved;
        _repository.Setup(repo => repo.GetWithLockByIdAsync(5))
            .ReturnsAsync(request);

        var act = async () => await _service.ConfirmTransferAsync(5, new UserContext { UserId = 7 });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.DepositConfirmOnlyPending);
    }

    [Fact]
    public async Task ConfirmTransferAsync_ShouldThrow_WhenRequestDoesNotExist()
    {
        _repository.Setup(repo => repo.GetWithLockByIdAsync(5))
            .ReturnsAsync((WalletDepositRequest?)null);

        var act = async () => await _service.ConfirmTransferAsync(5, new UserContext { UserId = 7 });

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.DepositRequestNotFound);
    }

    [Fact]
    public async Task MarkApprovedAsync_ShouldBeIdempotent_WhenAlreadyApproved()
    {
        var request = WalletDepositRequest.Create(7, 100000m, "GTU-1406-40734", "GTU-1406-40734");
        request.Status = WalletDepositRequestStatus.Approved;

        await _service.MarkApprovedAsync(request, new UserContext { UserId = 1, Role = GameTopUp.DAL.Entities.Users.UserRole.Admin });

        _repository.Verify(repo => repo.UpdateAsync(It.IsAny<WalletDepositRequest>()), Times.Never);
    }

    [Fact]
    public async Task MarkApprovedAsync_ShouldThrow_WhenRequestWasNotConfirmedByUser()
    {
        var request = WalletDepositRequest.Create(7, 100000m, "GTU-1406-40734", "GTU-1406-40734");

        var act = async () => await _service.MarkApprovedAsync(request, new UserContext { UserId = 1, Role = GameTopUp.DAL.Entities.Users.UserRole.Admin });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.DepositApproveOnlyUserConfirmed);
    }

    [Fact]
    public async Task MarkRejectedAsync_ShouldBeIdempotent_WhenAlreadyRejected()
    {
        var request = WalletDepositRequest.Create(7, 100000m, "GTU-1406-40734", "GTU-1406-40734");
        request.Status = WalletDepositRequestStatus.Rejected;

        await _service.MarkRejectedAsync(request, new UserContext { UserId = 1, Role = GameTopUp.DAL.Entities.Users.UserRole.Admin });

        _repository.Verify(repo => repo.UpdateAsync(It.IsAny<WalletDepositRequest>()), Times.Never);
    }

    [Fact]
    public async Task MarkRejectedAsync_ShouldThrow_WhenRequestWasAlreadyApproved()
    {
        var request = WalletDepositRequest.Create(7, 100000m, "GTU-1406-40734", "GTU-1406-40734");
        request.Status = WalletDepositRequestStatus.Approved;

        var act = async () => await _service.MarkRejectedAsync(request, new UserContext { UserId = 1, Role = GameTopUp.DAL.Entities.Users.UserRole.Admin });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.ApprovedDepositCannotBeRejected);
    }

    [Fact]
    public async Task GetWithLockByIdOrThrowAsync_ShouldThrow_WhenRequestDoesNotExist()
    {
        _repository.Setup(repo => repo.GetWithLockByIdAsync(5))
            .ReturnsAsync((WalletDepositRequest?)null);

        var act = async () => await _service.GetWithLockByIdOrThrowAsync(5);

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.DepositRequestNotFound);
    }

    [Fact]
    public async Task MapToResponse_ShouldIncludeBankDetailsAndCurrentStatus()
    {
        var request = WalletDepositRequest.Create(7, 100000m, "GTU-1406-40734", "GTU-1406-40734");
        request.Id = 99;
        request.Status = WalletDepositRequestStatus.UserConfirmed;

        var response = _service.MapToResponse(request);

        response.Id.Should().Be(99);
        response.UserId.Should().Be(7);
        response.Amount.Should().Be(100000m);
        response.Code.Should().Be("GTU-1406-40734");
        response.TransferContent.Should().Be("GTU-1406-40734");
        response.QrImageUrl.Should().Contain("https://img.vietqr.io/image/");
        response.BankId.Should().Be("VCB");
        response.AccountNo.Should().Be("123456789");
        response.AccountName.Should().Be("GameTopUp");
        response.Status.Should().Be(WalletDepositRequestStatus.UserConfirmed);
    }

    private WalletDepositRequestService CreateService(VietQrSettings settings)
    {
        return new WalletDepositRequestService(_repository.Object, Options.Create(settings));
    }
}
