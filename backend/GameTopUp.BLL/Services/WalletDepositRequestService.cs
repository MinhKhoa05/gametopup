using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Options;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.DAL.Interfaces.Wallets;
using Microsoft.Extensions.Options;

namespace GameTopUp.BLL.Services;

public sealed class WalletDepositRequestService
{
    private readonly IWalletDepositRequestRepository _repository;
    private readonly VietQrSettings _vietQrSettings;

    public WalletDepositRequestService(
        IWalletDepositRequestRepository repository,
        IOptions<VietQrSettings> vietQrOptions)
    {
        _repository = repository;
        _vietQrSettings = vietQrOptions.Value;
    }

    public async Task<DepositRequestResponseDTO> CreateAsync(UserContext context, decimal amount)
    {
        ValidateAmount(amount);
        ValidateVietQrSettings();

        var code = CreateDepositCode(context.UserId);
        var transferContent = $"NAP {code}";
        var qrImageUrl = BuildQrImageUrl(amount, transferContent);
        var request = WalletDepositRequest.Create(context.UserId, amount, code, transferContent, qrImageUrl);

        request.Id = await _repository.CreateAsync(request);
        return MapToResponse(request);
    }

    public async Task<List<DepositRequestResponseDTO>> GetByUserAsync(UserContext context, WalletDepositRequestStatus? status = null)
    {
        var requests = await _repository.GetByUserIdAsync(context.UserId, status);
        return requests.Select(MapToResponse).ToList();
    }

    public async Task<List<DepositRequestResponseDTO>> GetAllAsync(WalletDepositRequestStatus? status = null)
    {
        var requests = await _repository.GetAllAsync(status);
        return requests.Select(MapToResponse).ToList();
    }

    public async Task<DepositRequestResponseDTO> ConfirmTransferAsync(long requestId, UserContext context)
    {
        var request = await _repository.GetWithLockByIdAsync(requestId)
            ?? throw new NotFoundException(ErrorCode.DepositRequestNotFound, $"Deposit request #{requestId} was not found.");

        if (request.UserId != context.UserId)
        {
            throw new ForbiddenException(ErrorCode.DepositRequestForbidden);
        }

        if (request.Status == WalletDepositRequestStatus.UserConfirmed)
        {
            return MapToResponse(request);
        }

        if (request.Status != WalletDepositRequestStatus.Pending)
        {
            throw new BusinessException(ErrorCode.DepositConfirmOnlyPending);
        }

        request.MarkUserConfirmed(DateTime.UtcNow);

        await _repository.UpdateAsync(request);
        return MapToResponse(request);
    }

    public async Task<WalletDepositRequest> GetWithLockByIdOrThrowAsync(long requestId)
    {
        return await _repository.GetWithLockByIdAsync(requestId)
            ?? throw new NotFoundException(ErrorCode.DepositRequestNotFound, $"Deposit request #{requestId} was not found.");
    }

    public async Task MarkApprovedAsync(WalletDepositRequest request, UserContext admin, string? note = null)
    {
        if (request.Status == WalletDepositRequestStatus.Approved)
        {
            return;
        }

        if (request.Status != WalletDepositRequestStatus.UserConfirmed)
        {
            throw new BusinessException(ErrorCode.DepositApproveOnlyUserConfirmed);
        }

        request.MarkApproved(admin.UserId, note, DateTime.UtcNow);

        await _repository.UpdateAsync(request);
    }

    public async Task MarkRejectedAsync(WalletDepositRequest request, UserContext admin, string? note = null)
    {
        if (request.Status == WalletDepositRequestStatus.Rejected)
        {
            return;
        }

        if (request.Status == WalletDepositRequestStatus.Approved)
        {
            throw new BusinessException(ErrorCode.ApprovedDepositCannotBeRejected);
        }

        request.MarkRejected(admin.UserId, note, DateTime.UtcNow);

        await _repository.UpdateAsync(request);
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
            BankId = _vietQrSettings.BankId,
            AccountNo = _vietQrSettings.AccountNo,
            AccountName = _vietQrSettings.AccountName,
            Status = request.Status,
            UserConfirmedAt = request.UserConfirmedAt,
            ReviewedBy = request.ReviewedBy,
            ReviewedAt = request.ReviewedAt,
            AdminNote = request.AdminNote,
            CreatedAt = request.CreatedAt,
            UpdatedAt = request.UpdatedAt
        };
    }

    private void ValidateAmount(decimal amount)
    {
        if (amount <= 0)
        {
            throw new BusinessException(ErrorCode.AmountMustBePositive);
        }

        if (amount != decimal.Truncate(amount))
        {
            throw new BusinessException(ErrorCode.DepositAmountMustBeInteger);
        }
    }

    private void ValidateVietQrSettings()
    {
        if (string.IsNullOrWhiteSpace(_vietQrSettings.BankId)
            || string.IsNullOrWhiteSpace(_vietQrSettings.AccountNo)
            || string.IsNullOrWhiteSpace(_vietQrSettings.AccountName))
        {
            throw new BusinessException(ErrorCode.VietQrSettingsMissing);
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
