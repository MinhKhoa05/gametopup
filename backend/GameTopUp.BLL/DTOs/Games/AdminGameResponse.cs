namespace GameTopUp.BLL.DTOs.Games;

public sealed class AdminGameResponse
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int ActivePackages { get; set; }
    public int InactivePackages { get; set; }
    public int TotalPackages { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
