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

        public async Task<UserResponseDTO> GetByIdAsync(long id)
        {
            var user = await _userRepo.GetByIdAsync(id) ?? throw new NotFoundException(ErrorCodes.UserNotFound);
            return user.Adapt<UserResponseDTO>();
        }

        public async Task<long> RegisterWithHashedPasswordAsync(CreateUserRequest request, string hashedPassword)
        {
            var existingUser = await _userRepo.GetByEmailAsync(request.Email);
            if (existingUser != null)
            {
                throw new BusinessException(ErrorCodes.EmailExists);
            }

            var user = User.Create(request.Name, request.Email, hashedPassword);

            return await _userRepo.CreateAsync(user);
        }

        public async Task UpdateProfileAsync(long id, UpdateUserRequest request)
        {
            var user = await _userRepo.GetByIdAsync(id) ?? throw new NotFoundException(ErrorCodes.UserNotFound);
            request.Adapt(user);
            await _userRepo.UpdateAsync(user);
        }

        public async Task DeleteAsync(long id)
        {
            var user = await _userRepo.GetByIdAsync(id) ?? throw new NotFoundException(ErrorCodes.UserNotFound);
            await _userRepo.DeleteAsync(id);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _userRepo.GetByEmailAsync(email);
        }

        public async Task<User> GetProfileAsync(long userId)
        {
            var user = await _userRepo.GetByIdAsync(userId) ?? throw new NotFoundException(ErrorCodes.UserNotFound);
            return user;
        }

        public async Task ChangePasswordAsync(long userId, string newPasswordHash)
        {
            await _userRepo.UpdatePasswordAsync(userId, newPasswordHash);
        }
    }
}
