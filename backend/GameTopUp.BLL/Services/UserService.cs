using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers.Users;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.DAL.Interfaces.Users;

namespace GameTopUp.BLL.Services;

public sealed class UserService
{
    private readonly IUserRepository _repository;

    public UserService(IUserRepository repository)
    {
        _repository = repository;
    }

    public Task<User?> GetByEmailAsync(string email) => _repository.GetByEmailAsync(email);

    public async Task<User> GetByIdOrThrowAsync(long id)
    {
        return await _repository.GetByIdAsync(id) ?? throw new NotFoundException(ErrorCode.UserNotFound);
    }

    public async Task<long> CreateUserAsync(CreateUserRequest request)
    {
        if (await _repository.ExistsByEmailAsync(request.Email))
        {
            throw new BusinessException(ErrorCode.EmailExists);
        }

        var user = User.Create(request.DisplayName, request.Email, request.Password);
        return await _repository.CreateAsync(user);
    }

    public Task UpdatePasswordAsync(long userId, string newPasswordHash) =>
        _repository.UpdatePasswordAsync(userId, newPasswordHash);

    public async Task<UserResponseDTO> GetProfileAsync(UserContext actor, long userId)
    {
        EnsureCanAccessUser(actor, userId);
        var user = await GetByIdOrThrowAsync(userId);
        return UserMapper.ToResponse(user);
    }

    public async Task<IEnumerable<UserResponseDTO>> GetAllAsync(int page, int pageSize)
    {
        var users = await _repository.GetAllAsync(page, pageSize);
        return users.Select(UserMapper.ToResponse);
    }

    public Task UpdateProfileAsync(UserContext actor, long id, UpdateUserRequest request)
    {
        return UpdateProfileInternalAsync(actor, id, request);
    }

    public Task DeleteAsync(long id)
    {
        return DeleteInternalAsync(id);
    }

    private async Task UpdateProfileInternalAsync(UserContext actor, long id, UpdateUserRequest request)
    {
        EnsureCanAccessUser(actor, id);
        var user = await GetByIdOrThrowAsync(id);

        if (!string.IsNullOrWhiteSpace(request.Email)
            && !string.Equals(user.Email, request.Email, StringComparison.OrdinalIgnoreCase)
            && await _repository.ExistsByEmailAsync(request.Email))
        {
            throw new BusinessException(ErrorCode.EmailExists);
        }

        if (!string.IsNullOrWhiteSpace(request.DisplayName))
        {
            user.DisplayName = request.DisplayName;
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            user.Email = request.Email;
        }

        if (request.Role is not null)
        {
            user.Role = request.Role.Value;
        }

        if (request.IsActive is not null)
        {
            user.IsActive = request.IsActive.Value;
        }

        user.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(user);
    }

    private static void EnsureCanAccessUser(UserContext actor, long targetUserId)
    {
        if (actor.IsAdmin || actor.UserId == targetUserId)
        {
            return;
        }

        throw new ForbiddenException(ErrorCode.Forbidden);
    }

    private async Task DeleteInternalAsync(long id)
    {
        await GetByIdOrThrowAsync(id);
        await _repository.DeleteAsync(id);
    }
}
