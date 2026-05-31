using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GameTopUp.BLL.DTOs.Auths;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.BLL.UseCases;
using GameTopUp.BLL.Exceptions;
using GameTopUp.API.Extensions;

namespace GameTopUp.API.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ApiControllerBase
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
        public async Task<IActionResult> Register(CreateUserRequest registerRequest)
        {
            await _auth.RegisterAsync(registerRequest);
            return ApiCreated(null, "Đăng ký tài khoản thành công.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest loginRequest)
        {
            var loginResponse = await _auth.LoginAsync(loginRequest);

            SetAuthCookies(loginResponse);

            return ApiOk(loginResponse, "Đăng nhập thành công.");
        }

        [Authorize]
        [HttpPut("password")]
        public async Task<IActionResult> ChangePassword(PasswordChangeRequest passwordChangeRequest)
        {
            await _auth.ChangePasswordAsync(CurrentUser, passwordChangeRequest);
            return ApiOk(null, "Đổi mật khẩu thành công.");
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.GetRefreshToken();
            if (string.IsNullOrEmpty(refreshToken))
            {
                throw new BusinessException(ErrorCodes.InvalidRefreshToken, ErrorCodes.InvalidOrExpiredRefreshToken);
            }

            var result = await _auth.RefreshAsync(refreshToken);

            SetAuthCookies(result);

            return ApiOk(result, "Làm mới token thành công.");
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var refreshToken = Request.GetRefreshToken();
            if (!string.IsNullOrEmpty(refreshToken))
            {
                await _auth.LogoutAsync(refreshToken);
            }

            DeleteAuthCookies();

            return ApiOk(null, "Đăng xuất thành công.");
        }

        private void SetAuthCookies(AuthResponseDTO authResponse)
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
}
