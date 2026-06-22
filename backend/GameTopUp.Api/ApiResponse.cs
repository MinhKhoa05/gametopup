using GameTopUp.BLL.Exceptions;

namespace GameTopUp.Api;

public class ApiResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? ErrorCode { get; set; }

    public static ApiResponse Ok() => new()
    {
        Success = true
    };

    public static ApiResponse<T> Ok<T>(T? data) => new()
    {
        Success = true,
        Data = data
    };

    public static ApiResponse Fail(ErrorCode errorCode, string? message = null) => new()
    {
        Success = false,
        Message = message ?? errorCode.GetMessage(),
        ErrorCode = errorCode.ToString()
    };

    public static ApiResponse<T> Fail<T>(ErrorCode errorCode, string? message = null, T? data = default) => new()
    {
        Success = false,
        Message = message ?? errorCode.GetMessage(),
        ErrorCode = errorCode.ToString(),
        Data = data
    };
}

public sealed class ApiResponse<T> : ApiResponse
{
    public T? Data { get; set; }
}
