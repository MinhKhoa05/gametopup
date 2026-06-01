using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Auths;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.Services.Auth;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using Mapster;

namespace GameTopUp.BLL.UseCases
{
    public class AuthUseCase
    {
        private readonly UserService _userService;
        private readonly TokenService _tokenService;
        private readonly PasswordService _passwordService;
        private readonly WalletService _walletService;
        private readonly RefreshTokenService _refreshTokenService;
        private readonly DatabaseContext _database;

        private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(7);

        public AuthUseCase(
            UserService userService,
            TokenService tokenService,
            PasswordService passwordService,
            WalletService walletService,
            RefreshTokenService refreshTokenService,
            DatabaseContext database)
        {
            _userService = userService;
            _tokenService = tokenService;
            _passwordService = passwordService;
            _walletService = walletService;
            _refreshTokenService = refreshTokenService;
            _database = database;
        }

        public async Task RegisterAsync(CreateUserRequest request)
        {
            _passwordService.Validate(request.Password);

            // Hash mật khẩu trước khi lưu vào DB.
            request.Password = _passwordService.Hash(request.Password);

            await _database.ExecuteInTransactionAsync(async () =>
            {
                // Tạo user trước.
                var userId = await _userService.CreateUserAsync(request);

                // Tạo ví trong cùng transaction để đảm bảo đồng bộ dữ liệu.
                await _walletService.CreateWalletAsync(userId);
            });
        }

        public async Task<AuthResponseDTO> LoginAsync(LoginRequest request)
        {
            var user = await _userService.GetByEmailAsync(request.Email);

            // Không tiết lộ email hay password sai để tránh dò tài khoản.
            if (user == null || !_passwordService.Verify(request.Password, user.PasswordHash))
            {
                throw new BusinessException(ErrorCode.InvalidCredentials);
            }

            // Phát cặp token cho user.
            var tokens = await IssueTokenPairAsync(user);

            var response = new AuthResponseDTO
            {
                AccessToken = tokens.AccessToken,
                RefreshToken = tokens.RefreshToken,
                User = user.Adapt<UserResponseDTO>()
            };

            return response;
        }

        public async Task<AuthResponseDTO> RefreshAsync(string refreshTokenString)
        {
            // Hash token trước khi validate trong DB.
            var hash = _tokenService.HashToken(refreshTokenString);

            return await _database.ExecuteInTransactionAsync(async () =>
            {
                // Revoke token cũ để tránh reuse token
                var refreshToken = await _refreshTokenService.RevokeTokenAsync(hash);
                if (refreshToken == null)
                {
                    throw new BusinessException(ErrorCode.InvalidRefreshToken); // Token không hợp lệ hoặc đã bị revoke.
                }

                // Lấy user để phát cặp token mới
                var user = await _userService.GetByIdOrThrowAsync(refreshToken.UserId);    

                var tokens = await IssueTokenPairAsync(user);

                var response = new AuthResponseDTO
                {
                    AccessToken = tokens.AccessToken,
                    RefreshToken = tokens.RefreshToken
                };

                return response;
            });
        }

        public async Task LogoutAsync(string refreshToken)
        {
            try
            {
                // Hash token trước khi revoke.
                var hash = _tokenService.HashToken(refreshToken);

                // Revoke token để logout, không cần quan tâm revoke thành công hay không
                await _refreshTokenService.RevokeTokenAsync(hash);
            } 
            catch (Exception ex)
            {
                // Ghi log lỗi revoke token nhưng không ném exception ra ngoài để tránh ảnh hưởng trải nghiệm người dùng.
                Console.Error.WriteLine($"Failed to revoke refresh token: {ex.Message}");
            }
        }

        public async Task ChangePasswordAsync(UserContext context, PasswordChangeRequest request)
        {
            // Không cho phép dùng lại mật khẩu cũ.
            if (request.CurrentPassword == request.NewPassword)
            {
                throw new BusinessException(ErrorCode.NewPasswordSameAsCurrent);
            }

            _passwordService.Validate(request.NewPassword);

            var user = await _userService.GetByIdOrThrowAsync(context.UserId);

            // Kiểm tra mật khẩu hiện tại trước khi đổi.
            if (!_passwordService.Verify(request.CurrentPassword, user.PasswordHash))
            {
                throw new BusinessException(ErrorCode.CurrentPasswordIncorrect);
            }

            // Hash mật khẩu mới trước khi lưu.
            var hashedPassword = _passwordService.Hash(request.NewPassword);

            await _userService.UpdatePasswordAsync(context.UserId, hashedPassword);
        }

        private async Task<(string AccessToken, string RefreshToken)> IssueTokenPairAsync(User user)
        {
            var tokenPayload = TokenPayload.Create(user.Id, user.Username, user.Email, user.Role);

            var accessToken = _tokenService.GenerateAccessToken(tokenPayload);
            var refreshToken = _tokenService.GenerateRefreshToken();
            var refreshTokenHash = _tokenService.HashToken(refreshToken);

            await _refreshTokenService.SaveRefreshTokenAsync(user.Id, refreshTokenHash, RefreshTokenLifetime);

            return (accessToken, refreshToken);
        }
    }
}
