using GameTopUp.BLL.Common;
using GameTopUp.DAL.Interfaces.Wallets;
using GameTopUp.BLL.Options;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities;
using Microsoft.Extensions.Options;

namespace GameTopUp.BLL.Services
{
    public class WalletDepositRequestService
    {
        private readonly IWalletDepositRequestRepository _depositRequestRepo;
        private readonly VietQrSettings _vietQrSettings;

        public WalletDepositRequestService(
            IWalletDepositRequestRepository depositRequestRepo,
            IOptions<VietQrSettings> vietQrOptions)
        {
            _depositRequestRepo = depositRequestRepo;
            _vietQrSettings = vietQrOptions.Value;
        }

        public async Task<DepositRequestResponseDTO> CreateAsync(UserContext context, decimal amount)
        {
            ValidateAmount(amount);
            ValidateVietQrSettings();

            var code = CreateDepositCode(context.UserId);
            var transferContent = $"NAP {code}";
            var request = new WalletDepositRequest
            {
                UserId = context.UserId,
                Amount = amount,
                Code = code,
                TransferContent = transferContent,
                QrImageUrl = BuildQrImageUrl(amount, transferContent),
                Status = WalletDepositRequestStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            request.Id = await _depositRequestRepo.CreateAsync(request);
            return MapToResponse(request);
        }

        public async Task<List<DepositRequestResponseDTO>> GetByUserAsync(UserContext context, WalletDepositRequestStatus? status = null)
        {
            var requests = await _depositRequestRepo.GetByUserIdAsync(context.UserId, status);
            return requests.Select(MapToResponse).ToList();
        }

        public async Task<List<DepositRequestResponseDTO>> GetAllAsync(WalletDepositRequestStatus? status = null)
        {
            var requests = await _depositRequestRepo.GetAllAsync(status);
            return requests.Select(MapToResponse).ToList();
        }

        public async Task<DepositRequestResponseDTO> ConfirmTransferAsync(long requestId, UserContext context)
        {
            var request = await GetByIdOrThrowAsync(requestId);

            if (request.UserId != context.UserId)
                throw new ForbiddenException("Bạn không có quyền cập nhật yêu cầu nạp tiền này.");

            if (request.Status == WalletDepositRequestStatus.UserConfirmed)
                return MapToResponse(request);

            if (request.Status != WalletDepositRequestStatus.Pending)
                throw new BusinessException("Chỉ có thể xác nhận chuyển khoản cho yêu cầu đang chờ.");

            request.Status = WalletDepositRequestStatus.UserConfirmed;
            request.UserConfirmedAt = DateTime.UtcNow;
            request.UpdatedAt = DateTime.UtcNow;

            await _depositRequestRepo.UpdateAsync(request);
            return MapToResponse(request);
        }

        public async Task<WalletDepositRequest> GetWithLockByIdOrThrowAsync(long requestId)
        {
            return await _depositRequestRepo.GetWithLockByIdAsync(requestId)
                ?? throw new NotFoundException($"Không tìm thấy yêu cầu nạp tiền #{requestId}.");
        }

        public async Task MarkApprovedAsync(WalletDepositRequest request, UserContext admin, string? note = null)
        {
            if (request.Status == WalletDepositRequestStatus.Approved)
                return;

            if (request.Status != WalletDepositRequestStatus.UserConfirmed)
                throw new BusinessException("Chỉ có thể duyệt yêu cầu đã được user xác nhận chuyển khoản.");

            request.Status = WalletDepositRequestStatus.Approved;
            request.ReviewedBy = admin.UserId;
            request.ReviewedAt = DateTime.UtcNow;
            request.AdminNote = note;
            request.UpdatedAt = DateTime.UtcNow;

            await _depositRequestRepo.UpdateAsync(request);
        }

        public async Task MarkRejectedAsync(WalletDepositRequest request, UserContext admin, string? note = null)
        {
            if (request.Status == WalletDepositRequestStatus.Rejected)
                return;

            if (request.Status == WalletDepositRequestStatus.Approved)
                throw new BusinessException("Yêu cầu đã duyệt không thể từ chối.");

            request.Status = WalletDepositRequestStatus.Rejected;
            request.ReviewedBy = admin.UserId;
            request.ReviewedAt = DateTime.UtcNow;
            request.AdminNote = note;
            request.UpdatedAt = DateTime.UtcNow;

            await _depositRequestRepo.UpdateAsync(request);
        }

        public DepositRequestResponseDTO MapToResponse(WalletDepositRequest request)
        {
            return new DepositRequestResponseDTO
            {
                Id = request.Id,
                UserId = request.UserId,
                Amount = request.Amount,
                Code = request.Code,
                TransferContent = request.TransferContent,
                QrImageUrl = request.QrImageUrl,
                Status = request.Status,
                UserConfirmedAt = request.UserConfirmedAt,
                ReviewedBy = request.ReviewedBy,
                ReviewedAt = request.ReviewedAt,
                AdminNote = request.AdminNote,
                CreatedAt = request.CreatedAt,
                UpdatedAt = request.UpdatedAt
            };
        }

        private async Task<WalletDepositRequest> GetByIdOrThrowAsync(long requestId)
        {
            return await _depositRequestRepo.GetByIdAsync(requestId)
                ?? throw new NotFoundException($"Không tìm thấy yêu cầu nạp tiền #{requestId}.");
        }

        private void ValidateAmount(decimal amount)
        {
            if (amount <= 0) throw new BusinessException("Số tiền nạp phải lớn hơn 0.");
            if (amount != decimal.Truncate(amount)) throw new BusinessException("Số tiền nạp VietQR phải là số nguyên VNĐ.");
        }

        private void ValidateVietQrSettings()
        {
            if (string.IsNullOrWhiteSpace(_vietQrSettings.BankId) ||
                string.IsNullOrWhiteSpace(_vietQrSettings.AccountNo) ||
                string.IsNullOrWhiteSpace(_vietQrSettings.AccountName))
            {
                throw new BusinessException("Chưa cấu hình thông tin tài khoản VietQR.");
            }
        }

        private string BuildQrImageUrl(decimal amount, string transferContent)
        {
            var bankId = Uri.EscapeDataString(_vietQrSettings.BankId.Trim());
            var accountNo = Uri.EscapeDataString(_vietQrSettings.AccountNo.Trim());
            var template = string.IsNullOrWhiteSpace(_vietQrSettings.Template) ? "compact2" : _vietQrSettings.Template.Trim();
            var accountName = Uri.EscapeDataString(_vietQrSettings.AccountName.Trim());
            var addInfo = Uri.EscapeDataString(transferContent);

            return $"https://img.vietqr.io/image/{bankId}-{accountNo}-{template}.png?amount={amount:0}&addInfo={addInfo}&accountName={accountName}";
        }

        private static string CreateDepositCode(long userId)
        {
            return $"GTU{userId}{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
        }
    }
}
