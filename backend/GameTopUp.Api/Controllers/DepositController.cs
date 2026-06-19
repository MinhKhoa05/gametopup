using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Queries.Wallets;
using GameTopUp.BLL.UseCases;
using GameTopUp.DAL.Entities.Wallets;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers;

[Authorize]
[Route("api/deposits")]
public sealed class DepositController : ApiControllerBase
{
    private readonly WalletUseCase _walletUseCase;
    private readonly WalletDepositRequestQuery _depositRequestQuery;

    public DepositController(WalletUseCase walletUseCase, WalletDepositRequestQuery depositRequestQuery)
    {
        _walletUseCase = walletUseCase;
        _depositRequestQuery = depositRequestQuery;
    }

    [HttpPost]
    public async Task<IActionResult> CreateDepositRequest([FromBody] CreateDepositRequest request)
    {
        var response = await _walletUseCase.CreateDepositRequestAsync(CurrentUser, request.Amount);
        return ApiCreated(response);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyDepositRequests([FromQuery] WalletDepositRequestStatus? status = null)
    {
        var requests = await _depositRequestQuery.GetByUserAsync(CurrentUser, status);
        return ApiOk(requests);
    }

    [HttpPost("{requestId}/confirm")]
    public async Task<IActionResult> ConfirmDepositTransfer(long requestId)
    {
        var response = await _walletUseCase.ConfirmDepositTransferAsync(requestId, CurrentUser);
        return ApiOk(response);
    }
}
