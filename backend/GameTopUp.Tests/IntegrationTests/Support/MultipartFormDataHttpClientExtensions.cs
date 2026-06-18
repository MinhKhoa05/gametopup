namespace GameTopUp.Tests.IntegrationTests.Support;

public static class MultipartFormDataHttpClientExtensions
{
    public static Task<HttpResponseMessage> PostMultipartAsync(
        this HttpClient client,
        string requestUri,
        IReadOnlyDictionary<string, string> fields,
        HttpContent fileContent)
    {
        return client.PostAsync(requestUri, CreateMultipartContent(fields, fileContent));
    }

    public static Task<HttpResponseMessage> PutMultipartAsync(
        this HttpClient client,
        string requestUri,
        IReadOnlyDictionary<string, string> fields,
        HttpContent fileContent)
    {
        return client.PutAsync(requestUri, CreateMultipartContent(fields, fileContent));
    }

    private static MultipartFormDataContent CreateMultipartContent(
        IReadOnlyDictionary<string, string> fields,
        HttpContent fileContent)
    {
        var content = new MultipartFormDataContent();
        foreach (var field in fields)
        {
            content.Add(new StringContent(field.Value), field.Key);
        }

        content.Add(fileContent, "imageFile", "image.png");
        return content;
    }
}
