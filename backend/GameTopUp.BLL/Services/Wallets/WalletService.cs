using GameTopUp.BLL.Context;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;

namespace GameTopUp.BLL.Services.Wallets;

public sealed class WalletService
{
    private readonly IWalletRepository _walletRepository;
    private readonly IWalletTransactionRepository _transactionRepository;

    public WalletService(IWalletRepository walletRepository, IWalletTransactionRepository transactionRepository)
    {
        _walletRepository = walletRepository;
        _transactionRepository = transactionRepository;
    }

    public async Task<decimal> GetBalanceAsync(UserContext context)
    {
        var wallet = await _walletRepository.GetByUserIdAsync(context.UserId)
            ?? throw new BusinessException(ErrorCode.WalletNotFound);

        return wallet.Balance;
    }

    public async Task<Wallet> LockByUserIdOrThrowAsync(long userId)
    {
        return await _walletRepository.GetWithLockByUserIdAsync(userId)
            ?? throw new NotFoundException(ErrorCode.WalletNotFound);
    }

    public async Task ApplyTransactionAsync(Wallet wallet, WalletTransaction transaction)
    {
        ArgumentNullException.ThrowIfNull(wallet);
        ArgumentNullException.ThrowIfNull(transaction);

        await _walletRepository.UpdateBalanceAsync(wallet.Id, wallet.Balance);
        await _transactionRepository.CreateAsync(transaction);
    }

    public async Task<CursorPageResponse<WalletTransactionResponse>> GetTransactionsAsync(
        UserContext context,
        WalletTransactionFilter? filter,
        long? cursor,
        int? limit)
    {
        return await CursorPageMappings.ToCursorPageAsync(
            limit,
            take => _transactionRepository.GetByUserIdAsync(
                context.UserId,
                ToTransactionType(filter),
                cursor,
                take),
            transaction => transaction.MapTo<WalletTransactionResponse>(),
            transaction => transaction.Id);
    }

    public void EnsureSufficientBalance(Wallet wallet, decimal amount)
    {
        ArgumentNullException.ThrowIfNull(wallet);

        EnsurePositiveAmount(amount);

        if (wallet.Balance < amount)
        {
            throw new BusinessException(ErrorCode.InsufficientWalletBalance);
        }
    }

    public WalletTransaction Credit(
        Wallet wallet,
        decimal amount,
        WalletTransactionType type,
        string? referenceId = null)
    {
        ArgumentNullException.ThrowIfNull(wallet);

        EnsurePositiveAmount(amount);
        return CreateTransaction(wallet, amount, type, referenceId);
    }

    public WalletTransaction Debit(
        Wallet wallet,
        decimal amount,
        WalletTransactionType type,
        string? referenceId = null)
    {
        EnsureSufficientBalance(wallet, amount);
        return CreateTransaction(wallet, -amount, type, referenceId);
    }

    private static void EnsurePositiveAmount(decimal amount)
    {
        if (amount <= 0)
        {
            throw new BusinessException(ErrorCode.AmountMustBePositive);
        }
    }

    private static WalletTransaction CreateTransaction(
        Wallet wallet,
        decimal signedAmount,
        WalletTransactionType type,
        string? referenceId)
    {
        ArgumentNullException.ThrowIfNull(wallet);

        var balanceBefore = wallet.Balance;
        var balanceAfter = balanceBefore + signedAmount;
        wallet.Balance = balanceAfter;

        return new WalletTransaction
        {
            UserId = wallet.UserId,
            Amount = signedAmount,
            BalanceBefore = balanceBefore,
            BalanceAfter = balanceAfter,
            Type = type,
            ReferenceId = referenceId,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    private static WalletTransactionType? ToTransactionType(WalletTransactionFilter? filter)
    {
        return filter switch
        {
            WalletTransactionFilter.Deposit => WalletTransactionType.Deposit,
            WalletTransactionFilter.Withdraw => WalletTransactionType.Withdraw,
            WalletTransactionFilter.PurchaseOrder => WalletTransactionType.PurchaseOrder,
            WalletTransactionFilter.Refund => WalletTransactionType.Refund,
            _ => null
        };
    }

}
