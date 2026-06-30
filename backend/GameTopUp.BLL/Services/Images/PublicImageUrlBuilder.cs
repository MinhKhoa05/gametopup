namespace GameTopUp.BLL.Services.Images;

public sealed class PublicImageUrlBuilder
{
    private readonly Uri _baseUri;

    public PublicImageUrlBuilder(string baseUrl)
    {
        _baseUri = new Uri(NormalizeBaseUrl(baseUrl), UriKind.Absolute);
    }

    public string Build(string? imagePath)
    {
        if (string.IsNullOrWhiteSpace(imagePath))
        {
            return string.Empty;
        }

        var trimmed = imagePath.Trim();
        if (trimmed.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
            || trimmed.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            return trimmed;
        }

        return new Uri(_baseUri, trimmed.TrimStart('/')).ToString();
    }

    private static string NormalizeBaseUrl(string baseUrl)
    {
        return baseUrl.Trim().TrimEnd('/') + "/";
    }
}
