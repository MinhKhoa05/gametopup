using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace GameTopUp.BLL.Exceptions
{
    public enum ErrorCode
    {
        [Display(Name = "Hệ thống đang bận một chút hoặc có sự cố nhỏ. Bạn vui lòng thử lại sau vài giây nhé!")]
        InternalServerError,

        [Display(Name = "Yêu cầu không hợp lệ.")]
        BadRequest,
        
        [Display(Name = "Không tìm thấy dữ liệu.")]
        NotFound,
        
        [Display(Name = "Phiên làm việc đã hết hạn hoặc không hợp lệ.")]
        Unauthorized,
        
        [Display(Name = "Bạn không có quyền thực hiện hành động này.")]
        Forbidden,



        [Display(Name = "Email này đã được sử dụng trong hệ thống.")]
        EmailExists,

        [Display(Name = "Email hoặc mật khẩu không chính xác.")]
        InvalidCredentials,

        [Display(Name = "Refresh Token không hợp lệ hoặc đã hết hạn.")]
        InvalidRefreshToken,

        [Display(Name = "Mật khẩu không đủ mạnh. Yêu cầu: ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.")]
        WeakPassword,

        [Display(Name = "Mật khẩu mới không được trùng với mật khẩu hiện tại.")]
        NewPasswordSameAsCurrent,

        [Display(Name = "Mật khẩu hiện tại không chính xác.")]
        CurrentPasswordIncorrect,



        [Display(Name = "Người dùng không tồn tại.")]
        UserNotFound,

        [Display(Name = "Game không tồn tại.")]
        GameNotFound,

        [Display(Name = "Gói nạp không tồn tại.")]
        GamePackageNotFound,

        [Display(Name = "Không tìm thấy ví người dùng.")]
        WalletNotFound,

        [Display(Name = "Không tìm thấy đơn hàng.")]
        OrderNotFound,

        [Display(Name = "Không tìm thấy yêu cầu nạp tiền.")]
        DepositRequestNotFound,



        [Display(Name = "Số tiền phải lớn hơn 0.")]
        AmountMustBePositive,
        
        [Display(Name = "Số dư ví không đủ.")]
        InsufficientWalletBalance,

        [Display(Name = "Số tiền nạp VietQR phải là số nguyên VNĐ.")]
        DepositAmountMustBeInteger,

        [Display(Name = "Chưa cấu hình thông tin tài khoản VietQR.")]
        VietQrSettingsMissing,

        [Display(Name = "Bạn không có quyền cập nhật yêu cầu nạp tiền này.")]
        DepositRequestForbidden,

        [Display(Name = "Chỉ có thể xác nhận chuyển khoản cho yêu cầu đang chờ.")]
        DepositConfirmOnlyPending,

        [Display(Name = "Chỉ có thể duyệt yêu cầu đã được user xác nhận chuyển khoản.")]
        DepositApproveOnlyUserConfirmed,

        [Display(Name = "Yêu cầu đã duyệt không thể từ chối.")]
        ApprovedDepositCannotBeRejected,



        [Display(Name = "Bạn đang có một đơn hàng chờ thanh toán. Vui lòng hoàn tất hoặc hủy đơn hàng đó trước khi tạo đơn mới.")]
        PendingOrderExists,

        [Display(Name = "Đơn hàng đã được admin khác tiếp nhận.")]
        OrderAlreadyAssigned,

        [Display(Name = "Chỉ có thể tiếp nhận đơn hàng đã thanh toán.")]
        OrderMustBePaidToPick,

        [Display(Name = "Trạng thái đơn hàng không hợp lệ để hoàn thành.")]
        OrderStatusInvalidToComplete,

        [Display(Name = "Bạn không thể can thiệp vào đơn hàng của người khác.")]
        CannotModifyOthersOrder,

        [Display(Name = "Đơn hàng đã hoàn thành không thể hủy.")]
        CompletedOrderCannotBeCancelled,

        [Display(Name = "Đơn hàng đang được xử lý, không thể hủy.")]
        ProcessingOrderCannotBeCancelled,

        [Display(Name = "Bạn không có quyền thanh toán đơn hàng này.")]
        PaymentForbidden,

        [Display(Name = "Đơn hàng không ở trạng thái chờ thanh toán.")]
        OrderNotPendingPayment,



        [Display(Name = "Số lượng phải lớn hơn 0.")]
        StockQuantityMustBePositive,

        [Display(Name = "Số lượng trong kho không đủ.")]
        InsufficientStock,

        [Display(Name = "Gói nạp hiện không khả dụng.")]
        GamePackageInactive,

        [Display(Name = "Không thể thêm gói nạp vào Game đang ở trạng thái ngừng hoạt động.")]
        InactiveGameCannotAddPackage,



        [Display(Name = "File ảnh không hợp lệ.")]
        InvalidImageFile,

        [Display(Name = "Ảnh tải lên không được vượt quá 5MB.")]
        ImageTooLarge,

        [Display(Name = "Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.")]
        UnsupportedImageType,

        [Display(Name = "Tên file ảnh không hợp lệ.")]
        InvalidImageFileName,

        [Display(Name = "Vui lòng chọn file ảnh.")]
        ImageRequired,

    }

    public static class ErrorCodeExtensions
    {
        public static string GetMessage(this ErrorCode errorCode)
        {
            var attribute = errorCode.GetType()
                .GetMember(errorCode.ToString())
                .FirstOrDefault()?
                .GetCustomAttribute<DisplayAttribute>();

            return attribute?.Name ?? errorCode.ToString();
        }
    }
}
