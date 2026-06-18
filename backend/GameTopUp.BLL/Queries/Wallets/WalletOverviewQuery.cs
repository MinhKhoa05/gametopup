using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers.Wallets;
using GameTopUp.DAL.Interfaces.Wallets;

namespace GameTopUp.BLL.Queries.Wallets;

public sealed class WalletOverviewQuery
{
    private readonly IWalletRepository _walletRepository;
    private readonly IWalletTransactionRepository _transactionRepository;
    private readonly WalletDepositRequestQuery _depositRequestQuery;

    public WalletOverviewQuery(
        IWalletRepository walletRepository,
        IWalletTransactionRepository transactionRepository,
        WalletDepositRequestQuery depositRequestQuery)
    {
        _walletRepository = walletRepository;
        _transactionRepository = transactionRepository;
        _depositRequestQuery = depositRequestQuery;
    }

    public async Task<WalletOverviewResponseDTO> GetByUserAsync(UserContext context)
    {
        var wallet = await _walletRepository.GetByUserIdAsync(context.UserId)
            ?? throw new NotFoundException(ErrorCode.WalletNotFound);

        var transactions = await _transactionRepository.GetByUserIdAsync(context.UserId);
        var depositRequests = await _depositRequestQuery.GetByUserAsync(context);

        return new WalletOverviewResponseDTO
        {
            Balance = wallet.Balance,
            Transactions = transactions.Select(WalletMapper.ToTransactionResponse).ToList(),
            DepositRequests = depositRequests
        };
    }
}
