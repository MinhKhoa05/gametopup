using System.ComponentModel.DataAnnotations;

namespace GameTopUp.BLL.DTOs.Games
{
    public class CreateGameRequest
    {
        [Required]
        [MinLength(1, ErrorMessage = "TÃªn khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")]
        public string Name { get; set; } = null!;

        public string ImageUrl { get; set; } = string.Empty;
        public string? ImageRelativePath { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
