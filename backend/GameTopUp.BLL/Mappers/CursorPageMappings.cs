using GameTopUp.BLL.Contracts;

namespace GameTopUp.BLL.Mappers;

public static class CursorPageMappings
{
    private const int DefaultPageSize = 20;
    private const int MaxPageSize = 100;

    public static async Task<CursorPageResponse<TResult>> ToCursorPageAsync<TSource, TResult>(
        int? limit,
        Func<int, Task<List<TSource>>> query,
        Func<TSource, TResult> mapper,
        Func<TSource, long?> cursorSelector)
    {
        var take = NormalizeLimit(limit);
        var rows = await query(take + 1);
        var hasMore = rows.Count > take;
        var page = rows.Take(take).ToList();

        return new CursorPageResponse<TResult>
        {
            Items = page.Select(mapper).ToList(),
            HasMore = hasMore,
            NextCursor = hasMore ? cursorSelector(page[^1]) : null
        };
    }

    private static int NormalizeLimit(int? limit)
    {
        if (limit is null or <= 0)
        {
            return DefaultPageSize;
        }

        return Math.Min(limit.Value, MaxPageSize);
    }
}
