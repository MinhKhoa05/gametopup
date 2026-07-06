using GameTopUp.BLL.Context;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers;
using GameTopUp.BLL.Utilities;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;

namespace GameTopUp.BLL.Services.Notifications;

public sealed class NotificationService
{
    private readonly INotificationRepository _repository;

    public NotificationService(INotificationRepository repository)
    {
        _repository = repository;
    }

    public async Task<long> CreateNotificationAsync(CreateNotificationRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (!Enum.IsDefined(typeof(NotificationType), request.Type))
        {
            throw new BusinessException(ErrorCode.BadRequest);
        }

        var now = DateTimeOffset.UtcNow;
        var notification = new Notification
        {
            UserId = request.UserId,
            Type = request.Type,
            Title = InputTextNormalizer.Required(request.Title),
            Message = InputTextNormalizer.Required(request.Message),
            IsRead = false,
            ReadAt = null,
            CreatedAt = now
        };

        return await _repository.CreateAsync(notification);
    }

    public async Task<CursorPageResponse<NotificationResponse>> GetByUserAsync(
        UserContext context,
        long? cursor,
        int? limit)
    {
        return await CursorPageMappings.ToCursorPageAsync(
            limit,
            take => _repository.GetByUserIdAsync(context.UserId, cursor, take),
            notification => notification.MapTo<NotificationResponse>(),
            notification => notification.Id);
    }

    public async Task<UnreadNotificationCountResponse> GetUnreadCountAsync(UserContext context)
    {
        var unreadCount = await _repository.CountUnreadByUserIdAsync(context.UserId);

        return new UnreadNotificationCountResponse
        {
            UnreadCount = unreadCount
        };
    }

    public async Task MarkAsReadAsync(UserContext context, long notificationId)
    {
        var notification = await _repository.GetByIdForUserAsync(notificationId, context.UserId)
            ?? throw new NotFoundException(ErrorCode.NotFound);

        if (notification.IsRead)
        {
            return;
        }

        notification.IsRead = true;
        notification.ReadAt = DateTimeOffset.UtcNow;

        await _repository.UpdateAsync(notification);
    }
}
