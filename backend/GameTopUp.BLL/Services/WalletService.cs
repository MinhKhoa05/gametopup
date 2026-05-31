using GameTopUp.BLL.Context;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces.Wallets;
using GameTopUp.BLL.DTOs.Wallets;

namespace GameTopUp.BLL.Services
{
    public class WalletService
    {
        private readonly IWalletRepository _walletRepo;
        private readonly IWalletTransactionRepository _walletTxRepo;

        public WalletService(IWalletRepository walletRepo, IWalletTransactionRepository walletTxRepo)
        {
            _walletRepo = walletRepo;
            _walletTxRepo = walletTxRepo;
        }

        // WHY: Repo đã dùng ON DUPLICATE KEY nên an toàn gọi nhiều lần không sợ lỗi tạo trùng.
        public async Task CreateWalletAsync(long userId)
        {
            var wallet = Wallet.CreateForUser(userId);

            await _walletRepo.UpsertWalletAsync(wallet);
        }

        private Task<TransactionResponseDTO> CreditAsync(
            long userId,
            decimal amount,
            WalletTransactionType type,
            string description,
            long? orderId = null)
        {
            if (amount <= 0) throw new BusinessException(ErrorCodes.AmountMustBePositive);

            return ApplyBalanceChangeAsync(userId, amount, type, description, orderId);
        }

        private Task<TransactionResponseDTO> DebitAsync(
            long userId,
            decimal amount,
            WalletTransactionType type,
            string description,
            long? orderId = null)
        {
            if (amount <= 0) throw new BusinessException(ErrorCodes.AmountMustBePositive);

            return ApplyBalanceChangeAsync(userId, -amount, type, description, orderId);
        }

        private async Task<TransactionResponseDTO> ApplyBalanceChangeAsync(
            long userId,
            decimal balanceChange,
            WalletTransactionType type,
            string description,
            long? orderId = null)
        {
            if (balanceChange == 0) throw new BusinessException(ErrorCodes.AmountMustBePositive);

            var wallet = await GetWalletWithLockOrThrowAsync(userId);
            var balanceBefore = wallet.Balance;
            var balanceAfter = balanceBefore + balanceChange;

            if (balanceChange < 0 && balanceAfter < 0)
                throw new BusinessException(ErrorCodes.InsufficientWalletBalance);

            wallet.Balance = balanceAfter;
            wallet.UpdatedAt = DateTime.UtcNow;

            await _walletRepo.UpdateBalanceAsync(wallet.Id, wallet.Balance);

            var transaction = WalletTransaction.Create(
                wallet.UserId,
                balanceChange,
                balanceBefore,
                balanceAfter,
                type,
                description,
                orderId);

            var txId = await _walletTxRepo.CreateAsync(transaction);
            var response = new TransactionResponseDTO { TransactionId = txId };

            return response;
        }

        public async Task PayOrderAsync(Order order)
        {
            await DebitAsync(
                order.UserId, 
                order.Total, 
                WalletTransactionType.PaidOrder, 
                $"Thanh toán đơn hàng #{order.Id}", 
                order.Id);
        }

        public async Task RefundOrderAsync(Order order, string? reason = null)
        {
            var description = $"Hoàn tiền đơn hàng #{order.Id}." + (string.IsNullOrEmpty(reason) ? "" : $" Lý do: {reason}");
            
            await CreditAsync(
                order.UserId, 
                order.Total, 
                WalletTransactionType.Refund, 
                description, 
                order.Id);
        }

        public async Task<TransactionResponseDTO> DepositAsync(long userId, decimal amount)
        {
            var description = $"Nạp tiền vào ví: {amount:N0} VNĐ";

            return await CreditAsync(userId, amount, WalletTransactionType.Deposit, description);
        }

        public async Task<TransactionResponseDTO> DepositFromVietQrAsync(long userId, decimal amount, string depositCode)
        {
            var description = $"Duyệt nạp tiền VietQR #{depositCode}: {amount:N0} VND";

            return await CreditAsync(
                userId,
                amount,
                WalletTransactionType.Deposit,
                description);
        }

        public async Task<decimal> GetBalanceAsync(UserContext context)
        {
            var wallet = await _walletRepo.GetByUserIdAsync(context.UserId) 
                ?? throw new NotFoundException(ErrorCodes.WalletNotFound);
            return wallet.Balance;
        }

        private async Task<Wallet> GetWalletWithLockOrThrowAsync(long userId)
        {
            return await _walletRepo.GetWithLockByUserIdAsync(userId)
                ?? throw new NotFoundException(ErrorCodes.WalletNotFound);
        }

        public async Task<List<WalletTransaction>> GetTransactionsAsync(UserContext context)
        {
            return await _walletTxRepo.GetByUserIdAsync(context.UserId);
        }
    }
}
