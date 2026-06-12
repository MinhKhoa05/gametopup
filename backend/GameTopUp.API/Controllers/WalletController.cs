using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.UseCases;
using GameTopUp.DAL.Entities.Wallets;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers;

[Authorize]
[Route("api/wallet")]
public sealed class WalletController : ApiControllerBase
{
    private readonly WalletService _walletService;
    private readonly WalletUseCase _walletUseCase;
    private readonly WalletDepositRequestService _depositRequestService;

    public WalletController(
        WalletService walletService,
        WalletUseCase walletUseCase,
        WalletDepositRequestService depositRequestService)
    {
        _walletService = walletService;
        _walletUseCase = walletUseCase;
        _depositRequestService = depositRequestService;
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

    [HttpPost("transactions/deposit")]
    public async Task<IActionResult> Deposit([FromBody] WalletTransactionRequest request)
    {
        var response = await _walletUseCase.CreateDepositRequestAsync(CurrentUser, request.Amount);
        return ApiCreated(response, "Deposit request created successfully.");
    }

    [HttpPost("deposit-requests")]
    public async Task<IActionResult> CreateDepositRequest([FromBody] CreateDepositRequest request)
    {
        var response = await _walletUseCase.CreateDepositRequestAsync(CurrentUser, request.Amount);
        return ApiCreated(response, "Deposit request created successfully.");
    }

    [HttpGet("deposit-requests/me")]
    public async Task<IActionResult> GetMyDepositRequests([FromQuery] WalletDepositRequestStatus? status = null)
    {
        var requests = await _depositRequestService.GetByUserAsync(CurrentUser, status);
        return ApiOk(requests);
    }

    [HttpPost("deposit-requests/{requestId}/confirm-transfer")]
    public async Task<IActionResult> ConfirmDepositTransfer(long requestId)
    {
        var response = await _walletUseCase.ConfirmDepositTransferAsync(requestId, CurrentUser);
        return ApiOk(response, "Transfer confirmation recorded.");
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("deposit-requests")]
    public async Task<IActionResult> GetDepositRequests([FromQuery] WalletDepositRequestStatus? status = null)
    {
        var requests = await _depositRequestService.GetAllAsync(status);
        return ApiOk(requests);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("deposit-requests/{requestId}/approve")]
    public async Task<IActionResult> ApproveDepositRequest(long requestId, [FromBody] ReviewDepositRequest? request = null)
    {
        var response = await _walletUseCase.ApproveDepositRequestAsync(requestId, CurrentUser, request?.Note);
        return ApiOk(response, "Deposit request approved successfully.");
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("deposit-requests/{requestId}/reject")]
    public async Task<IActionResult> RejectDepositRequest(long requestId, [FromBody] ReviewDepositRequest? request = null)
    {
        var response = await _walletUseCase.RejectDepositRequestAsync(requestId, CurrentUser, request?.Note);
        return ApiOk(response, "Deposit request rejected successfully.");
    }
}
