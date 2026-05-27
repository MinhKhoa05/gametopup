namespace GameTopUp.BLL.DTOs.Auths
{
    public class TokenPayload
    {
        public long UserId { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
    }
}
