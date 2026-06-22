using System.Globalization;
using System.Security.Cryptography;
using GameTopUp.BLL.Common;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers;
using GameTopUp.BLL.Options;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.DAL.Interfaces.Wallets;
using Microsoft.Extensions.Options;

namespace GameTopUp.BLL.Services.Wallets;

public sealed class WalletDepositService
{
    private readonly IWalletDepositRepository _repository;

    private readonly VietQrSettings _vietQrSettings;

    public WalletDepositService(
        IWalletDepositRepository repository,
        IOptions<VietQrSettings> vietQrOptions)
    {
        _repository = repository;
        _vietQrSettings = vietQrOptions.Value;
    }

    public async Task<WalletDepositResponseDTO> GetByIdOrThrowAsync(UserContext actor, long depositId)
    {
        var request = await _repository.GetByIdAsync(depositId)
            ?? throw new NotFoundException(ErrorCode.DepositRequestNotFound);

        if (!actor.IsAdmin && request.UserId != actor.UserId)
        {
            throw new ForbiddenException(ErrorCode.DepositRequestForbidden);
        }

        return request.MapTo<WalletDepositResponseDTO>();
    }

    public async Task<WalletDeposit> LockByIdOrThrowAsync(long depositId)
    {
        return await _repository.GetWithLockByIdAsync(depositId)
            ?? throw new NotFoundException(ErrorCode.DepositRequestNotFound);
    }

    public async Task<List<WalletDepositResponseDTO>> GetByUserAsync(UserContext context, WalletDepositStatus? status = null)
    {
        var deposits = await _repository.GetByUserIdAsync(context.UserId, status);
        return deposits
            .Select(BuildPublicResponse)
            .ToList();
    }

    public async Task<List<AdminDepositRequestResponseDTO>> GetAllAsync(WalletDepositStatus? status = null)
    {
        var deposits = await _repository.GetAllAsync(status);
        return deposits
            .Select(request => request.MapTo<AdminDepositRequestResponseDTO>())
            .ToList();
    }

    public async Task<WalletDepositResponseDTO> CreateAsync(UserContext context, decimal amount)
    {
        if (amount <= 0)
        {
            throw new BusinessException(ErrorCode.AmountMustBePositive);
        }

        if (amount != decimal.Truncate(amount))
        {
            throw new BusinessException(ErrorCode.DepositAmountMustBeInteger);
        }

        EnsureVietQrConfigured();

        var code = CreateDepositCode();
        var transferContent = code;
        var request = WalletDeposit.Create(context.UserId, amount, code, transferContent);

        request.Id = await _repository.CreateAsync(request);
        return BuildPublicResponse(request);
    }

    public WalletDeposit Confirm(WalletDeposit deposit, UserContext actor, DateTime now)
    {
        ArgumentNullException.ThrowIfNull(deposit);
        ArgumentNullException.ThrowIfNull(actor);

        if (deposit.UserId != actor.UserId)
        {
            throw new ForbiddenException(ErrorCode.DepositRequestForbidden);
        }

        if (deposit.Status != WalletDepositStatus.Pending)
        {
            throw new BusinessException(ErrorCode.DepositConfirmOnlyPending);
        }

        deposit.MarkUserConfirmed(now);
        return deposit;
    }

    public WalletDeposit Approve(WalletDeposit deposit, UserContext admin, DateTime now, string? note = null)
    {
        ArgumentNullException.ThrowIfNull(deposit);
        ArgumentNullException.ThrowIfNull(admin);

        if (deposit.Status != WalletDepositStatus.UserConfirmed)
        {
            throw new BusinessException(ErrorCode.DepositApproveOnlyUserConfirmed);
        }

        deposit.MarkApproved(admin.UserId, note, now);
        return deposit;
    }

    public WalletDeposit Reject(WalletDeposit deposit, UserContext admin, DateTime now, string? note = null)
    {
        ArgumentNullException.ThrowIfNull(deposit);
        ArgumentNullException.ThrowIfNull(admin);

        if (deposit.Status == WalletDepositStatus.Approved)
        {
            throw new BusinessException(ErrorCode.ApprovedDepositCannotBeRejected);
        }

        deposit.MarkRejected(admin.UserId, note, now);
        return deposit;
    }

    public WalletDepositResponseDTO BuildPublicResponse(WalletDeposit request)
    {
        var response = request.MapTo<WalletDepositResponseDTO>();
        response.QrImageUrl = BuildQrImageUrl(_vietQrSettings);
        response.BankId = _vietQrSettings.BankId;
        response.AccountNo = _vietQrSettings.AccountNo;
        response.AccountName = _vietQrSettings.AccountName;
        return response;
    }

    public async Task UpdateAsync(WalletDeposit deposit)
    {
        ArgumentNullException.ThrowIfNull(deposit);
        await _repository.UpdateAsync(deposit);
    }

    private void EnsureVietQrConfigured()
    {
        if (InputTextNormalizer.NullIfWhiteSpace(_vietQrSettings.BankId) is null
            || InputTextNormalizer.NullIfWhiteSpace(_vietQrSettings.AccountNo) is null
            || InputTextNormalizer.NullIfWhiteSpace(_vietQrSettings.AccountName) is null)
        {
            throw new BusinessException(ErrorCode.VietQrSettingsMissing);
        }
    }

    private static string BuildQrImageUrl(VietQrSettings settings)
    {
        var bankId = Uri.EscapeDataString(InputTextNormalizer.NullIfWhiteSpace(settings.BankId)!);
        var accountNo = Uri.EscapeDataString(InputTextNormalizer.NullIfWhiteSpace(settings.AccountNo)!);
        var template = InputTextNormalizer.NullIfWhiteSpace(settings.Template) ?? "compact2";

        return $"https://img.vietqr.io/image/{bankId}-{accountNo}-{template}.png";
    }

    private static string CreateDepositCode()
    {
        var localNow = DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(7));
        var datePart = localNow.ToString("ddMM", CultureInfo.InvariantCulture);
        var randomPart = RandomNumberGenerator.GetInt32(10000, 100000).ToString(CultureInfo.InvariantCulture);

        return $"GTU-{datePart}-{randomPart}";
    }
}
