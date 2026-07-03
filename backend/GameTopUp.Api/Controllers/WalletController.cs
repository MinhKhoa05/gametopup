using GameTopUp.BLL.Context;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Services.Wallets;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers;

[Authorize]
[Route("api/wallet")]
public sealed class WalletController : ApiControllerBase
{
    private readonly WalletService _walletService;
    private readonly WalletReadService _walletReadService;

    public WalletController(WalletService walletService, WalletReadService walletReadService)
    {
        _walletService = walletService;
        _walletReadService = walletReadService;
    }

    [HttpGet]
    public async Task<IActionResult> GetBalance()
    {
        var balance = await _walletService.GetBalanceAsync(CurrentUser);
        return ApiOk(balance);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _walletReadService.GetStatsAsync(CurrentUser);
        return ApiOk(stats);
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetWalletTransactions(
        [FromQuery] WalletTransactionFilter? filter = null,
        [FromQuery] long? cursor = null,
        [FromQuery] int? limit = null)
    {
        var transactions = await _walletService.GetTransactionsAsync(CurrentUser, filter, cursor, limit);
        return ApiOk(transactions);
    }
}
