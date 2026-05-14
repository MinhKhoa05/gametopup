using System.ComponentModel.DataAnnotations;

namespace GameTopUp.BLL.DTOs.Auths
{
    public class RefreshTokenRequestDTO
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
