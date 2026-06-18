namespace GameTopUp.BLL.DTOs.Games;

public sealed class AdminGameSummaryResponse
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int PackageCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
