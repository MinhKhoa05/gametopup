using System.Text.Json.Serialization;
using GameTopUp.BLL.DTOs.Users;

namespace GameTopUp.BLL.DTOs.Auths
{
    public class AuthResponseDTO
    {
        [JsonIgnore]
        public string AccessToken { get; set; } = string.Empty;

        [JsonIgnore]
        public string RefreshToken { get; set; } = string.Empty;

        public UserResponseDTO? User { get; set; }
    }
}
