using GameTopUp.BLL.Exceptions;

namespace GameTopUp.BLL.Common;

public static class InputTextNormalizer
{
    public static string? NullIfWhiteSpace(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    public static string Required(string? value, ErrorCode errorCode)
    {
        return NullIfWhiteSpace(value) ?? throw new BusinessException(errorCode);
    }
}
