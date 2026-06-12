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

        var service = CreateService(new VietQrSettings
        {
            BankId = "VCB",
            AccountNo = "123456789",
            AccountName = "GameTopUp",
            Template = "compact2"
        });

        var response = await service.CreateAsync(new UserContext { UserId = 7 }, 100000m);

        response.Id.Should().Be(123);
        response.Code.Should().StartWith("GTU7");
        response.TransferContent.Should().StartWith("NAP GTU7");
        created.Should().NotBeNull();
        created!.Amount.Should().Be(100000m);
        created.Status.Should().Be(WalletDepositRequestStatus.Pending);
    }

    private WalletDepositRequestService CreateService(VietQrSettings settings)
    {
        return new WalletDepositRequestService(_repository.Object, Options.Create(settings));
    }
}
