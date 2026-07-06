using GameTopUp.DAL.Entities;

namespace GameTopUp.BLL.Contracts;

public sealed class CreateNotificationRequest
{
    public long UserId { get; init; }

    public NotificationType Type { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Message { get; init; } = string.Empty;
}
