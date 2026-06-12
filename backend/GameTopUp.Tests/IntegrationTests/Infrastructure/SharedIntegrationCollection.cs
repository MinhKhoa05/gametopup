using Xunit;

[assembly: CollectionBehavior(DisableTestParallelization = true)]

namespace GameTopUp.Tests.IntegrationTests.Infrastructure;

[CollectionDefinition("Integration")]
public sealed class SharedIntegrationCollection : ICollectionFixture<CustomWebApplicationFactory>
{
}
