using GameTopUp.BLL.DTOs.Users;

namespace GameTopUp.BLL.DTOs.Auths
{
    public class LoginResponseDTO
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;

        public UserResponseDTO? User { get; set; }
    }
}
