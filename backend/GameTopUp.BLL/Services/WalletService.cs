using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.DAL.Interfaces.Wallets;

namespace GameTopUp.BLL.Services;

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
        var wallet = await _walletRepository.GetByUserIdAsync(context.UserId);
        return wallet?.Balance ?? throw new NotFoundException(ErrorCode.WalletNotFound);
    }

    public async Task<List<WalletTransactionInfo>> GetTransactionsAsync(UserContext context)
    {
        var transactions = await _transactionRepository.GetByUserIdAsync(context.UserId);
        return transactions.Select(transaction => transaction.MapTo<WalletTransactionInfo>()).ToList();
    }

    public WalletTransaction DepositFromVietQr(Wallet wallet, decimal amount, string depositCode)
    {
        EnsurePositiveAmount(amount);

        var balanceBefore = wallet.Balance;
        var balanceAfter = balanceBefore + amount;
        var transaction = WalletTransaction.Create(
            wallet.UserId,
            amount,
            balanceBefore,
            balanceAfter,
            WalletTransactionType.Deposit,
            $"Approve VietQR deposit #{depositCode}: {amount:N0} VND");
        wallet.Balance = balanceAfter;
        return transaction;
    }

    public WalletTransaction ChargeOrder(Wallet wallet, long orderId, decimal amount)
    {
        EnsurePositiveAmount(amount);

        var balanceBefore = wallet.Balance;
        var balanceAfter = balanceBefore - amount;

        EnsureBalanceNotNegative(balanceAfter);

        var transaction = WalletTransaction.Create(
            wallet.UserId,
            -amount,
            balanceBefore,
            balanceAfter,
            WalletTransactionType.PurchaseOrder,
            $"Purchase order #{orderId}",
            orderId);
            
        wallet.Balance = balanceAfter;
        return transaction;
    }

    public WalletTransaction RefundOrder(Wallet wallet, long orderId, decimal amount, string? reason = null)
    {
        EnsurePositiveAmount(amount);

        var description = $"Refund order #{orderId}." + (string.IsNullOrWhiteSpace(reason) ? string.Empty : $" Reason: {reason}");
        var balanceBefore = wallet.Balance;
        var balanceAfter = balanceBefore + amount;
        var transaction = WalletTransaction.Create(
            wallet.UserId,
            amount,
            balanceBefore,
            balanceAfter,
            WalletTransactionType.Refund,
            description,
            orderId);
        wallet.Balance = balanceAfter;
        return transaction;
    }

    private static void EnsurePositiveAmount(decimal amount)
    {
        if (amount <= 0)
        {
            throw new BusinessException(ErrorCode.AmountMustBePositive);
        }
    }

    private static void EnsureBalanceNotNegative(decimal balanceAfter)
    {
        if (balanceAfter < 0)
        {
            throw new BusinessException(ErrorCode.InsufficientWalletBalance);
        }
    }

}
