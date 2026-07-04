using GameTopUp.DAL.Entities;
using Microsoft.AspNetCore.Mvc.Testing;
using GameTopUp.IntegrationTests.Extensions;

namespace GameTopUp.IntegrationTests.Infrastructure;

[Collection("Integration")]
public abstract class BaseIntegrationTest : IAsyncLifetime
{
    protected BaseIntegrationTest(CustomWebApplicationFactory factory)
    {
        Factory = factory;
    }

    protected CustomWebApplicationFactory Factory { get; }
    protected HttpClient Client { get; private set; } = null!;

    public virtual async Task InitializeAsync()
    {
        await Factory.ResetDatabaseAsync();
        Client = Factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
    }

    public virtual Task DisposeAsync()
    {
        Client.Dispose();
        return Task.CompletedTask;
    }

    protected HttpClient CreateHeaderAuthenticatedClient(User user)
    {
        var client = CreateClient();

        client.DefaultRequestHeaders.Add("X-Test-UserId", user.Id.ToString());
        client.DefaultRequestHeaders.Add("X-Test-DisplayName", user.DisplayName);
        client.DefaultRequestHeaders.Add("X-Test-Email", user.Email);
        client.DefaultRequestHeaders.Add("X-Test-Role", user.Role.ToString());

        return client;
    }

    protected HttpClient CreateClient()
    {
        return Factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
    }
}
