using GameTopUp.BLL.Context;
using GameTopUp.BLL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers;

[Authorize]
[Route("api/wallet")]
public sealed class WalletController : ApiControllerBase
{
    private readonly WalletService _walletService;

    public WalletController(WalletService walletService)
    {
        _walletService = walletService;
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
}
