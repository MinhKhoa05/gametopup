using GameTopUp.BLL.Context;
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

        private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(7);

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
                throw new BusinessException(ErrorCodes.InvalidCredentials);
            }

            var payload = TokenPayload.Create(user.Id, user.Username, user.Email, user.Role.ToString());
            var tokens = await IssueTokenPairAsync(payload, user.Id);

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
            var hash = _token.HashToken(refreshTokenString);

            var refreshToken =
                await _refreshTokenService.ValidateAndGetAsync(hash)
                ?? throw new BusinessException(ErrorCodes.InvalidRefreshToken);

            // Lấy lại thông tin user từ UserId trong refresh token.
            var user = await _user.GetByIdAsync(refreshToken.UserId);

            var tokenPayload = TokenPayload.Create(user.Id, user.Username, user.Email, user.Role);

            return await _database.ExecuteInTransactionAsync(async () =>
            {
                // Revoke token cũ để tránh reuse token.
                await _refreshTokenService.RevokeTokenAsync(hash);

                var tokens = await IssueTokenPairAsync(tokenPayload, user.Id);
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
            // Hash token trước khi revoke.
            var hash = _token.HashToken(refreshToken);

            await _refreshTokenService.RevokeTokenAsync(hash);
        }

        public async Task ChangePasswordAsync(UserContext context, PasswordChangeRequest request)
        {
            // Không cho phép dùng lại mật khẩu cũ.
            if (request.CurrentPassword == request.NewPassword)
            {
                throw new BusinessException(ErrorCodes.NewPasswordSameAsCurrent);
            }

            _password.Validate(request.NewPassword);

            var user = await _user.GetProfileAsync(context.UserId);

            // Kiểm tra mật khẩu hiện tại trước khi đổi.
            if (!_password.Verify(request.CurrentPassword, user.PasswordHash))
            {
                throw new BusinessException(ErrorCodes.CurrentPasswordIncorrect);
            }

            var hashedPassword =
                _password.Hash(request.NewPassword);

            await _user.ChangePasswordAsync(context.UserId, hashedPassword);
        }

        private async Task<(string AccessToken, string RefreshToken)> IssueTokenPairAsync(TokenPayload payload, long userId)
        {
            var accessToken = _token.GenerateAccessToken(payload);
            var refreshToken = _token.GenerateRefreshToken();
            var refreshTokenHash = _token.HashToken(refreshToken);

            await _refreshTokenService.SaveRefreshTokenAsync(userId, refreshTokenHash, RefreshTokenLifetime);

            return (accessToken, refreshToken);
        }

    }
}
