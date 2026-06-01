using GameTopUp.BLL.Exceptions;

namespace GameTopUp.BLL.Utils
{
    public static class ImageFileValidator
    {
        private const long MaxImageBytes = 5 * 1024 * 1024;
        private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg",
            "image/png",
            "image/webp"
        };

        public static void Validate(string fileName, string contentType, long fileLength)
        {
            if (fileLength <= 0) throw new BusinessException(ErrorCode.InvalidImageFile);
            if (fileLength > MaxImageBytes) throw new BusinessException(ErrorCode.ImageTooLarge);
            if (!AllowedContentTypes.Contains(contentType))
                throw new BusinessException(ErrorCode.UnsupportedImageType);
            if (string.IsNullOrWhiteSpace(fileName))
                throw new BusinessException(ErrorCode.InvalidImageFileName);
        }
    }
}

