using GameTopUp.Api.Extensions;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers;

[Route("api/auth")]
public sealed class AuthController : ApiControllerBase
{
    private readonly AuthUseCase _auth;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public AuthController(AuthUseCase auth, IConfiguration configuration, IWebHostEnvironment environment)
    {
        _auth = auth;
        _configuration = configuration;
        _environment = environment;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(CreateUserRequest request)
    {
        await _auth.RegisterAsync(request);
        return ApiCreated();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var response = await _auth.LoginAsync(request);
        SetAuthCookies(response);
        return ApiOk(response);
    }

    [Authorize]
    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        await _auth.ChangePasswordAsync(CurrentUser, request);
        return ApiOk();
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var refreshToken = Request.GetRefreshToken();
        var response = await _auth.RefreshAsync(refreshToken);
        SetAuthCookies(response);
        return ApiOk(response);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.GetRefreshToken();
        await _auth.LogoutAsync(refreshToken);
        DeleteAuthCookies();
        return ApiOk();
    }

    private void SetAuthCookies(AuthResponse authResponse)
    {
        var secure = ShouldUseSecureCookies();
        Response.SetAccessToken(authResponse.AccessToken, GetAccessTokenExpireMinutes(), secure);
        Response.SetRefreshToken(authResponse.RefreshToken, secure);
    }

    private void DeleteAuthCookies()
    {
        var secure = ShouldUseSecureCookies();
        Response.DeleteAccessToken(secure);
        Response.DeleteRefreshToken(secure);
    }

    private int GetAccessTokenExpireMinutes()
    {
        return int.TryParse(_configuration["Jwt:ExpireMinutes"], out var minutes) ? minutes : 30;
    }

    private bool ShouldUseSecureCookies()
    {
        return Request.IsHttps || !_environment.IsDevelopment();
    }
}
