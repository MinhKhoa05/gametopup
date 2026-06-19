using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers;
using GameTopUp.BLL.Services;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.DAL.Interfaces.Wallets;

namespace GameTopUp.BLL.UseCases;

public sealed class WalletDepositUseCase
{
    private readonly WalletService _walletService;
    private readonly WalletDepositService _depositRequestService;
    private readonly IWalletDepositRepository _depositRequestRepository;
    private readonly IWalletRepository _walletRepository;
    private readonly IWalletTransactionRepository _walletTransactionRepository;
    private readonly DatabaseContext _database;

    public WalletDepositUseCase(
        WalletService walletService,
        WalletDepositService depositRequestService,
        IWalletDepositRepository depositRequestRepository,
        IWalletRepository walletRepository,
        IWalletTransactionRepository walletTransactionRepository,
        DatabaseContext database)
    {
        _walletService = walletService;
        _depositRequestService = depositRequestService;
        _depositRequestRepository = depositRequestRepository;
        _walletRepository = walletRepository;
        _walletTransactionRepository = walletTransactionRepository;
        _database = database;
    }

    public async Task<WalletDepositResponseDTO> ConfirmDepositTransferAsync(long requestId, UserContext user)
    {
        return await _database.ExecuteInTransactionAsync(async () =>
        {
            var now = DateTime.UtcNow;
            var request = await GetDepositRequestByIdForUpdateOrThrowAsync(requestId);

            if (request.Status == WalletDepositStatus.UserConfirmed)
            {
                return _depositRequestService.ToPublicResponse(request);
            }

            _depositRequestService.Confirm(request, user, now);
            await _depositRequestRepository.UpdateAsync(request);
            return _depositRequestService.ToPublicResponse(request);
        });
    }

    public async Task<AdminDepositRequestResponseDTO> ApproveDepositRequestAsync(long requestId, UserContext admin, string? note = null)
    {
        return await _database.ExecuteInTransactionAsync(async () =>
        {
            var now = DateTime.UtcNow;
            var request = await GetDepositRequestByIdForUpdateOrThrowAsync(requestId);

            if (request.Status == WalletDepositStatus.Approved)
            {
                return _depositRequestService.ToAdminResponse(request);
            }

            _depositRequestService.Approve(request, admin, now, note);
            var wallet = await GetWalletByUserIdForUpdateOrThrowAsync(request.UserId);
            var walletTransaction = _walletService.DepositFromVietQr(wallet, request.Amount, request.Code);
            await PersistWalletChangeAsync(wallet, walletTransaction);
            await _depositRequestRepository.UpdateAsync(request);

            return _depositRequestService.ToAdminResponse(request);
        });
    }

    public async Task<AdminDepositRequestResponseDTO> RejectDepositRequestAsync(long requestId, UserContext admin, string? note = null)
    {
        return await _database.ExecuteInTransactionAsync(async () =>
        {
            var now = DateTime.UtcNow;
            var request = await GetDepositRequestByIdForUpdateOrThrowAsync(requestId);

            if (request.Status == WalletDepositStatus.Rejected)
            {
                return _depositRequestService.ToAdminResponse(request);
            }

            _depositRequestService.Reject(request, admin, now, note);
            await _depositRequestRepository.UpdateAsync(request);
            return _depositRequestService.ToAdminResponse(request);
        });
    }

    private async Task<WalletDeposit> GetDepositRequestByIdForUpdateOrThrowAsync(long requestId)
    {
        return await _depositRequestRepository.GetWithLockByIdAsync(requestId)
            ?? throw new NotFoundException(
                ErrorCode.DepositRequestNotFound,
                $"Deposit request #{requestId} was not found.");
    }

    private async Task<Wallet> GetWalletByUserIdForUpdateOrThrowAsync(long userId)
    {
        return await _walletRepository.GetWithLockByUserIdAsync(userId)
            ?? throw new NotFoundException(ErrorCode.WalletNotFound);
    }

    private async Task PersistWalletChangeAsync(Wallet wallet, WalletTransaction transaction)
    {
        await _walletRepository.UpdateBalanceAsync(wallet.Id, wallet.Balance);
        await _walletTransactionRepository.CreateAsync(transaction);
    }
}
