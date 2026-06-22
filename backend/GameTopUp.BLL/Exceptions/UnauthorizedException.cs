namespace GameTopUp.BLL.Exceptions;

public sealed class UnauthorizedException : BusinessException
{
    public UnauthorizedException(ErrorCode errorCode = ErrorCode.Unauthorized, string? message = null)
        : base(errorCode, message)
    {
    }
}
