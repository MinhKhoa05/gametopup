namespace GameTopUp.BLL.DTOs.Images
{
    public class ImageStorageResult
    {
        public string Url { get; set; } = null!;
        public string RelativePath { get; set; } = null!;
        public string StoredFileName { get; set; } = null!;
        public long Bytes { get; set; }
        public string? OriginalFileName { get; set; }
    }
}
