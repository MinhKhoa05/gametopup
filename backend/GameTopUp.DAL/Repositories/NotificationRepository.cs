using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;

namespace GameTopUp.DAL.Repositories;

public sealed class NotificationRepository : INotificationRepository
{
    private readonly DatabaseContext _database;

    public NotificationRepository(DatabaseContext database)
    {
        _database = database;
    }

    public Task<long> CreateAsync(Notification notification) =>
        _database.InsertAsync(notification);

    public Task<Notification?> GetByIdForUserAsync(long id, long userId)
    {
        const string sql =
            """
            SELECT *
            FROM notifications
            WHERE id = @Id
            AND user_id = @UserId
            """;

        return _database.QueryFirstOrDefaultAsync<Notification>(
            sql,
            new
            {
                Id = id,
                UserId = userId
            });
    }

    public Task<List<Notification>> GetByUserIdAsync(long userId, long? cursor, int take)
    {
        var sql =
            """
            SELECT *
            FROM notifications
            WHERE user_id = @UserId
            AND (@Cursor IS NULL OR id < @Cursor)
            ORDER BY created_at DESC, id DESC
            LIMIT @Take
            """;

        return _database.QueryAsync<Notification>(
            sql,
            new
            {
                UserId = userId,
                Cursor = cursor,
                Take = take
            });
    }

    public Task<long> CountUnreadByUserIdAsync(long userId)
    {
        const string sql =
            """
            SELECT COUNT(*)
            FROM notifications
            WHERE user_id = @UserId
            AND is_read = FALSE
            """;

        return _database.ExecuteScalarAsync<long>(sql, new { UserId = userId });
    }

    public Task<bool> UpdateAsync(Notification notification) =>
        _database.UpdateAsync(notification);
}
