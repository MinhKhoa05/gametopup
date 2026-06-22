namespace GameTopUp.BLL.DTOs.Games;

public sealed class GameResponse
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public int ActivePackages { get; set; }
}
