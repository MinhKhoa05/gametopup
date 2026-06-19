using GameTopUp.BLL.DTOs.Users;
using GameTopUp.DAL.Entities.Users;
using Mapster;

namespace GameTopUp.BLL.Mappers.Users;

public static class UserMapper
{
    public static UserResponseDTO ToResponse(User user)
    {
        return user.Adapt<UserResponseDTO>(BackendMapsterConfig.Config);
    }
}
