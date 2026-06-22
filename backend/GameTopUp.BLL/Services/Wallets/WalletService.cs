using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.DAL.Interfaces.Wallets;

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

    public async Task<List<WalletTransactionResponse>> GetTransactionsAsync(UserContext context)
    {
        var transactions = await _transactionRepository.GetByUserIdAsync(context.UserId);
        return transactions.Select(transaction => transaction.MapTo<WalletTransactionResponse>()).ToList();
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

        return WalletTransaction.Create(
            wallet.UserId,
            signedAmount,
            balanceBefore,
            balanceAfter,
            type,
            referenceId);
    }
}
