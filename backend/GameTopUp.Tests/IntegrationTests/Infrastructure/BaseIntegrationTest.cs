using GameTopUp.DAL.Entities.Users;
using Microsoft.AspNetCore.Mvc.Testing;
using GameTopUp.Tests.IntegrationTests.Support;

namespace GameTopUp.Tests.IntegrationTests.Infrastructure;

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

    protected HttpClient CreateAuthenticatedClient(
        long userId,
        string displayName,
        string email,
        UserRole role = UserRole.Member)
    {
        return Factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        }).AsTestUser(userId, displayName, email, role);
    }
}
