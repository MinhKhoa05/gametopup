namespace GameTopUp.BLL.Exceptions;

public sealed class NotFoundException : BusinessException
{
    public NotFoundException(ErrorCode errorCode = ErrorCode.NotFound, string? message = null)
        : base(errorCode, message)
    {
    }
}
