using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Queries.Wallets;
using GameTopUp.BLL.UseCases;
using GameTopUp.DAL.Entities.Wallets;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/deposits")]
public sealed class AdminDepositController : ApiControllerBase
{
    private readonly WalletUseCase _walletUseCase;
    private readonly AdminDepositRequestQuery _depositRequestQuery;

    public AdminDepositController(WalletUseCase walletUseCase, AdminDepositRequestQuery depositRequestQuery)
    {
        _walletUseCase = walletUseCase;
        _depositRequestQuery = depositRequestQuery;
    }

    [HttpGet]
    public async Task<IActionResult> GetDepositRequests([FromQuery] WalletDepositRequestStatus? status = null)
    {
        var requests = await _depositRequestQuery.GetAllAsync(status);
        return ApiOk(requests);
    }

    [HttpPost("{requestId}/approve")]
    public async Task<IActionResult> ApproveDepositRequest(long requestId, [FromBody] ReviewDepositRequest? request = null)
    {
        var response = await _walletUseCase.ApproveDepositRequestAsync(requestId, CurrentUser, request?.Note);
        return ApiOk(response, "Deposit request approved successfully.");
    }

    [HttpPost("{requestId}/reject")]
    public async Task<IActionResult> RejectDepositRequest(long requestId, [FromBody] ReviewDepositRequest? request = null)
    {
        var response = await _walletUseCase.RejectDepositRequestAsync(requestId, CurrentUser, request?.Note);
        return ApiOk(response, "Deposit request rejected successfully.");
    }
}
