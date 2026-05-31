using GameTopUp.DAL.Entities;

namespace GameTopUp.BLL.Context
{
    public class UserContext
    {
        public long UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Member;

        public UserContext()
        {
        }

        public UserContext(long userId, string username, UserRole role)
        {
            UserId = userId;
            Username = username;
            Role = role;
        }
    }
}
