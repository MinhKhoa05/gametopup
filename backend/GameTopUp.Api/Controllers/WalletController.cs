using GameTopUp.BLL.Context;
using GameTopUp.BLL.Queries.Wallets;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers;

[Authorize]
[Route("api/wallet")]
public sealed class WalletController : ApiControllerBase
{
    private readonly WalletService _walletService;
    private readonly WalletOverviewQuery _walletOverviewQuery;

    public WalletController(WalletService walletService, WalletOverviewQuery walletOverviewQuery)
    {
        _walletService = walletService;
        _walletOverviewQuery = walletOverviewQuery;
    }

    [HttpGet]
    public async Task<IActionResult> GetBalance()
    {
        var balance = await _walletService.GetBalanceAsync(CurrentUser);
        return ApiOk(balance);
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetWalletTransactions()
    {
        var transactions = await _walletService.GetTransactionsAsync(CurrentUser);
        return ApiOk(transactions);
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetWalletOverview()
    {
        var overview = await _walletOverviewQuery.GetByUserAsync(CurrentUser);
        return ApiOk(overview);
    }
}
