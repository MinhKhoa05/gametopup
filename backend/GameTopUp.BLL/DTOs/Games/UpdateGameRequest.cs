namespace GameTopUp.BLL.DTOs.Games
{
    public class UpdateGameRequest
    {
        public string? Name { get; set; }
        public string? ImageUrl { get; set; }
        public string? ImageRelativePath { get; set; }
        public bool? IsActive { get; set; }
    }
}
