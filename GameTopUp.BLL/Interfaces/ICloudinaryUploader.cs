using GameTopUp.BLL.DTOs.Images;

namespace GameTopUp.BLL.Interfaces
{
    public interface ICloudinaryUploader
    {
        Task<ImageUploadResult> UploadImageAsync(Stream fileStream, string fileName, string contentType);
    }
}
