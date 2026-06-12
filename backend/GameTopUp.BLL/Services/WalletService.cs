using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Exceptions;
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

    public Task CreateWalletAsync(long userId) => _walletRepository.UpsertWalletAsync(Wallet.CreateForUser(userId));

    public async Task<decimal> GetBalanceAsync(UserContext context)
    {
        var wallet = await _walletRepository.GetByUserIdAsync(context.UserId);
        return wallet?.Balance ?? throw new NotFoundException(ErrorCode.WalletNotFound);
    }

    public async Task<List<WalletTransactionInfo>> GetTransactionsAsync(UserContext context)
    {
        var transactions = await _transactionRepository.GetByUserIdAsync(context.UserId);
        return transactions.Select(MapToInfo).ToList();
    }

    public async Task<TransactionResponseDTO> DepositAsync(long userId, decimal amount)
    {
        return await CreditAsync(userId, amount, WalletTransactionType.Deposit, $"Deposit wallet: {amount:N0} VND");
    }

    public async Task<TransactionResponseDTO> DepositFromVietQrAsync(long userId, decimal amount, string depositCode)
    {
        return await CreditAsync(userId, amount, WalletTransactionType.Deposit, $"Approve VietQR deposit #{depositCode}: {amount:N0} VND");
    }

    public async Task PayOrderAsync(long userId, long orderId, decimal amount)
    {
        await DebitAsync(userId, amount, WalletTransactionType.PaidOrder, $"Pay order #{orderId}", orderId);
    }

    public async Task RefundOrderAsync(long userId, long orderId, decimal amount, string? reason = null)
    {
        var description = $"Refund order #{orderId}." + (string.IsNullOrWhiteSpace(reason) ? string.Empty : $" Reason: {reason}");
        await CreditAsync(userId, amount, WalletTransactionType.Refund, description, orderId);
    }

    private async Task<TransactionResponseDTO> CreditAsync(
        long userId,
        decimal amount,
        WalletTransactionType type,
        string description,
        long? orderId = null)
    {
        if (amount <= 0)
        {
            throw new BusinessException(ErrorCode.AmountMustBePositive);
        }

        return await ApplyBalanceChangeAsync(userId, amount, type, description, orderId);
    }

    private async Task<TransactionResponseDTO> DebitAsync(
        long userId,
        decimal amount,
        WalletTransactionType type,
        string description,
        long? orderId = null)
    {
        if (amount <= 0)
        {
            throw new BusinessException(ErrorCode.AmountMustBePositive);
        }

        return await ApplyBalanceChangeAsync(userId, -amount, type, description, orderId);
    }

    private async Task<TransactionResponseDTO> ApplyBalanceChangeAsync(
        long userId,
        decimal balanceChange,
        WalletTransactionType type,
        string description,
        long? orderId = null)
    {
        if (balanceChange == 0)
        {
            throw new BusinessException(ErrorCode.AmountMustBePositive);
        }

        var wallet = await _walletRepository.GetWithLockByUserIdAsync(userId)
            ?? throw new NotFoundException(ErrorCode.WalletNotFound);

        var balanceBefore = wallet.Balance;
        var balanceAfter = balanceBefore + balanceChange;

        if (balanceAfter < 0)
        {
            throw new BusinessException(ErrorCode.InsufficientWalletBalance);
        }

        wallet.Balance = balanceAfter;
        wallet.UpdatedAt = DateTime.UtcNow;

        await _walletRepository.UpdateBalanceAsync(wallet.Id, wallet.Balance);

        var transaction = WalletTransaction.Create(
            wallet.UserId,
            balanceChange,
            balanceBefore,
            balanceAfter,
            type,
            description,
            orderId);

        var transactionId = await _transactionRepository.CreateAsync(transaction);
        return new TransactionResponseDTO { TransactionId = transactionId };
    }

    private static WalletTransactionInfo MapToInfo(WalletTransaction transaction)
    {
        return new WalletTransactionInfo
        {
            Id = transaction.Id,
            UserId = transaction.UserId,
            Amount = transaction.Amount,
            BalanceBefore = transaction.BalanceBefore,
            BalanceAfter = transaction.BalanceAfter,
            Type = transaction.Type,
            Description = transaction.Description,
            ReferenceId = transaction.OrderId,
            CreatedAt = transaction.CreatedAt
        };
    }
}
