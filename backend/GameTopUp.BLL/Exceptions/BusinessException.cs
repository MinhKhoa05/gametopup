namespace GameTopUp.BLL.Exceptions
{
    /// <summary>
    /// Đại diện cho các lỗi nghiệp vụ (Validation, Logic sai...) để phân biệt với lỗi sập hệ thống (500).
    /// Được Middleware bắt lại và trả về mã lỗi thích hợp (400, 403, 404...) kèm ErrorCode cho Client.
    /// </summary>
    public class BusinessException : Exception
    {
        public ErrorCode ErrorCode { get; }

        // Lấy message mặc định từ ErrorCode nếu không truyền message cụ thể.
        public BusinessException(ErrorCode errorCode = ErrorCode.BadRequest, string? message = null)
            : base(message ?? errorCode.GetMessage())
        {
            ErrorCode = errorCode;
        }
    }
}