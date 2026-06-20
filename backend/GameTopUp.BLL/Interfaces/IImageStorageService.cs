using GameTopUp.BLL.DTOs.Images;
using Microsoft.AspNetCore.Http;

namespace GameTopUp.BLL.Interfaces;

public interface IImageStorageService
{
    Task<ImageStorageResult?> UploadAsync(IFormFile? image, string folder);
    Task DeleteAsync(string? relativePath);
}
