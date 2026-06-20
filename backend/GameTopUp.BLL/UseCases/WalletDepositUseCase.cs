using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Mappers;
using GameTopUp.BLL.Services;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Wallets;

namespace GameTopUp.BLL.UseCases;

public sealed class WalletDepositUseCase
{
    private readonly WalletService _walletService;
    private readonly WalletDepositService _depositService;
    private readonly DatabaseContext _database;

    public WalletDepositUseCase(
        WalletService walletService,
        WalletDepositService depositService,
        DatabaseContext database)
    {
        _walletService = walletService;
        _depositService = depositService;
        _database = database;
    }

    public async Task<WalletDepositResponseDTO> ConfirmDepositTransferAsync(long requestId, UserContext user)
    {
        return await _database.ExecuteInTransactionAsync(async () =>
        {
            var now = DateTime.UtcNow;
            var request = await _depositService.LockByIdOrThrowAsync(requestId);

            if (request.Status == WalletDepositStatus.UserConfirmed)
            {
                return _depositService.BuildPublicResponse(request);
            }

            _depositService.Confirm(request, user, now);
            await _depositService.UpdateAsync(request);

            return _depositService.BuildPublicResponse(request);
        });
    }

    public async Task<AdminDepositRequestResponseDTO> ApproveDepositRequestAsync(long requestId, UserContext admin, string? note = null)
    {
        return await _database.ExecuteInTransactionAsync(async () =>
        {
            var now = DateTime.UtcNow;
            var request = await _depositService.LockByIdOrThrowAsync(requestId);

            if (request.Status == WalletDepositStatus.Approved)
            {
                return request.MapTo<AdminDepositRequestResponseDTO>();
            }

            _depositService.Approve(request, admin, now, note);
            var wallet = await _walletService.LockByUserIdOrThrowAsync(request.UserId);
            var walletTransaction = _walletService.Credit(
                wallet,
                request.Amount,
                WalletTransactionType.Deposit,
                request.Code);
            await _walletService.ApplyTransactionAsync(wallet, walletTransaction);
            await _depositService.UpdateAsync(request);

            return request.MapTo<AdminDepositRequestResponseDTO>();
        });
    }

    public async Task<AdminDepositRequestResponseDTO> RejectDepositRequestAsync(long requestId, UserContext admin, string? note = null)
    {
        return await _database.ExecuteInTransactionAsync(async () =>
        {
            var now = DateTime.UtcNow;
            var request = await _depositService.LockByIdOrThrowAsync(requestId);

            if (request.Status == WalletDepositStatus.Rejected)
            {
                return request.MapTo<AdminDepositRequestResponseDTO>();
            }

            _depositService.Reject(request, admin, now, note);
            await _depositService.UpdateAsync(request);

            return request.MapTo<AdminDepositRequestResponseDTO>();
        });
    }
}
