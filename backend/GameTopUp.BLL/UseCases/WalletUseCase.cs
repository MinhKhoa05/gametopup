using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;

namespace GameTopUp.BLL.UseCases
{
    public class WalletUseCase
    {
        private readonly WalletService _walletService;
        private readonly WalletDepositRequestService _depositRequestService;
        private readonly DatabaseContext _database;

        public WalletUseCase(
            WalletService walletService,
            WalletDepositRequestService depositRequestService,
            DatabaseContext database)
        {
            _walletService = walletService;
            _depositRequestService = depositRequestService;
            _database = database;
        }

        public async Task<DepositRequestResponseDTO> CreateDepositRequestAsync(UserContext context, decimal amount)
        {
            return await _depositRequestService.CreateAsync(context, amount);
        }

        public async Task<DepositRequestResponseDTO> ApproveDepositRequestAsync(long requestId, UserContext admin, string? note = null)
        {
            return await _database.ExecuteInTransactionAsync(async () =>
            {
                var request = await _depositRequestService.GetWithLockByIdOrThrowAsync(requestId);

                if (request.Status == WalletDepositRequestStatus.Approved)
                    return _depositRequestService.MapToResponse(request);

                if (request.Status != WalletDepositRequestStatus.UserConfirmed)
                    throw new BusinessException(ErrorCodes.DepositApproveOnlyUserConfirmed);

                await _walletService.DepositFromVietQrAsync(request.UserId, request.Amount, request.Code);
                await _depositRequestService.MarkApprovedAsync(request, admin, note);

                return _depositRequestService.MapToResponse(request);
            });
        }

        public async Task<DepositRequestResponseDTO> RejectDepositRequestAsync(long requestId, UserContext admin, string? note = null)
        {
            return await _database.ExecuteInTransactionAsync(async () =>
            {
                var request = await _depositRequestService.GetWithLockByIdOrThrowAsync(requestId);
                await _depositRequestService.MarkRejectedAsync(request, admin, note);
                return _depositRequestService.MapToResponse(request);
            });
        }
    }
}
