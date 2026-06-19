using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Mappers;
using GameTopUp.BLL.Options;
using GameTopUp.DAL.Entities.Wallets;
using Mapster;

namespace GameTopUp.BLL.Mappers.Wallets;

public static class WalletMapper
{
    public static WalletTransactionInfo ToTransactionResponse(WalletTransaction transaction)
    {
        return transaction.Adapt<WalletTransactionInfo>(BackendMapsterConfig.Config);
    }

    public static WalletDepositRequestResponseDTO ToPublicDepositRequestResponse(
        WalletDepositRequest request,
        VietQrSettings settings)
    {
        var response = request.Adapt<WalletDepositRequestResponseDTO>(BackendMapsterConfig.Config);
        response.QrImageUrl = BuildQrImageUrl(settings);
        response.BankId = settings.BankId;
        response.AccountNo = settings.AccountNo;
        response.AccountName = settings.AccountName;
        return response;
    }

    public static AdminDepositRequestResponseDTO ToAdminDepositRequestResponse(WalletDepositRequest request)
    {
        return request.Adapt<AdminDepositRequestResponseDTO>(BackendMapsterConfig.Config);
    }

    public static string BuildQrImageUrl(VietQrSettings settings)
    {
        var bankId = Uri.EscapeDataString(settings.BankId.Trim());
        var accountNo = Uri.EscapeDataString(settings.AccountNo.Trim());
        var template = string.IsNullOrWhiteSpace(settings.Template) ? "compact2" : settings.Template.Trim();

        return $"https://img.vietqr.io/image/{bankId}-{accountNo}-{template}.png";
    }
}
