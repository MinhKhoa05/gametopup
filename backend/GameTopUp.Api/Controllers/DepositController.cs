using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.UseCases;
using GameTopUp.DAL.Entities.Wallets;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers;

[Authorize]
[Route("api/deposits")]
public sealed class DepositController : ApiControllerBase
{
    private readonly WalletDepositService _depositService;
    private readonly WalletDepositUseCase _walletDepositUseCase;

    public DepositController(
        WalletDepositService depositService,
        WalletDepositUseCase walletDepositUseCase)
    {
        _depositService = depositService;
        _walletDepositUseCase = walletDepositUseCase;
    }

    [HttpPost]
    public async Task<IActionResult> CreateDepositRequest([FromBody] CreateDepositRequest request)
    {
        var response = await _depositService.CreateAsync(CurrentUser, request.Amount);
        return ApiCreated(response);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyDepositRequests([FromQuery] WalletDepositStatus? status = null)
    {
        var requests = await _depositService.GetByUserAsync(CurrentUser, status);
        return ApiOk(requests);
    }

    [HttpPost("{requestId}/confirm")]
    public async Task<IActionResult> ConfirmDepositTransfer(long requestId)
    {
        var response = await _walletDepositUseCase.ConfirmDepositTransferAsync(requestId, CurrentUser);
        return ApiOk(response);
    }
}
