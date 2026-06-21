using GameTopUp.BLL.Common;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.DAL.Interfaces.Users;

namespace GameTopUp.BLL.Services.Users;

public sealed class UserService
{
    private readonly IUserRepository _repository;

    public UserService(IUserRepository userRepository)
    {
        _repository = userRepository;
    }

    public async Task<UserResponseDTO> GetByIdAsync(long id)
    {
        var user = await GetByIdOrThrowAsync(id);
        return user.MapTo<UserResponseDTO>();
    }

    public async Task<IEnumerable<UserResponseDTO>> GetAllAsync(int page, int pageSize)
    {
        var users = await _repository.GetAllAsync(page, pageSize);
        return users.Select(user => user.MapTo<UserResponseDTO>());
    }

    public async Task UpdateProfileAsync(long id, UpdateProfileRequest request)
    {
        var user = await GetByIdOrThrowAsync(id);

        user.DisplayName = InputTextNormalizer.NullIfWhiteSpace(request.DisplayName) ?? string.Empty;
        user.UpdatedAt = DateTime.UtcNow;
        
        await _repository.UpdateAsync(user);
    }

    public async Task DeleteAsync(long id)
    {
        await GetByIdOrThrowAsync(id);
        await _repository.DeleteAsync(id);
    }

    private async Task<User> GetByIdOrThrowAsync(long id)
    {
        return await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException(ErrorCode.UserNotFound);
    }
}
