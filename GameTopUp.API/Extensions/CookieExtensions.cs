using Microsoft.AspNetCore.Http;

namespace GameTopUp.API.Extensions
{
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

            response.Cookies.Append(AccessTokenCookieName, accessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = secure,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddMinutes(expireMinutes),
                Path = "/"
            });
        }

        public static void SetRefreshToken(this HttpResponse response, string refreshToken, bool secure, int expireDays = 7)
        {
            if (response.HasStarted || string.IsNullOrEmpty(refreshToken))
            {
                return;
            }

            response.Cookies.Append(RefreshTokenCookieName, refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = secure,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddDays(expireDays),
                Path = AuthCookiePath
            });
        }

        public static string? GetRefreshToken(this HttpRequest request)
        {
            return request.Cookies.TryGetValue(RefreshTokenCookieName, out var refreshToken)
                ? refreshToken
                : null;
        }

        public static void DeleteAccessToken(this HttpResponse response, bool secure)
        {
            if (response.HasStarted)
            {
                return;
            }

            response.Cookies.Delete(AccessTokenCookieName, new CookieOptions
            {
                HttpOnly = true,
                Secure = secure,
                SameSite = SameSiteMode.Lax,
                Path = "/"
            });
        }

        public static void DeleteRefreshToken(this HttpResponse response, bool secure)
        {
            if (response.HasStarted)
            {
                return;
            }

            response.Cookies.Delete(RefreshTokenCookieName, new CookieOptions
            {
                HttpOnly = true,
                Secure = secure,
                SameSite = SameSiteMode.Lax,
                Path = AuthCookiePath
            });
        }
    }
}
