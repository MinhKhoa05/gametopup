using GameTopUp.DAL.Entities;

namespace GameTopUp.DAL.Interfaces;

public interface INotificationRepository
{
    Task<long> CreateAsync(Notification notification);

    Task<Notification?> GetByIdForUserAsync(long id, long userId);

    Task<List<Notification>> GetByUserIdAsync(long userId, long? cursor, int take);

    Task<long> CountUnreadByUserIdAsync(long userId);

    Task<bool> UpdateAsync(Notification notification);
}
