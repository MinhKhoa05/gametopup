using GameTopUp.BLL.Exceptions;

namespace GameTopUp.BLL.Utilities;

public static class InputTextNormalizer
{
    public static string? NullIfWhiteSpace(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    public static string Required(string? value, ErrorCode errorCode = ErrorCode.BadRequest)
    {
        return NullIfWhiteSpace(value) ?? throw new BusinessException(errorCode);
    }
}
