using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Auths;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers.Users;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.Services.Auth;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Users;

namespace GameTopUp.BLL.UseCases;

public sealed class AuthUseCase
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
        request.Password = _passwordService.Hash(request.Password);

        await _database.ExecuteInTransactionAsync(async () =>
        {
            var userId = await _userService.CreateUserAsync(request);
            await _walletService.CreateWalletAsync(userId);
        });
    }

    public async Task<AuthResponseDTO> LoginAsync(LoginRequest request)
    {
        var user = await _userService.GetByEmailAsync(request.Email);
        if (user is null || !_passwordService.Verify(request.Password, user.PasswordHash))
        {
            throw new BusinessException(ErrorCode.InvalidCredentials);
        }

        var tokens = await IssueTokenPairAsync(MapToContext(user));
        return new AuthResponseDTO
        {
            AccessToken = tokens.AccessToken,
            RefreshToken = tokens.RefreshToken,
            User = UserMapper.ToResponse(user)
        };
    }

    public async Task<AuthResponseDTO> RefreshAsync(string refreshTokenString)
    {
        var hash = _tokenService.HashToken(refreshTokenString);

        return await _database.ExecuteInTransactionAsync(async () =>
        {
            var refreshToken = await _refreshTokenService.RevokeTokenAsync(hash);
            if (refreshToken is null)
            {
                throw new BusinessException(ErrorCode.InvalidRefreshToken);
            }

            var user = await _userService.GetByIdOrThrowAsync(refreshToken.UserId);
            var tokens = await IssueTokenPairAsync(MapToContext(user));

            return new AuthResponseDTO
            {
                AccessToken = tokens.AccessToken,
                RefreshToken = tokens.RefreshToken
            };
        });
    }

    public async Task LogoutAsync(string refreshToken)
    {
        try
        {
            var hash = _tokenService.HashToken(refreshToken);
            await _refreshTokenService.RevokeTokenAsync(hash);
        }
        catch
        {
            // Logout should stay best-effort.
        }
    }

    public async Task ChangePasswordAsync(UserContext context, PasswordChangeRequest request)
    {
        if (request.CurrentPassword == request.NewPassword)
        {
            throw new BusinessException(ErrorCode.NewPasswordSameAsCurrent);
        }

        _passwordService.Validate(request.NewPassword);

        var user = await _userService.GetByIdOrThrowAsync(context.UserId);
        if (!_passwordService.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new BusinessException(ErrorCode.CurrentPasswordIncorrect);
        }

        await _userService.UpdatePasswordAsync(context.UserId, _passwordService.Hash(request.NewPassword));
    }

    private async Task<(string AccessToken, string RefreshToken)> IssueTokenPairAsync(UserContext user)
    {
        var tokenPayload = TokenPayload.Create(user);
        var accessToken = _tokenService.GenerateAccessToken(tokenPayload);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenHash = _tokenService.HashToken(refreshToken);

        await _refreshTokenService.SaveRefreshTokenAsync(user.UserId, refreshTokenHash, RefreshTokenLifetime);

        return (accessToken, refreshToken);
    }

    private static UserContext MapToContext(User user)
    {
        return new UserContext
        {
            UserId = user.Id,
            DisplayName = user.DisplayName,
            Email = user.Email,
            Role = user.Role
        };
    }
}
