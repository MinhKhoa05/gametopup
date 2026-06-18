namespace GameTopUp.BLL.DTOs.Games;

public sealed class PublicGameResponse
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
}
