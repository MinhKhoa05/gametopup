using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Services.Wallets;
using GameTopUp.BLL.UseCases;
using GameTopUp.DAL.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/deposits")]
public sealed class AdminWalletDepositController : ApiControllerBase
{
    private readonly WalletDepositUseCase _walletDepositUseCase;
    private readonly WalletDepositService _depositService;

    public AdminWalletDepositController(WalletDepositUseCase walletDepositUseCase, WalletDepositService depositService)
    {
        _walletDepositUseCase = walletDepositUseCase;
        _depositService = depositService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDepositRequests(
        [FromQuery] WalletDepositFilter? filter = null,
        [FromQuery] long? cursor = null,
        [FromQuery] int? limit = null)
    {
        var requests = await _depositService.GetAllCursorPageAsync(filter, cursor, limit);
        return ApiOk(requests);
    }

    [HttpPost("{requestId}/approve")]
    public async Task<IActionResult> ApproveDepositRequest(long requestId, [FromBody] ReviewDepositRequest? request = null)
    {
        await _walletDepositUseCase.ApproveDepositRequestAsync(requestId, CurrentUser, request?.Note);
        return ApiOk();
    }

    [HttpPost("{requestId}/reject")]
    public async Task<IActionResult> RejectDepositRequest(long requestId, [FromBody] ReviewDepositRequest? request = null)
    {
        await _walletDepositUseCase.RejectDepositRequestAsync(requestId, CurrentUser, request?.Note);
        return ApiOk();
    }
}
