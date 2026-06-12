using System.Data.Common;
using Dapper;
using Dommel;
using DotNet.Testcontainers.Builders;
using GameTopUp.DAL.Database;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using MySqlConnector;
using Respawn;
using Testcontainers.MariaDb;
using Xunit;
using Xunit.Sdk;

namespace GameTopUp.Tests.IntegrationTests.Infrastructure;

public sealed class CustomWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private static MariaDbContainer? Container;

    private static readonly SemaphoreSlim SchemaLock = new(1, 1);
    private static bool SchemaInitialized;

    private Respawner? _respawner;

    static CustomWebApplicationFactory()
    {
        DefaultTypeMap.MatchNamesWithUnderscores = true;
        DommelMapper.SetColumnNameResolver(new SnakeCaseResolver());
        DommelMapper.AddSqlBuilder(typeof(MySqlConnection), new MySqlSqlBuilder());
    }

    public async Task InitializeAsync()
    {
        try
        {
            await GetContainer().StartAsync();
        }
        catch (DockerUnavailableException ex)
        {
            throw SkipException.ForSkip($"Integration tests require Docker/Testcontainers. {ex.Message}");
        }

        if (SchemaInitialized)
        {
            return;
        }

        await SchemaLock.WaitAsync();
        try
        {
            if (!SchemaInitialized)
            {
                await InitializeSchemaAsync();
                SchemaInitialized = true;
            }
        }
        finally
        {
            SchemaLock.Release();
        }
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        if (Container is not null)
        {
            await Container.DisposeAsync();
        }
    }

    public async Task ResetDatabaseAsync()
    {
        var container = GetContainer();
        await using var connection = new MySqlConnection(container.GetConnectionString());
        await connection.OpenAsync();

        _respawner ??= await Respawner.CreateAsync(connection, new RespawnerOptions
        {
            DbAdapter = DbAdapter.MySql,
            SchemasToInclude = new[] { "game_topup_test" }
        });

        await _respawner.ResetAsync(connection);
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureAppConfiguration((_, configuration) =>
        {
            var container = GetContainer();
            configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Default"] = container.GetConnectionString(),
                ["Jwt:Key"] = "integration-test-signing-key-that-is-long-enough-12345",
                ["Jwt:Issuer"] = "GameTopUp.Tests",
                ["Jwt:Audience"] = "GameTopUp.Tests",
                ["Jwt:ExpireMinutes"] = "60",
                ["VietQr:BankId"] = "TESTBANK",
                ["VietQr:AccountNo"] = "0123456789",
                ["VietQr:AccountName"] = "GameTopUp Tests"
            });
        });

        builder.ConfigureServices(services =>
        {
            var container = GetContainer();
            services.RemoveAll<DatabaseContext>();
            services.AddScoped<DatabaseContext>(_ => new DatabaseContext(new MySqlConnection(container.GetConnectionString())));

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = TestAuthHandler.SchemeName;
                options.DefaultChallengeScheme = TestAuthHandler.SchemeName;
            }).AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.SchemeName, _ => { });
        });
    }

    private static async Task InitializeSchemaAsync()
    {
        var container = GetContainer();
        var schemaPath = LocateSchemaPath();
        if (!File.Exists(schemaPath))
        {
            throw new FileNotFoundException("Could not find integration test schema.", schemaPath);
        }

        var statements = File.ReadAllText(schemaPath)
            .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(statement => !string.IsNullOrWhiteSpace(statement))
            .ToList();

        await using var connection = new MySqlConnection(container.GetConnectionString());
        await connection.OpenAsync();

        foreach (var statement in statements)
        {
            await connection.ExecuteAsync(statement);
        }
    }

    private static string LocateSchemaPath()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null)
        {
            var schemaPath = Path.Combine(directory.FullName, "database", "schema.sql");
            if (File.Exists(schemaPath))
            {
                return schemaPath;
            }

            directory = directory.Parent;
        }

        return Path.Combine(AppContext.BaseDirectory, "database", "schema.sql");
    }

    private static MariaDbContainer GetContainer()
    {
        if (Container is not null)
        {
            return Container;
        }

        Container = new MariaDbBuilder("mariadb:11.4")
            .WithDatabase("game_topup_test")
            .WithUsername("test_user")
            .WithPassword("test_password")
            .Build();

        return Container;
    }
}
