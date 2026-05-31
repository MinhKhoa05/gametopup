namespace GameTopUp.BLL.DTOs.Images
{
    public class ImageUploadResult
    {
        public string PublicId { get; set; } = null!;
        public string Url { get; set; } = null!;
        public string SecureUrl { get; set; } = null!;
        public string ResourceType { get; set; } = "image";
        public string? Format { get; set; }
        public long Bytes { get; set; }
        public int? Width { get; set; }
        public int? Height { get; set; }
        public string? OriginalFileName { get; set; }
    }
}
