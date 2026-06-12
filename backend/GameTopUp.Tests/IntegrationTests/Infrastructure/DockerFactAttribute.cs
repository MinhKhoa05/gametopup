using Xunit;

namespace GameTopUp.Tests.IntegrationTests.Infrastructure;

public sealed class DockerFactAttribute : FactAttribute
{
    public DockerFactAttribute()
    {
        if (!DockerTestSupport.IsAvailable)
        {
            Skip = DockerTestSupport.SkipReason;
        }
    }
}
