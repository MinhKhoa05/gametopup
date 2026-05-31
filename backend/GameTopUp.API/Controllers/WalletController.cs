using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.UseCases;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.DAL.Entities;

namespace GameTopUp.API.Controllers
{
    [Authorize]
    [Route("api/wallet")]
    [ApiController]
    public class WalletController : ApiControllerBase
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
            return ApiCreated(response, "Tạo yêu cầu nạp tiền thành công.");
        }

        [HttpPost("deposit-requests")]
        public async Task<IActionResult> CreateDepositRequest([FromBody] CreateDepositRequest request)
        {
            var response = await _walletUseCase.CreateDepositRequestAsync(CurrentUser, request.Amount);
            return ApiCreated(response, "Tạo yêu cầu nạp tiền thành công.");
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
            var response = await _depositRequestService.ConfirmTransferAsync(requestId, CurrentUser);
            return ApiOk(response, "Đã ghi nhận xác nhận chuyển khoản.");
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
            return ApiOk(response, "Duyệt yêu cầu nạp tiền thành công.");
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("deposit-requests/{requestId}/reject")]
        public async Task<IActionResult> RejectDepositRequest(long requestId, [FromBody] ReviewDepositRequest? request = null)
        {
            var response = await _walletUseCase.RejectDepositRequestAsync(requestId, CurrentUser, request?.Note);
            return ApiOk(response, "Từ chối yêu cầu nạp tiền thành công.");
        }
    }
}
