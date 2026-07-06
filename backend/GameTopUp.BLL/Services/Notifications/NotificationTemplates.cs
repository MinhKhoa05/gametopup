using GameTopUp.BLL.Contracts;
using GameTopUp.DAL.Entities;

namespace GameTopUp.BLL.Services.Notifications;

public static class NotificationTemplates
{
    public static CreateNotificationRequest OrderPlaced(long userId, long orderId) => new()
    {
        UserId = userId,
        Type = NotificationType.OrderPlaced,
        Title = "Đặt hàng thành công",
        Message = $"Đơn hàng #{orderId} đã được tạo. Tụi mình sẽ xử lý sớm nhất có thể."
    };

    public static CreateNotificationRequest OrderProcessing(long userId, long orderId) => new()
    {
        UserId = userId,
        Type = NotificationType.OrderProcessing,
        Title = "Đơn hàng đang được xử lý",
        Message = $"Admin đang xử lý đơn hàng #{orderId} của bạn."
    };

    public static CreateNotificationRequest OrderCompleted(long userId, long orderId) => new()
    {
        UserId = userId,
        Type = NotificationType.OrderCompleted,
        Title = "Đơn hàng đã hoàn tất",
        Message = $"Đơn hàng #{orderId} đã hoàn tất. Cảm ơn bạn đã sử dụng GameTopUp."
    };

    public static CreateNotificationRequest OrderCancelled(long userId, long orderId) => new()
    {
        UserId = userId,
        Type = NotificationType.OrderCancelled,
        Title = "Đơn hàng đã bị hủy",
        Message = $"Đơn hàng #{orderId} đã bị hủy. Số tiền đã được hoàn lại vào ví của bạn."
    };

    public static CreateNotificationRequest DepositSubmitted(long userId, string depositCode) => new()
    {
        UserId = userId,
        Type = NotificationType.DepositSubmitted,
        Title = "Đã gửi yêu cầu nạp tiền",
        Message = $"Yêu cầu nạp tiền {depositCode} đã được gửi. Admin sẽ kiểm tra trong thời gian sớm nhất."
    };

    public static CreateNotificationRequest DepositApproved(long userId, string depositCode) => new()
    {
        UserId = userId,
        Type = NotificationType.DepositApproved,
        Title = "Nạp tiền thành công",
        Message = $"Yêu cầu nạp tiền {depositCode} đã được duyệt. Số dư ví của bạn đã được cập nhật."
    };

    public static CreateNotificationRequest DepositRejected(long userId, string depositCode) => new()
    {
        UserId = userId,
        Type = NotificationType.DepositRejected,
        Title = "Nạp tiền bị từ chối",
        Message = $"Yêu cầu nạp tiền {depositCode} chưa được duyệt. Vui lòng kiểm tra lại thông tin chuyển khoản."
    };
}
