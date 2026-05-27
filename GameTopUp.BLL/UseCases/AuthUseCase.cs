using GameTopUp.BLL.Common;
using GameTopUp.BLL.DTOs.Auths;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.Services.Auth;
using GameTopUp.DAL.Database;
using Mapster;

namespace GameTopUp.BLL.UseCases
{
    public class AuthUseCase
    {
        private readonly UserService _user;
        private readonly TokenService _token;
        private readonly PasswordService _password;
        private readonly WalletService _wallet;
        private readonly RefreshTokenService _refreshTokenService;
        private readonly DatabaseContext _database;

        private const int refreshTokeneExpireDays = 7;

        public AuthUseCase(
            UserService user,
            TokenService token,
            PasswordService password,
            WalletService wallet,
            RefreshTokenService refreshTokenService,
            DatabaseContext database)
        {
            _user = user;
            _token = token;
            _password = password;
            _wallet = wallet;
            _refreshTokenService = refreshTokenService;
            _database = database;
        }

        public async Task RegisterAsync(CreateUserRequest request)
        {
            _password.Validate(request.Password);

            var hashedPassword = _password.Hash(request.Password);

            await _database.ExecuteInTransactionAsync(async () =>
            {
                // Tạo user trước.
                var userId = await _user.RegisterWithHashedPasswordAsync(request, hashedPassword);

                // Tạo ví trong cùng transaction để đảm bảo đồng bộ dữ liệu.
                await _wallet.CreateWalletAsync(userId);
            });
        }

        public async Task<AuthResponseDTO> LoginAsync(LoginRequest request)
        {
            var user = await _user.GetByEmailAsync(request.Email);

            // Không tiết lộ email hay password sai để tránh dò tài khoản.
            if (user == null || !_password.Verify(request.Password, user.PasswordHash))
            {
                throw new BusinessException("Email hoặc mật khẩu không chính xác.");
            }

            var accessToken = _token.GenerateAccessToken(new TokenPayload
            {
                UserId = user.Id,
                Name = user.Username,
                Email = user.Email,
                Role = user.Role.ToString()
            });

            // Tạo refresh token ngẫu nhiên.
            var refreshToken = _token.GenerateRefreshToken();

            // Chỉ lưu hash để tăng bảo mật.
            var hash = _token.HashToken(refreshToken);

            // Lưu refresh token xuống DB.
            await _refreshTokenService.SaveRefreshTokenAsync(user.Id, hash, refreshTokeneExpireDays);

            return new AuthResponseDTO
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = user.Adapt<UserResponseDTO>()
            };
        }

        public async Task<AuthResponseDTO> RefreshAsync(string refreshTokenString)
        {
            // Hash token trước khi validate trong DB.
            var hash = _token.HashToken(refreshTokenString);

            var refreshToken =
                await _refreshTokenService.ValidateAndGetAsync(hash)
                ?? throw new BusinessException("Refresh Token không hợp lệ.");

            // Lấy lại thông tin user từ UserId trong refresh token.
            var user = await _user.GetByIdAsync(refreshToken.UserId);

            var tokenPayload = new TokenPayload
            {
                UserId = user.Id,
                Name = user.Username,
                Email = user.Email,
                Role = user.Role.ToString()
            };

            return await _database.ExecuteInTransactionAsync(async () =>
            {
                // Revoke token cũ để tránh reuse token.
                await _refreshTokenService.RevokeTokenAsync(hash);

                var accessToken = _token.GenerateAccessToken(tokenPayload);

                // Tạo refresh token mới.
                var newRefreshToken = _token.GenerateRefreshToken();

                var newHash = _token.HashToken(newRefreshToken);

                await _refreshTokenService.SaveRefreshTokenAsync(user.Id, newHash, 7);

                return new AuthResponseDTO
                {
                    AccessToken = accessToken,
                    RefreshToken = newRefreshToken
                };
            });
        }

        public async Task LogoutAsync(string refreshToken)
        {
            // Hash token trước khi revoke.
            var hash = _token.HashToken(refreshToken);

            await _refreshTokenService.RevokeTokenAsync(hash);
        }

        public async Task ChangePasswordAsync(UserContext context, PasswordChangeRequest request)
        {
            // Không cho phép dùng lại mật khẩu cũ.
            if (request.CurrentPassword == request.NewPassword)
            {
                throw new BusinessException("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
            }

            _password.Validate(request.NewPassword);

            var user = await _user.GetProfileAsync(context.UserId);

            // Kiểm tra mật khẩu hiện tại trước khi đổi.
            if (!_password.Verify(request.CurrentPassword, user.PasswordHash))
            {
                throw new BusinessException("Mật khẩu hiện tại không chính xác.");
            }

            var hashedPassword =
                _password.Hash(request.NewPassword);

            await _user.ChangePasswordAsync(context.UserId, hashedPassword);
        }
    }
}
