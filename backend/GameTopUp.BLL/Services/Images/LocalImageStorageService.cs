using GameTopUp.BLL.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace GameTopUp.BLL.Services.Images;

public sealed class LocalImageStorageService : IImageStorageService
{
    private const long MaxImageSize = 5 * 1024 * 1024;
    private static readonly IReadOnlyDictionary<string, string> ContentTypeExtensions = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        ["image/jpeg"] = ".jpg",
        ["image/png"] = ".png",
        ["image/webp"] = ".webp"
    };

    private readonly IHostEnvironment _environment;

    public LocalImageStorageService(IHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<ImageStorageResult?> UploadAsync(IFormFile? image, string folder)
    {
        if (image is null)
        {
            return null;
        }

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
            RelativePath = NormalizeRelativePath(relativePath),
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

        var normalizedRelativePath = NormalizeRelativePath(relativePath);
        var physicalPath = GetPhysicalPath(normalizedRelativePath);

        if (File.Exists(physicalPath))
        {
            File.Delete(physicalPath);

            var uploadsRoot = GetPhysicalPath("uploads");
            var directory = Path.GetDirectoryName(physicalPath);

            if (!string.IsNullOrWhiteSpace(directory))
            {
                DeleteEmptyParentDirectories(directory, uploadsRoot);
            }
        }

        return Task.CompletedTask;
    }

    private string BuildRelativePath(string folder, string contentType)
    {
        var safeFolder = SanitizeSegment(folder);
        var extension = ResolveExtension(contentType);
        var datePath = DateTimeOffset.UtcNow.ToString("yyyy/MM");
        var fileName = $"{Guid.NewGuid():N}{extension}";
        return Path.Combine("uploads", safeFolder, datePath, fileName);
    }

    private string GetPhysicalPath(string relativePath)
    {
        var webRoot = Path.GetFullPath(Path.Combine(_environment.ContentRootPath, "wwwroot"));
        var normalizedRelativePath = NormalizeRelativePath(relativePath).Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.GetFullPath(Path.Combine(webRoot, normalizedRelativePath));

        if (!fullPath.Equals(webRoot, StringComparison.OrdinalIgnoreCase)
            && !fullPath.StartsWith(webRoot + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
        {
            throw new BusinessException(ErrorCode.InvalidImageFile);
        }

        return fullPath;
    }

    private string BuildPublicUrl(string relativePath)
    {
        return "/" + NormalizeRelativePath(relativePath);
    }

    private static string ResolveExtension(string contentType)
    {
        if (ContentTypeExtensions.TryGetValue(contentType, out var extension))
        {
            return extension;
        }

        throw new BusinessException(ErrorCode.InvalidImageFile);
    }

    private static string SanitizeSegment(string segment)
    {
        if (string.IsNullOrWhiteSpace(segment))
        {
            throw new BusinessException(ErrorCode.InvalidImageFile);
        }

        if (segment.Contains('/') || segment.Contains('\\'))
        {
            throw new BusinessException(ErrorCode.InvalidImageFile);
        }

        var cleaned = segment.Trim().Trim(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar, ' ');
        if (string.IsNullOrWhiteSpace(cleaned))
        {
            throw new BusinessException(ErrorCode.InvalidImageFile);
        }

        return string.Join("-", cleaned.Split(Path.GetInvalidFileNameChars(), StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
    }

    private static string NormalizeRelativePath(string relativePath)
    {
        return relativePath.TrimStart('/', '\\').Replace('\\', '/');
    }

    private static void ValidateImage(IFormFile image)
    {
        if (image == null || image.Length == 0)
        {
            throw new BusinessException(ErrorCode.InvalidImageFile);
        }

        if (image.Length > MaxImageSize)
        {
            throw new BusinessException(ErrorCode.InvalidImageFile);
        }

        if (string.IsNullOrWhiteSpace(image.FileName))
        {
            throw new BusinessException(ErrorCode.InvalidImageFile);
        }

        if (string.IsNullOrWhiteSpace(image.ContentType))
        {
            throw new BusinessException(ErrorCode.InvalidImageFile);
        }

        var extension = Path.GetExtension(image.FileName);
        if (!ContentTypeExtensions.Any(entry => entry.Value.Equals(extension, StringComparison.OrdinalIgnoreCase)))
        {
            throw new BusinessException(ErrorCode.InvalidImageFile);
        }
    }

    private static void DeleteEmptyParentDirectories(string startDirectory, string stopDirectory)
    {
        var current = new DirectoryInfo(startDirectory);
        var stopFullPath = Path.GetFullPath(stopDirectory);

        while (current.Exists &&
               !string.Equals(current.FullName, stopFullPath, StringComparison.OrdinalIgnoreCase) &&
               !current.EnumerateFileSystemInfos().Any())
        {
            var parent = current.Parent;

            current.Delete();

            if (parent is null)
            {
                break;
            }

            current = parent;
        }
    }
}
