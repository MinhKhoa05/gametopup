using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Options;
using GameTopUp.DAL.Entities.Wallets;

namespace GameTopUp.BLL.Mappers.Wallets;

public static class WalletMapper
{
    public static WalletTransactionInfo ToTransactionResponse(WalletTransaction transaction)
    {
        return new WalletTransactionInfo
        {
            Id = transaction.Id,
            Amount = transaction.Amount,
            BalanceBefore = transaction.BalanceBefore,
            BalanceAfter = transaction.BalanceAfter,
            Type = transaction.Type,
            Description = transaction.Description,
            OrderId = transaction.OrderId,
            CreatedAt = transaction.CreatedAt
        };
    }

    public static WalletDepositRequestResponseDTO ToPublicDepositRequestResponse(
        WalletDepositRequest request,
        VietQrSettings settings)
    {
        return new WalletDepositRequestResponseDTO
        {
            Id = request.Id,
            Amount = request.Amount,
            Code = request.Code,
            TransferContent = request.TransferContent,
            QrImageUrl = BuildQrImageUrl(settings),
            BankId = settings.BankId,
            AccountNo = settings.AccountNo,
            AccountName = settings.AccountName,
            Status = request.Status,
            UserConfirmedAt = request.UserConfirmedAt,
            CreatedAt = request.CreatedAt,
            UpdatedAt = request.UpdatedAt
        };
    }

    public static AdminDepositRequestResponseDTO ToAdminDepositRequestResponse(WalletDepositRequest request)
    {
        return new AdminDepositRequestResponseDTO
        {
            Id = request.Id,
            UserId = request.UserId,
            Amount = request.Amount,
            Code = request.Code,
            Status = request.Status,
            UserConfirmedAt = request.UserConfirmedAt,
            ReviewedBy = request.ReviewedBy,
            ReviewedAt = request.ReviewedAt,
            AdminNote = request.AdminNote,
            CreatedAt = request.CreatedAt,
            UpdatedAt = request.UpdatedAt
        };
    }

    public static string BuildQrImageUrl(VietQrSettings settings)
    {
        var bankId = Uri.EscapeDataString(settings.BankId.Trim());
        var accountNo = Uri.EscapeDataString(settings.AccountNo.Trim());
        var template = string.IsNullOrWhiteSpace(settings.Template) ? "compact2" : settings.Template.Trim();

        return $"https://img.vietqr.io/image/{bankId}-{accountNo}-{template}.png";
    }
}
