using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Mappers;
using GameTopUp.BLL.Services.Wallets;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Wallets;

namespace GameTopUp.BLL.UseCases;

public sealed class WalletDepositUseCase
{
    private readonly WalletService _walletService;
    private readonly WalletDepositService _depositService;
    private readonly ITransactionManager _transaction;

    public WalletDepositUseCase(
        WalletService walletService,
        WalletDepositService depositService,
        ITransactionManager transaction)
    {
        _walletService = walletService;
        _depositService = depositService;
        _transaction = transaction;
    }

    public async Task<WalletDepositResponse> ConfirmDepositTransferAsync(long requestId, UserContext user)
    {
        return await _transaction.ExecuteAsync(async () =>
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

    public async Task<AdminDepositResponse> ApproveDepositRequestAsync(long requestId, UserContext admin, string? note = null)
    {
        return await _transaction.ExecuteAsync(async () =>
        {
            var now = DateTime.UtcNow;
            var request = await _depositService.LockByIdOrThrowAsync(requestId);

            if (request.Status == WalletDepositStatus.Approved)
            {
                return request.MapTo<AdminDepositResponse>();
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

            return request.MapTo<AdminDepositResponse>();
        });
    }

    public async Task<AdminDepositResponse> RejectDepositRequestAsync(long requestId, UserContext admin, string? note = null)
    {
        return await _transaction.ExecuteAsync(async () =>
        {
            var now = DateTime.UtcNow;
            var request = await _depositService.LockByIdOrThrowAsync(requestId);

            if (request.Status == WalletDepositStatus.Rejected)
            {
                return request.MapTo<AdminDepositResponse>();
            }

            _depositService.Reject(request, admin, now, note);
            await _depositService.UpdateAsync(request);

            return request.MapTo<AdminDepositResponse>();
        });
    }
}
