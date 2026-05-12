using GameTopUp.BLL.Common;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Services;
using GameTopUp.DAL;
using GameTopUp.DAL.Entities;

namespace GameTopUp.BLL.ApplicationServices
{
    public class WalletUseCase
    {
        private readonly WalletService _walletService;
        private readonly DatabaseContext _database;

        public WalletUseCase(WalletService walletService, DatabaseContext database)
        {
            _walletService = walletService;
            _database = database;
        }

        public async Task<long> ActiveWalletAsync(UserContext context)
        {
            return await _walletService.CreateWalletAsync(context);
        }

        public async Task<TransactionResponseDTO> DepositAsync(UserContext context, decimal amount)
        {
            return await _database.ExecuteInTransactionAsync(async () =>
            {
                // WHY: UseCase điều phối transaction, che giấu logic nạp tiền trong Service.
                return await _walletService.DepositAsync(context.UserId, amount);
            });
        }

        public async Task<TransactionResponseDTO> WithdrawAsync(UserContext context, decimal amount)
        {
            return await _database.ExecuteInTransactionAsync(async () =>
            {
                // WHY: Đảm bảo tính nguyên tử cho hành động rút tiền.
                return await _walletService.WithdrawAsync(context.UserId, amount);
            });
        }
    }
}
