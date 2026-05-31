using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Net.Http.Headers;

namespace GameTopUp.Tests.IntegrationTests.Infrastructure
{
    /// <summary>
    /// Extension helpers cho HttpRequestMessage để cấu hình request trơn tru qua Fluent API.
    /// </summary>
    public static class HttpRequestExtensions
    {
        /// <summary>
        /// Gắn auth giả lập qua header để bypass JWT trong test.
        /// </summary>
        public static HttpRequestMessage WithTestAuth(
            this HttpRequestMessage request,
            long userId,
            string role,
            string username = "TestUser")
        {
            request.Headers.Add("X-Test-UserId", userId.ToString());
            request.Headers.Add("X-Test-Role", role);
            request.Headers.Add("X-Test-Username", username);
            return request;
        }

        /// <summary>
        /// Gắn JSON body cho request.
        /// </summary>
        public static HttpRequestMessage WithJson(
            this HttpRequestMessage request,
            object body)
        {
            request.Content = JsonContent.Create(body);
            return request;
        }

        /// <summary>
        /// Gắn Cookie vào HttpRequestMessage.
        /// </summary>
        public static HttpRequestMessage WithCookie(
            this HttpRequestMessage request,
            string cookieName,
            string cookieValue)
        {
            request.Headers.Add("Cookie", $"{cookieName}={cookieValue}");
            return request;
        }
    }

    /// <summary>
    /// Extension helpers cho HttpResponseMessage để đọc và phân tích API response.
    /// </summary>
    public static class HttpResponseExtensions
    {
        /// <summary>
        /// Parse toàn bộ response wrapper (check success/message/data).
        /// </summary>
        public static Task<ApiResponseTestWrapper<T>?> ReadAsApiResult<T>(
            this HttpResponseMessage response)
            => response.Content.ReadFromJsonAsync<ApiResponseTestWrapper<T>>();

        /// <summary>
        /// Lấy trực tiếp Data trong response wrapper.
        /// </summary>
        public static async Task<T?> ReadDataAsync<T>(this HttpResponseMessage response)
        {
            var wrapper = await response.ReadAsApiResult<T>();
            return wrapper != null ? wrapper.Data : default;
        }

        /// <summary>
        /// Trích xuất giá trị Cookie từ Set-Cookie header bằng bộ phân tích cú pháp tiêu chuẩn của ASP.NET Core.
        /// </summary>
        public static string GetCookie(this HttpResponseMessage response, string cookieName)
        {
            if (!response.Headers.TryGetValues("Set-Cookie", out var values))
                return string.Empty;

            foreach (var value in values)
            {
                if (SetCookieHeaderValue.TryParse(value, out var cookie))
                {
                    if (cookie.Name.Equals(cookieName, StringComparison.OrdinalIgnoreCase))
                    {
                        return cookie.Value.ToString();
                    }
                }
            }

            return string.Empty;
        }
    }
}