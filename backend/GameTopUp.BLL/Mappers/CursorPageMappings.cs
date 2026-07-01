using GameTopUp.BLL.Contracts;

namespace GameTopUp.BLL.Mappers;

public static class CursorPageMappings
{
    public static CursorPageResponse<TResult> ToCursorPage<TSource, TResult>(
        IReadOnlyList<TSource> rows,
        int take,
        Func<TSource, TResult> mapper,
        Func<TSource, long?> cursorSelector)
    {
        var hasMore = rows.Count > take;
        var page = rows.Take(take).ToList();

        return new CursorPageResponse<TResult>
        {
            Items = page.Select(mapper).ToList(),
            HasMore = hasMore,
            NextCursor = hasMore ? cursorSelector(page[^1]) : null
        };
    }
}
