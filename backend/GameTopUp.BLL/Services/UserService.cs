using Mapster;
using GameTopUp.DAL.Interfaces.Users;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities;

namespace GameTopUp.BLL.Services
{
    public class UserService
    {
        private readonly IUserRepository _userRepo;

        public UserService(IUserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        public async Task<IEnumerable<UserResponseDTO>> GetAllAsync(int page, int pageSize)
        {
            var users = await _userRepo.GetAllAsync(page, pageSize);
            return users.Adapt<IEnumerable<UserResponseDTO>>();
        }

        public async Task<User> GetByIdOrThrowAsync(long id)
        {
            var user = await _userRepo.GetByIdAsync(id) ?? throw new NotFoundException(ErrorCode.UserNotFound);
            return user;
        }

        public async Task<long> CreateUserAsync(CreateUserRequest request)
        {
            var isEmailExists = await _userRepo.ExistsByEmailAsync(request.Email);
            if (isEmailExists){
                throw new BusinessException(ErrorCode.EmailExists);
            }

            var user = User.Create(request.Name, request.Email, request.Password);

            return await _userRepo.CreateAsync(user);
        }

        public async Task UpdateProfileAsync(long id, UpdateUserRequest request)
        {
            var user = await GetByIdOrThrowAsync(id);
            request.Adapt(user);
            await _userRepo.UpdateAsync(user);
        }

        public async Task DeleteAsync(long id)
        {
            var user = await GetByIdOrThrowAsync(id);
            await _userRepo.DeleteAsync(id);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _userRepo.GetByEmailAsync(email);
        }

        public async Task<UserResponseDTO> GetProfileAsync(long userId)
        {
            var user = await GetByIdOrThrowAsync(userId);
            return user.Adapt<UserResponseDTO>();
        }

        public async Task UpdatePasswordAsync(long userId, string newPasswordHash)
        {
            await _userRepo.UpdatePasswordAsync(userId, newPasswordHash);
        }
    }
}
