namespace GameTopUp.Api.Extensions;

public static class CookieExtensions
{
    private const string AccessTokenCookieName = "accessToken";
    private const string RefreshTokenCookieName = "refreshToken";
    private const string AuthCookiePath = "/api/auth";

    public static void SetAccessToken(this HttpResponse response, string accessToken, int expireMinutes, bool secure)
    {
        if (response.HasStarted || string.IsNullOrEmpty(accessToken))
        {
            return;
        }

        response.Cookies.Append(
            AccessTokenCookieName,
            accessToken,
            CreateAuthCookieOptions(secure, "/", DateTimeOffset.UtcNow.AddMinutes(expireMinutes)));
    }

    public static void SetRefreshToken(this HttpResponse response, string refreshToken, bool secure, int expireDays = 7)
    {
        if (response.HasStarted || string.IsNullOrEmpty(refreshToken))
        {
            return;
        }

        response.Cookies.Append(
            RefreshTokenCookieName,
            refreshToken,
            CreateAuthCookieOptions(secure, AuthCookiePath, DateTimeOffset.UtcNow.AddDays(expireDays)));
    }

    public static string? GetRefreshToken(this HttpRequest request)
    {
        return request.Cookies.TryGetValue(RefreshTokenCookieName, out var refreshToken) ? refreshToken : null;
    }

    public static void DeleteAccessToken(this HttpResponse response, bool secure)
    {
        if (response.HasStarted)
        {
            return;
        }

        response.Cookies.Delete(AccessTokenCookieName, CreateAuthCookieOptions(secure, "/"));
    }

    public static void DeleteRefreshToken(this HttpResponse response, bool secure)
    {
        if (response.HasStarted)
        {
            return;
        }

        response.Cookies.Delete(RefreshTokenCookieName, CreateAuthCookieOptions(secure, AuthCookiePath));
    }

    private static CookieOptions CreateAuthCookieOptions(bool secure, string path, DateTimeOffset? expires = null)
    {
        return new CookieOptions
        {
            HttpOnly = true,
            Secure = secure,
            SameSite = SameSiteMode.Lax,
            Expires = expires,
            Path = path
        };
    }
}
