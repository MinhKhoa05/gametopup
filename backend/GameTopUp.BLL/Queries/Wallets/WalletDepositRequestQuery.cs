using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Mappers.Wallets;
using GameTopUp.BLL.Options;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.DAL.Interfaces.Wallets;
using Microsoft.Extensions.Options;

namespace GameTopUp.BLL.Queries.Wallets;

public sealed class WalletDepositRequestQuery
{
    private readonly IWalletDepositRequestRepository _depositRequestRepository;
    private readonly VietQrSettings _vietQrSettings;

    public WalletDepositRequestQuery(
        IWalletDepositRequestRepository depositRequestRepository,
        IOptions<VietQrSettings> vietQrOptions)
    {
        _depositRequestRepository = depositRequestRepository;
        _vietQrSettings = vietQrOptions.Value;
    }

    public async Task<List<WalletDepositRequestResponseDTO>> GetByUserAsync(UserContext context, WalletDepositRequestStatus? status = null)
    {
        var requests = await _depositRequestRepository.GetByUserIdAsync(context.UserId, status);
        return requests.Select(request => WalletMapper.ToPublicDepositRequestResponse(request, _vietQrSettings)).ToList();
    }
}
