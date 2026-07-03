using GameTopUp.BLL.Context;
using GameTopUp.DAL.Queries;

namespace GameTopUp.BLL.Services.Wallets;

public sealed class WalletReadService
{
    private readonly WalletQuery _walletQuery;

    public WalletReadService(WalletQuery walletQuery)
    {
        _walletQuery = walletQuery;
    }

    public async Task<WalletStatsResponse> GetStatsAsync(UserContext context)
    {
        return await _walletQuery.GetWalletStatsByUserAsync(context.UserId);
    }
}
