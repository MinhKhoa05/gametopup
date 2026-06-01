using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using GameTopUp.BLL.Exceptions;

namespace GameTopUp.API.Middlewares
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                // Nếu Response đã bắt đầu gửi (Headers đã gửi), không được phép ghi đè StatusCode hay Content nữa.
                if (context.Response.HasStarted)
                {
                    _logger.LogWarning("Response đã bắt đầu gửi về client, không thể can thiệp thêm vào Middleware.");
                    return;
                }

                _logger.LogError(ex, ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            context.Response.ContentType = "application/json";

            // Phân loại mã lỗi HTTP dựa trên kiểu Exception ném ra từ tầng nghiệp vụ.
            var statusCode = ex switch
            {
                NotFoundException => HttpStatusCode.NotFound,
                UnauthorizedAccessException => HttpStatusCode.Unauthorized,
                ForbiddenException => HttpStatusCode.Forbidden,
                BusinessException => HttpStatusCode.BadRequest,
                _ => HttpStatusCode.InternalServerError // Mặc định là lỗi 500
            };

            context.Response.StatusCode = (int)statusCode;

            // Thiết lập mặc định ban đầu cho lỗi hệ thống
            var errorCode = ErrorCode.InternalServerError;
            string? message = null;

            // Nếu không phải lỗi hệ thống (500), lấy thông tin mã lỗi ra.
            if (statusCode != HttpStatusCode.InternalServerError)
            {
                message = ex.Message;
                if (ex is BusinessException businessException)
                {
                    errorCode = businessException.ErrorCode;
                }
                else
                {
                    // Trường hợp ex KHÔNG PHẢI BusinessException (ví dụ lỗi Validation mặc định của .NET)
                    errorCode = ErrorCode.BadRequest;
                }
            }

            var response = ApiResponse.Fail(errorCode, message);

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };

            await context.Response.WriteAsJsonAsync(response, options);
        }
    }
}