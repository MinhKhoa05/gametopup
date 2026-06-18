using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Mappers.Wallets;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.DAL.Interfaces.Wallets;

namespace GameTopUp.BLL.Queries.Wallets;

public sealed class AdminDepositRequestQuery
{
    private readonly IWalletDepositRequestRepository _depositRequestRepository;

    public AdminDepositRequestQuery(IWalletDepositRequestRepository depositRequestRepository)
    {
        _depositRequestRepository = depositRequestRepository;
    }

    public async Task<List<AdminDepositRequestResponseDTO>> GetAllAsync(WalletDepositRequestStatus? status = null)
    {
        var requests = await _depositRequestRepository.GetAllAsync(status);
        return requests.Select(WalletMapper.ToAdminDepositRequestResponse).ToList();
    }
}
