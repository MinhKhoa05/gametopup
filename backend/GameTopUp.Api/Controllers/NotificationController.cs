using GameTopUp.BLL.Services.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers;

[Authorize]
[Route("api/notifications")]
public sealed class NotificationController : ApiControllerBase
{
    private readonly NotificationService _notificationService;

    public NotificationController(NotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] long? cursor = null,
        [FromQuery] int? limit = null)
    {
        var notifications = await _notificationService.GetByUserAsync(CurrentUser, cursor, limit);
        return ApiOk(notifications);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var unreadCount = await _notificationService.GetUnreadCountAsync(CurrentUser);
        return ApiOk(unreadCount);
    }

    [HttpPatch("{notificationId:long}/read")]
    public async Task<IActionResult> MarkAsRead(long notificationId)
    {
        await _notificationService.MarkAsReadAsync(CurrentUser, notificationId);
        return ApiOk();
    }
}
