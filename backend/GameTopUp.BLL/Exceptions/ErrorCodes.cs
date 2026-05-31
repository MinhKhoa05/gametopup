namespace GameTopUp.BLL.Exceptions
{
    public static class ErrorCodes
    {
        public const string InternalServerError = "Hệ thống đang bận một chút hoặc có sự cố nhỏ. Bạn vui lòng thử lại sau vài giây nhé!";
        public const string BadRequest = "Yêu cầu không hợp lệ.";
        public const string NotFound = "Không tìm thấy dữ liệu.";
        public const string Unauthorized = "Phiên làm việc đã hết hạn hoặc không hợp lệ.";
        public const string Forbidden = "Bạn không có quyền thực hiện hành động này.";

        public const string EmailExists = "Email này đã được sử dụng trong hệ thống.";
        public const string InvalidCredentials = "Email hoặc mật khẩu không chính xác.";
        public const string InvalidRefreshToken = "Refresh Token không hợp lệ.";
        public const string InvalidOrExpiredRefreshToken = "Refresh Token không hợp lệ hoặc đã hết hạn.";
        public const string WeakPassword = "Mật khẩu không đủ mạnh. Yêu cầu: ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";
        public const string NewPasswordSameAsCurrent = "Mật khẩu mới không được trùng với mật khẩu hiện tại.";
        public const string CurrentPasswordIncorrect = "Mật khẩu hiện tại không chính xác.";

        public const string UserNotFound = "Người dùng không tồn tại.";
        public const string GameNotFound = "Game không tồn tại.";
        public const string GamePackageNotFound = "Gói nạp không tồn tại.";
        public const string WalletNotFound = "Không tìm thấy ví người dùng.";
        public const string OrderNotFound = "Không tìm thấy đơn hàng.";
        public const string DepositRequestNotFound = "Không tìm thấy yêu cầu nạp tiền.";

        public const string AmountMustBePositive = "Số tiền phải lớn hơn 0.";
        public const string InsufficientWalletBalance = "Số dư ví không đủ.";
        public const string DepositAmountMustBeInteger = "Số tiền nạp VietQR phải là số nguyên VNĐ.";
        public const string VietQrSettingsMissing = "Chưa cấu hình thông tin tài khoản VietQR.";
        public const string DepositRequestForbidden = "Bạn không có quyền cập nhật yêu cầu nạp tiền này.";
        public const string DepositConfirmOnlyPending = "Chỉ có thể xác nhận chuyển khoản cho yêu cầu đang chờ.";
        public const string DepositApproveOnlyUserConfirmed = "Chỉ có thể duyệt yêu cầu đã được user xác nhận chuyển khoản.";
        public const string ApprovedDepositCannotBeRejected = "Yêu cầu đã duyệt không thể từ chối.";

        public const string PendingOrderExists = "Bạn đang có một đơn hàng chờ thanh toán. Vui lòng hoàn tất hoặc hủy đơn hàng đó trước khi tạo đơn mới.";
        public const string OrderAlreadyAssigned = "Đơn hàng đã được admin khác tiếp nhận.";
        public const string OrderMustBePaidToPick = "Chỉ có thể tiếp nhận đơn hàng đã thanh toán.";
        public const string OrderStatusInvalidToComplete = "Trạng thái đơn hàng không hợp lệ để hoàn thành.";
        public const string CannotModifyOthersOrder = "Bạn không thể can thiệp vào đơn hàng của người khác.";
        public const string CompletedOrderCannotBeCancelled = "Đơn hàng đã hoàn thành không thể hủy.";
        public const string ProcessingOrderCannotBeCancelled = "Đơn hàng đang được xử lý, không thể hủy.";
        public const string PaymentForbidden = "Bạn không có quyền thanh toán đơn hàng này.";
        public const string OrderNotPendingPayment = "Đơn hàng không ở trạng thái chờ thanh toán.";

        public const string StockQuantityMustBePositive = "Số lượng phải lớn hơn 0.";
        public const string InsufficientStock = "Số lượng trong kho không đủ.";
        public const string GamePackageInactive = "Gói nạp hiện không khả dụng.";
        public const string InactiveGameCannotAddPackage = "Không thể thêm gói nạp vào Game đang ở trạng thái ngừng hoạt động.";

        public const string InvalidImageFile = "File ảnh không hợp lệ.";
        public const string ImageTooLarge = "Ảnh tải lên không được vượt quá 5MB.";
        public const string UnsupportedImageType = "Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.";
        public const string InvalidImageFileName = "Tên file ảnh không hợp lệ.";
        public const string ImageRequired = "Vui lòng chọn file ảnh.";
        public const string CloudinarySettingsMissing = "Chưa cấu hình Cloudinary.";
        public const string CloudinaryUploadFailed = "Upload Cloudinary thất bại.";
        public const string RevokeTokenFailed = "Revoke thất bại";
    }
}
