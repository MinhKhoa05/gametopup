using GameTopUp.BLL.DTOs.Images;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace GameTopUp.BLL.Common
{
    public class LocalImageStorageService : IImageStorageService
    {
        private const long MaxImageSize = 5 * 1024 * 1024;
        private static readonly IReadOnlyDictionary<string, string> ContentTypeExtensions = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["image/jpeg"] = ".jpg",
            ["image/png"] = ".png",
            ["image/webp"] = ".webp"
        };

        private readonly IHostEnvironment _environment;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public LocalImageStorageService(IHostEnvironment environment, IHttpContextAccessor httpContextAccessor)
        {
            _environment = environment;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<ImageStorageResult> UploadAsync(IFormFile image, string folder)
        {
            ValidateImage(image);

            var relativePath = BuildRelativePath(folder, image.ContentType);
            var physicalPath = GetPhysicalPath(relativePath);
            Directory.CreateDirectory(Path.GetDirectoryName(physicalPath)!);

            await using (var target = new FileStream(physicalPath, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, useAsync: true))
            {
                await image.CopyToAsync(target);
            }

            return new ImageStorageResult
            {
                Url = BuildPublicUrl(relativePath),
                RelativePath = relativePath.Replace('\\', '/'),
                StoredFileName = Path.GetFileName(physicalPath),
                Bytes = new FileInfo(physicalPath).Length,
                OriginalFileName = image.FileName
            };
        }

        public Task DeleteAsync(string? relativePath)
        {
            if (string.IsNullOrWhiteSpace(relativePath))
            {
                return Task.CompletedTask;
            }

            var normalizedRelativePath = relativePath.TrimStart('/').Replace('\\', '/');
            var physicalPath = GetPhysicalPath(normalizedRelativePath);
            if (File.Exists(physicalPath))
            {
                File.Delete(physicalPath);
            }

            return Task.CompletedTask;
        }

        private string BuildRelativePath(string folder, string contentType)
        {
            var safeFolder = SanitizeSegment(folder);
            var extension = ResolveExtension(contentType);
            var datePath = DateTime.UtcNow.ToString("yyyy/MM/dd");
            var fileName = $"{Guid.NewGuid():N}{extension}";
            return Path.Combine("uploads", safeFolder, datePath, fileName);
        }

        private string GetPhysicalPath(string relativePath)
        {
            var webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");
            return Path.Combine(webRoot, relativePath);
        }

        private string BuildPublicUrl(string relativePath)
        {
            var webPath = "/" + relativePath.Replace('\\', '/');
            var context = _httpContextAccessor.HttpContext;
            if (context?.Request == null)
            {
                return webPath;
            }

            return $"{context.Request.Scheme}://{context.Request.Host}{webPath}";
        }

        private static string ResolveExtension(string contentType)
        {
            if (ContentTypeExtensions.TryGetValue(contentType, out var extension))
            {
                return extension;
            }

            throw new BusinessException(ErrorCode.UnsupportedImageType);
        }

        private static string SanitizeSegment(string segment)
        {
            if (segment.Contains('/') || segment.Contains('\\'))
            {
                throw new BusinessException(ErrorCode.InvalidImageFileName);
            }

            var cleaned = segment.Trim().Trim(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar, ' ');
            if (string.IsNullOrWhiteSpace(cleaned))
            {
                throw new BusinessException(ErrorCode.InvalidImageFileName);
            }

            return string.Join("-", cleaned.Split(Path.GetInvalidFileNameChars(), StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
        }

        private static void ValidateImage(IFormFile image)
        {
            if (image == null || image.Length == 0)
            {
                throw new BusinessException(ErrorCode.ImageRequired);
            }

            if (image.Length > MaxImageSize)
            {
                throw new BusinessException(ErrorCode.ImageTooLarge);
            }

            if (string.IsNullOrWhiteSpace(image.FileName))
            {
                throw new BusinessException(ErrorCode.InvalidImageFileName);
            }

            if (string.IsNullOrWhiteSpace(image.ContentType))
            {
                throw new BusinessException(ErrorCode.UnsupportedImageType);
            }

            var extension = Path.GetExtension(image.FileName);
            if (!ContentTypeExtensions.Any(entry => entry.Value.Equals(extension, StringComparison.OrdinalIgnoreCase)))
            {
                throw new BusinessException(ErrorCode.UnsupportedImageType);
            }
        }
    }
}
