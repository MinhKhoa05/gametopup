using GameTopUp.BLL.Exceptions;

namespace GameTopUp.BLL.Services.Auth;

public sealed class PasswordService
{
    public string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password);

    public bool Verify(string password, string passwordHash) => BCrypt.Net.BCrypt.Verify(password, passwordHash);

    public void Validate(string password)
    {
        if (!IsStrongPassword(password))
        {
            throw new BusinessException(ErrorCode.WeakPassword);
        }
    }

    private static bool IsStrongPassword(string password)
    {
        return password.Length >= 8
            && password.Any(char.IsUpper)
            && password.Any(char.IsLower)
            && password.Any(char.IsDigit)
            && password.Any(ch => !char.IsLetterOrDigit(ch));
    }
}
