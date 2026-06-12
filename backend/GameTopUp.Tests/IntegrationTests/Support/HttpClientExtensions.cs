using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using GameTopUp.DAL.Entities.Users;

namespace GameTopUp.Tests.IntegrationTests.Support;

public static class HttpClientExtensions
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public static HttpClient AsTestUser(
        this HttpClient client,
        long userId,
        string displayName,
        string email,
        UserRole role = UserRole.Member)
    {
        client.DefaultRequestHeaders.Remove("X-Test-UserId");
        client.DefaultRequestHeaders.Remove("X-Test-DisplayName");
        client.DefaultRequestHeaders.Remove("X-Test-Email");
        client.DefaultRequestHeaders.Remove("X-Test-Role");

        client.DefaultRequestHeaders.Add("X-Test-UserId", userId.ToString());
        client.DefaultRequestHeaders.Add("X-Test-DisplayName", displayName);
        client.DefaultRequestHeaders.Add("X-Test-Email", email);
        client.DefaultRequestHeaders.Add("X-Test-Role", role.ToString());

        return client;
    }

    public static Task<HttpResponseMessage> PostJsonAsync<TRequest>(
        this HttpClient client,
        string requestUri,
        TRequest request,
        CancellationToken cancellationToken = default)
    {
        return client.PostAsync(requestUri, CreateJsonContent(request), cancellationToken);
    }

    public static Task<HttpResponseMessage> PutJsonAsync<TRequest>(
        this HttpClient client,
        string requestUri,
        TRequest request,
        CancellationToken cancellationToken = default)
    {
        return client.PutAsync(requestUri, CreateJsonContent(request), cancellationToken);
    }

    public static async Task<ApiResponseEnvelope<T>> ReadApiResponseAsync<T>(this HttpResponseMessage response)
    {
        var payload = await response.Content.ReadFromJsonAsync<ApiResponseEnvelope<T>>(JsonOptions);
        return payload ?? throw new InvalidOperationException("Response body was empty.");
    }

    private static StringContent CreateJsonContent<TRequest>(TRequest request)
    {
        var json = JsonSerializer.Serialize(request, JsonOptions);
        return new StringContent(json, Encoding.UTF8, "application/json");
    }
}
