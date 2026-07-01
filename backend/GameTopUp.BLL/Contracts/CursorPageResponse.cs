namespace GameTopUp.BLL.Contracts;

public sealed class CursorPageResponse<T>
{
    public List<T> Items { get; set; } = [];
    public long? NextCursor { get; set; }
    public bool HasMore { get; set; }
}
