namespace GameTopUp.BLL.Queries.Games;

public sealed class AdminGameSummaryRow
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int PackageCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
