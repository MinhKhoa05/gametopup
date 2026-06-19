using System.Globalization;
using System.Security.Cryptography;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers;
using GameTopUp.BLL.Options;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.DAL.Interfaces.Wallets;
using Microsoft.Extensions.Options;

namespace GameTopUp.BLL.Services;

public sealed class WalletDepositService
{
    private readonly IWalletDepositRepository _repository;
    public VietQrSettings VietQrSettings { get; }

    public WalletDepositService(
        IWalletDepositRepository repository,
        IOptions<VietQrSettings> vietQrOptions)
    {
        _repository = repository;
        VietQrSettings = vietQrOptions.Value;
    }

    public async Task<WalletDepositResponseDTO> CreateAsync(UserContext context, decimal amount)
    {
        ValidateAmount(amount);
        ValidateVietQrSettings();

        var code = CreateDepositCode();
        var transferContent = code;
        var request = WalletDeposit.Create(context.UserId, amount, code, transferContent);

        request.Id = await _repository.CreateAsync(request);
        return ToPublicResponse(request);
    }

    public async Task<WalletDeposit> GetByIdOrThrowAsync(long depositId)
    {
        return await _repository.GetByIdAsync(depositId)
            ?? throw new NotFoundException(
                ErrorCode.DepositRequestNotFound,
                $"Deposit request #{depositId} was not found.");
    }

    public async Task<List<WalletDepositResponseDTO>> GetByUserAsync(UserContext context, WalletDepositStatus? status = null)
    {
        var deposits = await GetHistoryEntitiesAsync(context.UserId, status);
        return deposits
            .Select(ToPublicResponse)
            .ToList();
    }

    public async Task<List<AdminDepositRequestResponseDTO>> GetAllAsync(WalletDepositStatus? status = null)
    {
        var deposits = await GetAllEntitiesAsync(status);
        return deposits
            .Select(ToAdminResponse)
            .ToList();
    }

    public Task<List<WalletDeposit>> GetHistoryEntitiesAsync(long userId, WalletDepositStatus? status = null)
    {
        return _repository.GetByUserIdAsync(userId, status);
    }

    public Task<List<WalletDeposit>> GetAllEntitiesAsync(WalletDepositStatus? status = null)
    {
        return _repository.GetAllAsync(status);
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

    public WalletDepositResponseDTO ToPublicResponse(WalletDeposit request)
    {
        return BuildPublicResponse(request);
    }

    public AdminDepositRequestResponseDTO ToAdminResponse(WalletDeposit request)
    {
        return request.MapTo<AdminDepositRequestResponseDTO>();
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
        if (string.IsNullOrWhiteSpace(VietQrSettings.BankId)
            || string.IsNullOrWhiteSpace(VietQrSettings.AccountNo)
            || string.IsNullOrWhiteSpace(VietQrSettings.AccountName))
        {
            throw new BusinessException(ErrorCode.VietQrSettingsMissing);
        }
    }

    private static string BuildQrImageUrl(VietQrSettings settings)
    {
        var bankId = Uri.EscapeDataString(settings.BankId.Trim());
        var accountNo = Uri.EscapeDataString(settings.AccountNo.Trim());
        var template = string.IsNullOrWhiteSpace(settings.Template) ? "compact2" : settings.Template.Trim();

        return $"https://img.vietqr.io/image/{bankId}-{accountNo}-{template}.png";
    }

    private WalletDepositResponseDTO BuildPublicResponse(WalletDeposit request)
    {
        var response = request.MapTo<WalletDepositResponseDTO>();
        response.QrImageUrl = BuildQrImageUrl(VietQrSettings);
        response.BankId = VietQrSettings.BankId;
        response.AccountNo = VietQrSettings.AccountNo;
        response.AccountName = VietQrSettings.AccountName;
        return response;
    }

    private static string CreateDepositCode()
    {
        var localNow = DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(7));
        var datePart = localNow.ToString("ddMM", CultureInfo.InvariantCulture);
        var randomPart = RandomNumberGenerator.GetInt32(10000, 100000).ToString(CultureInfo.InvariantCulture);

        return $"GTU-{datePart}-{randomPart}";
    }
}
