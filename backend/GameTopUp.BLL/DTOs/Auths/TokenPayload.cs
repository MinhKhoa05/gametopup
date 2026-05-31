namespace GameTopUp.BLL.DTOs.Auths
{
    public class TokenPayload
    {
        public long UserId { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }

        public TokenPayload()
        {
        }

        public static TokenPayload Create(long userId, string? name, string? email, string? role)
        {
            return new TokenPayload
            {
                UserId = userId,
                Name = name,
                Email = email,
                Role = role
            };
        }
    }
}
