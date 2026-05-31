using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace GameTopUp.Tests.IntegrationTests.Infrastructure
{
    // Bypass JWT: Inject danh tính (User/Admin) tùy biến qua Request Headers.
    public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger, UrlEncoder encoder)
            : base(options, logger, encoder)
        {
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            // Dynamic Identity: Cho phép test case đóng vai nhiều user để kiểm tra Permission.
            var userId = Context.Request.Headers["X-Test-UserId"].FirstOrDefault();
            if (string.IsNullOrEmpty(userId))
            {
                // Không có header => Xem như ẩn danh (Anonymous)
                return Task.FromResult(AuthenticateResult.NoResult());
            }

            var role = Context.Request.Headers["X-Test-Role"].FirstOrDefault() ?? "Member";
            var username = Context.Request.Headers["X-Test-Username"].FirstOrDefault() ?? "TestUser";

            var claims = new[] { 
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, role),
                new Claim(ClaimTypes.NameIdentifier, userId)
            };

            var identity = new ClaimsIdentity(claims, "Test");
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, "Test");

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
}
