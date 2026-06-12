using GameTopUp.BLL.Exceptions;

namespace GameTopUp.Api;

public sealed class ApiResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? ErrorCode { get; set; }
    public object? Data { get; set; }

    private ApiResponse()
    {
    }

    public static ApiResponse Ok(object? data = null, string? message = null)
    {
        return new ApiResponse
        {
            Success = true,
            Data = data,
            Message = message
        };
    }

    public static ApiResponse Fail(ErrorCode errorCode, string? message = null, object? data = null)
    {
        return new ApiResponse
        {
            Success = false,
            Message = message ?? errorCode.GetMessage(),
            ErrorCode = errorCode.ToString(),
            Data = data
        };
    }
}
