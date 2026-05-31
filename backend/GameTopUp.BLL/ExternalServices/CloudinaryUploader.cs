using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using GameTopUp.BLL.DTOs.Images;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Interfaces;
using GameTopUp.BLL.Options;
using Microsoft.Extensions.Options;

namespace GameTopUp.BLL.ExternalServices
{
    public class CloudinaryUploader : ICloudinaryUploader
    {
        private readonly HttpClient _httpClient;
        private readonly CloudinarySettings _settings;

        public CloudinaryUploader(HttpClient httpClient, IOptions<CloudinarySettings> cloudinaryOptions)
        {
            _httpClient = httpClient;
            _settings = cloudinaryOptions.Value;
        }

        public async Task<ImageUploadResult> UploadImageAsync(Stream fileStream, string fileName, string contentType)
        {
            ValidateSettings();

            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
            var folder = string.IsNullOrWhiteSpace(_settings.Folder) ? "gametopup" : _settings.Folder.Trim();
            var signature = CreateSignature(new Dictionary<string, string>
            {
                ["folder"] = folder,
                ["timestamp"] = timestamp
            });

            using var content = new MultipartFormDataContent
            {
                { new StringContent(_settings.ApiKey), "api_key" },
                { new StringContent(timestamp), "timestamp" },
                { new StringContent(folder), "folder" },
                { new StringContent(signature), "signature" }
            };

            using var fileContent = new StreamContent(fileStream);
            fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);
            content.Add(fileContent, "file", fileName);

            var endpoint = $"https://api.cloudinary.com/v1_1/{Uri.EscapeDataString(_settings.CloudName)}/image/upload";
            using var response = await _httpClient.PostAsync(endpoint, content);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new BusinessException(ErrorCodes.CloudinaryUploadFailed, $"Upload Cloudinary thất bại: {responseBody}");
            }

            return ParseUploadResponse(responseBody, fileName);
        }

        private void ValidateSettings()
        {
            if (string.IsNullOrWhiteSpace(_settings.CloudName) ||
                string.IsNullOrWhiteSpace(_settings.ApiKey) ||
                string.IsNullOrWhiteSpace(_settings.ApiSecret))
            {
                throw new BusinessException(ErrorCodes.CloudinarySettingsMissing);
            }
        }

        private string CreateSignature(Dictionary<string, string> parameters)
        {
            var payload = string.Join("&", parameters
                .Where(parameter => !string.IsNullOrWhiteSpace(parameter.Value))
                .OrderBy(parameter => parameter.Key, StringComparer.Ordinal)
                .Select(parameter => $"{parameter.Key}={parameter.Value}"));

            var bytes = SHA1.HashData(Encoding.UTF8.GetBytes(payload + _settings.ApiSecret));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        private static ImageUploadResult ParseUploadResponse(string responseBody, string originalFileName)
        {
            using var document = JsonDocument.Parse(responseBody);
            var root = document.RootElement;

            return new ImageUploadResult
            {
                PublicId = root.GetProperty("public_id").GetString()!,
                Url = root.GetProperty("url").GetString()!,
                SecureUrl = root.GetProperty("secure_url").GetString()!,
                ResourceType = root.GetProperty("resource_type").GetString() ?? "image",
                Format = root.TryGetProperty("format", out var format) ? format.GetString() : null,
                Bytes = root.TryGetProperty("bytes", out var bytes) ? bytes.GetInt64() : 0,
                Width = root.TryGetProperty("width", out var width) ? width.GetInt32() : null,
                Height = root.TryGetProperty("height", out var height) ? height.GetInt32() : null,
                OriginalFileName = originalFileName
            };
        }
    }
}
