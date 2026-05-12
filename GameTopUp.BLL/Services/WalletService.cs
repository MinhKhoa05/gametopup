using GameTopUp.BLL.Common;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
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

        public async Task<long> CreateWalletAsync(UserContext context)
        {
            var existingWallet = await _walletRepo.GetByUserIdAsync(context.UserId);
            if (existingWallet != null)
            {
                throw new BusinessException("Ví của bạn đã được kích hoạt.");
            }

            try
            {
                return await _walletRepo.CreateAsync(new Wallet
                {
                    UserId = context.UserId,
                    Balance = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex) when (ex.Message.Contains("Duplicate", StringComparison.OrdinalIgnoreCase) || 
                                       ex.Message.Contains("UNIQUE", StringComparison.OrdinalIgnoreCase))
            {
                throw new BusinessException("Ví của bạn đã được kích hoạt hoặc đang được xử lý.");
            }
        }

        public async Task<Wallet> GetWithLockByUserIdOrThrowAsync(long userId)
        {
            // WHY: Pessimistic Lock ngăn chặn race condition khi thay đổi số dư.
            return await _walletRepo.GetByUserIdForUpdateAsync(userId)
                ?? throw new NotFoundException("Ví của bạn chưa được kích hoạt. Vui lòng kích hoạt ví để sử dụng.");
        }

        private async Task<TransactionResponseDTO> CreditAsync(
            long userId, 
            decimal amount, 
            WalletTransactionType type, 
            string description, 
            long? orderId = null)
        {
            // WHY: Tự động lock ví để đảm bảo an toàn dữ liệu.
            var wallet = await GetWithLockByUserIdOrThrowAsync(userId);

            if (amount <= 0) throw new BusinessException("Số tiền nạp phải lớn hơn 0.");

            decimal balanceBefore = wallet.Balance;
            decimal balanceAfter = balanceBefore + amount;

            // Update balance
            wallet.Balance = balanceAfter;
            wallet.UpdatedAt = DateTime.UtcNow;

            _walletRepo.UpdateBalanceAsync(wallet.Id, wallet.Balance);

            // Log transaction
            var txId = await _walletTxRepo.CreateAsync(new WalletTransaction
            {
                UserId = wallet.UserId,
                Amount = amount,
                BalanceBefore = balanceBefore,
                BalanceAfter = balanceAfter,
                Type = type,
                Description = description,
                OrderId = orderId,
                CreatedAt = DateTime.UtcNow
            });

            return new TransactionResponseDTO { TransactionId = txId };
        }

        private async Task<TransactionResponseDTO> DebitAsync(
            long userId, 
            decimal amount, 
            WalletTransactionType type, 
            string description, 
            long? orderId = null)
        {
            // WHY: Lock ví để kiểm tra và trừ tiền an toàn.
            var wallet = await GetWithLockByUserIdOrThrowAsync(userId);

            if (amount <= 0) throw new BusinessException("Số tiền trừ phải lớn hơn 0.");

            if (wallet.Balance < amount) throw new BusinessException("Số dư ví không đủ.");

            decimal balanceBefore = wallet.Balance;
            decimal balanceAfter = balanceBefore - amount;

            // Update balance
            wallet.Balance = balanceAfter;
            wallet.UpdatedAt = DateTime.UtcNow;

            _walletRepo.UpdateBalanceAsync(wallet.Id, wallet.Balance);

            // Log transaction
            var txId = await _walletTxRepo.CreateAsync(new WalletTransaction
            {
                UserId = wallet.UserId,
                Amount = -amount,
                BalanceBefore = balanceBefore,
                BalanceAfter = balanceAfter,
                Type = type,
                Description = description,
                OrderId = orderId,
                CreatedAt = DateTime.UtcNow
            });

            return new TransactionResponseDTO { TransactionId = txId };
        }

        public async Task PayOrderAsync(Order order)
        {
            // WHY: Đóng gói flow thanh toán, UseCase không cần quan tâm log/type.
            await DebitAsync(
                order.UserId, 
                order.Total, 
                WalletTransactionType.PaidOrder, 
                $"Thanh toán đơn hàng #{order.Id}", 
                order.Id);
        }

        public async Task RefundOrderAsync(Order order, string? reason = null)
        {
            // WHY: Đóng gói logic hoàn tiền giúp code UseCase sạch và đồng nhất.
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
            return await CreditAsync(userId, amount, WalletTransactionType.Deposit, $"Nạp tiền vào ví: {amount:N0} VNĐ");
        }

        public async Task<TransactionResponseDTO> WithdrawAsync(long userId, decimal amount)
        {
            return await DebitAsync(userId, amount, WalletTransactionType.Withdraw, $"Rút tiền từ ví: {amount:N0} VNĐ");
        }

        public async Task<decimal> GetBalanceAsync(UserContext context)
        {
            var wallet = await GetOrThrowByUserIdAsync(context.UserId);
            return wallet.Balance;
        }

        public async Task<List<WalletTransaction>> GetTransactionsAsync(UserContext context)
        {
            return await _walletTxRepo.GetByUserIdAsync(context.UserId);
        }

        public async Task<Wallet> GetOrThrowByUserIdAsync(long userId)
        {
            return await _walletRepo.GetByUserIdAsync(userId)
                ?? throw new NotFoundException("Ví của bạn chưa được kích hoạt. Vui lòng kích hoạt ví để sử dụng.");
        }
    }
}
