namespace GameTopUp.BLL.Services.Images;

public sealed class ImageStorageResult
{
    public string Url { get; set; } = string.Empty;
    public string RelativePath { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public long Bytes { get; set; }
    public string? OriginalFileName { get; set; }
}
