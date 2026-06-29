using Microsoft.AspNetCore.Http;

namespace GameTopUp.BLL.Services.Images;

public interface IImageStorageService
{
    Task<ImageStorageResult?> UploadAsync(IFormFile? image, string folder);
    Task DeleteAsync(string? relativePath);
}
