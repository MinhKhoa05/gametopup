using Xunit;

namespace GameTopUp.Tests.IntegrationTests.Infrastructure
{
    public abstract class BaseIntegrationTest : IAsyncLifetime
    {
        protected readonly CustomWebApplicationFactory<Program> Factory;
        protected HttpClient Client = null!;

        protected BaseIntegrationTest(CustomWebApplicationFactory<Program> factory)
        {
            Factory = factory;
        }

        public virtual async Task InitializeAsync()
        {
            await Factory.ResetDatabaseAsync();
            Client = Factory.CreateClient();
        }

        public virtual Task DisposeAsync()
        {
            return Task.CompletedTask;
        }
    }
}
