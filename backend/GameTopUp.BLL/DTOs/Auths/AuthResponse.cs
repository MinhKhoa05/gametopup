using System.Text.Json.Serialization;
using GameTopUp.BLL.DTOs.Users;

namespace GameTopUp.BLL.DTOs.Auths;

public sealed class AuthResponse
{
    [JsonIgnore]
    public string AccessToken { get; set; } = string.Empty;

    [JsonIgnore]
    public string RefreshToken { get; set; } = string.Empty;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public UserResponse? User { get; set; }
}
