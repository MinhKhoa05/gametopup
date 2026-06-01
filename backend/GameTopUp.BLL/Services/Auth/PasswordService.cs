using GameTopUp.BLL.Exceptions;

namespace GameTopUp.BLL.Services.Auth
{
    public class PasswordService
    {        
        public string Hash(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool Verify(string password, string passwordHash)
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }

        public void Validate(string password)
        {
            if (!IsStrongPassword(password))
            {
                throw new BusinessException(ErrorCode.WeakPassword);
            }
        }

        private bool IsStrongPassword(string password)
        {
            if (password.Length < 8) return false;
            if (!password.Any(char.IsUpper)) return false;
            if (!password.Any(char.IsLower)) return false;
            if (!password.Any(char.IsDigit)) return false;
            if (!password.Any(ch => !char.IsLetterOrDigit(ch))) return false;
            return true;
        }
    }
}

