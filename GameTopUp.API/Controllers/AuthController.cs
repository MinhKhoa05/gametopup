using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GameTopUp.BLL.DTOs.Auths;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.BLL.ApplicationServices;

namespace GameTopUp.API.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ApiControllerBase
    {
        private readonly AuthService _auth;
        
        public AuthController(AuthService auth)
        {
            _auth = auth;
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

            if (!Response.HasStarted)
            {
                // Cấu hình Cookie cho Refresh Token
                if (!string.IsNullOrEmpty(loginResponse.RefreshToken))
                {
                    var refreshTokenOptions = new CookieOptions
                    {
                        HttpOnly = true, // Quan trọng: Chống tấn công XSS (Javascript không đọc được)
                        Secure = false,  // Sửa thành true khi chạy HTTPS
                        SameSite = SameSiteMode.Lax, // Chống CSRF ở mức độ cơ bản
                        Expires = DateTime.UtcNow.AddDays(7) // Thường là 7 ngày hoặc theo cấu hình hệ thống
                    };
                    Response.Cookies.Append("refreshToken", loginResponse.RefreshToken, refreshTokenOptions);
                }
            }

            return ApiOk(loginResponse, "Đăng nhập thành công.");
        }

        [Authorize]
        [HttpPut("password")]
        public async Task<IActionResult> ChangePassword(PasswordChangeRequest passwordChangeRequest)
        {
            await _auth.ChangePasswordAsync(CurrentUser, passwordChangeRequest);
            return ApiOk(null, "Đổi mật khẩu thành công");
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(RefreshTokenRequestDTO request)
        {
            var result = await _auth.RefreshAsync(request);
            return ApiOk(result, "Làm mới token thành công.");
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout(RefreshTokenRequestDTO request)
        {
            // Note: Chúng ta truyền refresh token lên để revoke nó trong DB
            await _auth.LogoutAsync(request.RefreshToken);
            return ApiOk(null, "Đăng xuất thành công.");
        }
    }
}
