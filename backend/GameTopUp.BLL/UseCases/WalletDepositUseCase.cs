using GameTopUp.BLL.Context;
using GameTopUp.BLL.Services.Notifications;
using GameTopUp.BLL.Services.Wallets;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;

namespace GameTopUp.BLL.UseCases;

public sealed class WalletDepositUseCase
{
    private readonly WalletService _walletService;
    private readonly WalletDepositService _depositService;
    private readonly NotificationService _notificationService;
    private readonly ITransactionManager _transaction;

    public WalletDepositUseCase(
        WalletService walletService,
        WalletDepositService depositService,
        NotificationService notificationService,
        ITransactionManager transaction)
    {
        _walletService = walletService;
        _depositService = depositService;
        _notificationService = notificationService;
        _transaction = transaction;
    }

    public async Task ConfirmDepositTransferAsync(long requestId, UserContext user)
    {
        await _transaction.ExecuteAsync(async () =>
        {
            var request = await _depositService.LockByIdOrThrowAsync(requestId);

            if (request.Status == WalletDepositStatus.UserConfirmed)
            {
                return;
            }

            _depositService.Confirm(request, user);
            await _depositService.UpdateAsync(request);
            await _notificationService.CreateNotificationAsync(
                NotificationTemplates.DepositSubmitted(request.UserId, request.Code));
        });
    }

    public async Task ApproveDepositRequestAsync(long requestId, UserContext admin, string? note = null)
    {
        await _transaction.ExecuteAsync(async () =>
        {
            var request = await _depositService.LockByIdOrThrowAsync(requestId);

            if (request.Status == WalletDepositStatus.Approved)
            {
                return;
            }

            _depositService.Approve(request, admin, note);
            var wallet = await _walletService.LockByUserIdOrThrowAsync(request.UserId);
            var walletTransaction = _walletService.Credit(
                wallet,
                request.Amount,
                WalletTransactionType.Deposit,
                request.Code);
            await _walletService.ApplyTransactionAsync(wallet, walletTransaction);
            await _depositService.UpdateAsync(request);
            await _notificationService.CreateNotificationAsync(
                NotificationTemplates.DepositApproved(request.UserId, request.Code));
        });
    }

    public async Task RejectDepositRequestAsync(long requestId, UserContext admin, string? note = null)
    {
        await _transaction.ExecuteAsync(async () =>
        {
            var request = await _depositService.LockByIdOrThrowAsync(requestId);

            if (request.Status == WalletDepositStatus.Rejected)
            {
                return;
            }

            _depositService.Reject(request, admin, note);
            await _depositService.UpdateAsync(request);
            await _notificationService.CreateNotificationAsync(
                NotificationTemplates.DepositRejected(request.UserId, request.Code));
        });
    }
}
