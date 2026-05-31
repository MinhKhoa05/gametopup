namespace GameTopUp.BLL.Exceptions
{
    public class NotFoundException : BusinessException
    {
        public NotFoundException(string errorCode = ErrorCodes.NotFound, string? message = null)
            : base(errorCode, message)
        {
        }
    }
}
