using Xunit;

// Chạy tuần tự tránh Race Condition khi Reset Database giữa các Test Class.
[assembly: CollectionBehavior(DisableTestParallelization = true)]

namespace GameTopUp.Tests.IntegrationTests.Infrastructure
{
    // Tối ưu tài nguyên: Dùng chung 1 Docker instance cho toàn bộ bộ test.
    [CollectionDefinition("IntegrationTests")]
    public class SharedTestCollection : ICollectionFixture<CustomWebApplicationFactory<Program>>
    {
    }
}