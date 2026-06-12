using DotNet.Testcontainers.Builders;
using Testcontainers.MariaDb;

namespace GameTopUp.Tests.IntegrationTests.Infrastructure;

internal static class DockerTestSupport
{
    private static readonly Lazy<(bool Available, string? Reason)> Availability = new(ProbeDockerAvailability);

    public static bool IsAvailable => Availability.Value.Available;
    public static string? SkipReason => Availability.Value.Reason;

    private static (bool Available, string? Reason) ProbeDockerAvailability()
    {
        try
        {
            _ = new MariaDbBuilder("mariadb:11.4")
                .WithDatabase("docker_probe")
                .WithUsername("probe")
                .WithPassword("probe_password")
                .Build();

            return (true, null);
        }
        catch (DockerUnavailableException ex)
        {
            return (false, $"Integration tests require Docker/Testcontainers. {ex.Message}");
        }
    }
}
