using System.Security.Claims;
using System.Text.Encodings.Web;
using GameTopUp.DAL.Entities.Users;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace GameTopUp.Tests.IntegrationTests.Infrastructure;

public sealed class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "IntegrationTest";

    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var userIdValue = Context.Request.Headers["X-Test-UserId"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(userIdValue))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userIdValue),
            new(ClaimTypes.Name, Context.Request.Headers["X-Test-DisplayName"].FirstOrDefault() ?? "Test User"),
            new(ClaimTypes.Email, Context.Request.Headers["X-Test-Email"].FirstOrDefault() ?? "test@example.local"),
            new(ClaimTypes.Role, Context.Request.Headers["X-Test-Role"].FirstOrDefault() ?? UserRole.Member.ToString())
        };

        var identity = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, SchemeName);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
