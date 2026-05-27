using FluentAssertions;
using GameTopUp.DAL.Interfaces.Wallets;
using GameTopUp.BLL.Common;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Options;
using GameTopUp.BLL.Services;
using GameTopUp.DAL.Entities;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace GameTopUp.Tests.UnitTests.Services
{
    public class WalletDepositRequestServiceTests
    {
        private readonly Mock<IWalletDepositRequestRepository> _depositRequestRepoMock = new();

        [Fact]
        public async Task CreateAsync_ShouldCreatePendingRequestWithVietQrUrl()
        {
            var service = CreateService();
            var user = new UserContext(12, "member", "Member");

            WalletDepositRequest? createdRequest = null;
            _depositRequestRepoMock.Setup(r => r.CreateAsync(It.IsAny<WalletDepositRequest>()))
                .Callback<WalletDepositRequest>(request => createdRequest = request)
                .ReturnsAsync(99);

            var response = await service.CreateAsync(user, 50000);

            response.Id.Should().Be(99);
            response.Amount.Should().Be(50000);
            response.Status.Should().Be(WalletDepositRequestStatus.Pending);
            response.TransferContent.Should().StartWith("NAP GTU12");
            response.QrImageUrl.Should().Contain("https://img.vietqr.io/image/mbbank-123456789-compact2.png");
            response.QrImageUrl.Should().Contain("amount=50000");
            response.QrImageUrl.Should().Contain("addInfo=NAP%20GTU12");

            createdRequest.Should().NotBeNull();
            createdRequest!.UserId.Should().Be(12);
            createdRequest.Status.Should().Be(WalletDepositRequestStatus.Pending);
        }

        [Fact]
        public async Task CreateAsync_ShouldThrow_WhenAmountHasDecimalFraction()
        {
            var service = CreateService();

            Func<Task> act = () => service.CreateAsync(new UserContext(1, "member", "Member"), 1000.5m);

            await act.Should().ThrowAsync<BusinessException>()
                .WithMessage("Số tiền nạp VietQR phải là số nguyên VNĐ.");
        }

        [Fact]
        public async Task ConfirmTransferAsync_ShouldThrow_WhenUserIsNotOwner()
        {
            var service = CreateService();
            _depositRequestRepoMock.Setup(r => r.GetByIdAsync(7))
                .ReturnsAsync(new WalletDepositRequest
                {
                    Id = 7,
                    UserId = 2,
                    Amount = 10000,
                    Status = WalletDepositRequestStatus.Pending
                });

            Func<Task> act = () => service.ConfirmTransferAsync(7, new UserContext(1, "member", "Member"));

            await act.Should().ThrowAsync<ForbiddenException>();
        }

        private WalletDepositRequestService CreateService()
        {
            var settings = Options.Create(new VietQrSettings
            {
                BankId = "mbbank",
                AccountNo = "123456789",
                AccountName = "GAME TOPUP",
                Template = "compact2"
            });

            return new WalletDepositRequestService(_depositRequestRepoMock.Object, settings);
        }
    }
}
