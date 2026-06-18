using System.Globalization;
using System.Security.Cryptography;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers.Wallets;
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

    public async Task<WalletDepositRequestResponseDTO> CreateAsync(UserContext context, decimal amount)
    {
        ValidateAmount(amount);
        ValidateVietQrSettings();

        var code = CreateDepositCode();
        var transferContent = code;
        var request = WalletDepositRequest.Create(context.UserId, amount, code, transferContent);

        request.Id = await _repository.CreateAsync(request);
        return MapToPublicResponse(request);
    }

    public async Task<WalletDepositRequestResponseDTO> ConfirmTransferAsync(long requestId, UserContext context)
    {
        var request = await _repository.GetWithLockByIdAsync(requestId)
            ?? throw new NotFoundException(ErrorCode.DepositRequestNotFound, $"Deposit request #{requestId} was not found.");

        if (request.UserId != context.UserId)
        {
            throw new ForbiddenException(ErrorCode.DepositRequestForbidden);
        }

        if (request.Status == WalletDepositRequestStatus.UserConfirmed)
        {
            return MapToPublicResponse(request);
        }

        if (request.Status != WalletDepositRequestStatus.Pending)
        {
            throw new BusinessException(ErrorCode.DepositConfirmOnlyPending);
        }

        request.MarkUserConfirmed(DateTime.UtcNow);

        await _repository.UpdateAsync(request);
        return MapToPublicResponse(request);
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

    public WalletDepositRequestResponseDTO MapToPublicResponse(WalletDepositRequest request)
    {
        return WalletMapper.ToPublicDepositRequestResponse(request, _vietQrSettings);
    }

    public AdminDepositRequestResponseDTO MapToAdminResponse(WalletDepositRequest request)
    {
        return WalletMapper.ToAdminDepositRequestResponse(request);
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

    private static string CreateDepositCode()
    {
        var localNow = DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(7));
        var datePart = localNow.ToString("ddMM", CultureInfo.InvariantCulture);
        var randomPart = RandomNumberGenerator.GetInt32(10000, 100000).ToString(CultureInfo.InvariantCulture);

        return $"GTU-{datePart}-{randomPart}";
    }
}
