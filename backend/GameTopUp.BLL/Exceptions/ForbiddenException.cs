
namespace GameTopUp.BLL.Exceptions
{
    /// <summary>
    /// Ngoại lệ ném ra khi người dùng không có quyền thực hiện hành động (403 Forbidden).
    /// </summary>
    public class ForbiddenException : BusinessException
    {
        public ForbiddenException(string errorCode = ErrorCodes.Forbidden, string? message = null)
            : base(errorCode, message)
        {
        }
    }
}
