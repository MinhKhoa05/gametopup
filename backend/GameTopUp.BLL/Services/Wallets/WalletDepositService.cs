using System.Globalization;
using System.Security.Cryptography;
using GameTopUp.BLL.Utilities;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers;
using GameTopUp.BLL.Options;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
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

    public async Task<WalletDepositResponse> GetByIdOrThrowAsync(UserContext actor, long depositId)
    {
        var request = await _repository.GetByIdAsync(depositId)
            ?? throw new NotFoundException(ErrorCode.DepositRequestNotFound);

        if (!actor.IsAdmin && request.UserId != actor.UserId)
        {
            throw new ForbiddenException(ErrorCode.Forbidden);
        }

        return request.MapTo<WalletDepositResponse>();
    }

    public async Task<WalletDeposit> LockByIdOrThrowAsync(long depositId)
    {
        return await _repository.GetWithLockByIdAsync(depositId)
            ?? throw new NotFoundException(ErrorCode.DepositRequestNotFound);
    }

    public async Task<CursorPageResponse<WalletDepositResponse>> GetByUserAsync(
        UserContext context,
        WalletDepositFilter? filter,
        long? cursor,
        int? limit)
    {
        return await CursorPageMappings.ToCursorPageAsync(
            limit,
            take => _repository.GetByUserIdAsync(
                context.UserId,
                ToDepositStatuses(filter),
                cursor,
                take),
            BuildPublicResponse,
            deposit => deposit.Id);
    }

    public async Task<CursorPageResponse<WalletDepositResponse>> GetAllAsync(
        WalletDepositFilter? filter,
        long? cursor,
        int? limit)
    {
        return await CursorPageMappings.ToCursorPageAsync(
            limit,
            take => _repository.GetAllAsync(
                ToDepositStatuses(filter),
                cursor,
                take),
            request => request.MapTo<WalletDepositResponse>(),
            request => request.Id);
    }

    public async Task<WalletDepositResponse> CreateAsync(UserContext context, decimal amount)
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
        var now = DateTimeOffset.UtcNow;
        var request = new WalletDeposit
        {
            UserId = context.UserId,
            Amount = amount,
            Code = code,
            TransferContent = transferContent,
            Status = WalletDepositStatus.Pending,
            CreatedAt = now,
            UpdatedAt = now
        };

        request.Id = await _repository.CreateAsync(request);
        return BuildPublicResponse(request);
    }

    public WalletDeposit Confirm(WalletDeposit deposit, UserContext actor, DateTimeOffset now)
    {
        ArgumentNullException.ThrowIfNull(deposit);
        ArgumentNullException.ThrowIfNull(actor);

        if (deposit.UserId != actor.UserId)
        {
            throw new ForbiddenException(ErrorCode.Forbidden);
        }

        if (deposit.Status != WalletDepositStatus.Pending)
        {
            throw new BusinessException(ErrorCode.InvalidDepositStatus);
        }

        deposit.MarkUserConfirmed(now);
        return deposit;
    }

    public WalletDeposit Approve(WalletDeposit deposit, UserContext admin, DateTimeOffset now, string? note = null)
    {
        ArgumentNullException.ThrowIfNull(deposit);
        ArgumentNullException.ThrowIfNull(admin);

        if (deposit.Status != WalletDepositStatus.UserConfirmed)
        {
            throw new BusinessException(ErrorCode.InvalidDepositStatus);
        }

        deposit.MarkApproved(admin.UserId, note, now);
        return deposit;
    }

    public WalletDeposit Reject(WalletDeposit deposit, UserContext admin, DateTimeOffset now, string? note = null)
    {
        ArgumentNullException.ThrowIfNull(deposit);
        ArgumentNullException.ThrowIfNull(admin);

        if (deposit.Status != WalletDepositStatus.UserConfirmed)
        {
            throw new BusinessException(ErrorCode.InvalidDepositStatus);
        }

        deposit.MarkRejected(admin.UserId, note, now);

        return deposit;
    }

    public WalletDepositResponse BuildPublicResponse(WalletDeposit request)
    {
        var response = request.MapTo<WalletDepositResponse>();
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

    private static WalletDepositStatus[]? ToDepositStatuses(WalletDepositFilter? filter)
    {
        return filter switch
        {
            WalletDepositFilter.Active => [WalletDepositStatus.Pending, WalletDepositStatus.UserConfirmed],
            WalletDepositFilter.Watching => [WalletDepositStatus.Pending, WalletDepositStatus.UserConfirmed],
            WalletDepositFilter.Pending => [WalletDepositStatus.Pending],
            WalletDepositFilter.UserConfirmed => [WalletDepositStatus.UserConfirmed],
            WalletDepositFilter.Approved => [WalletDepositStatus.Approved],
            WalletDepositFilter.Rejected => [WalletDepositStatus.Rejected],
            _ => null
        };
    }

}
