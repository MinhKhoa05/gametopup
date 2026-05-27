using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Authentication;
using System.Data.Common;
using Microsoft.Extensions.DependencyInjection;
using GameTopUp.DAL.Database;
using Testcontainers.MariaDb;
using Respawn;
using MySqlConnector;
using Dapper;
using Dommel;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xunit;

namespace GameTopUp.Tests.IntegrationTests.Infrastructure
{
    public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram>, IAsyncLifetime where TProgram : class
    {
        private static readonly MariaDbContainer _dbContainer = new MariaDbBuilder("mariadb:11")
            .WithDatabase("game_topup_test")
            .WithUsername("test_user")
            .WithPassword("test_password")
            .Build();

        private Respawner? _respawner;
        private static bool _schemaInitialized = false;
        private static readonly SemaphoreSlim _semaphore = new(1, 1);

        static CustomWebApplicationFactory()
        {
            // Đồng bộ mapping code (PascalCase) và Database (snake_case).
            DefaultTypeMap.MatchNamesWithUnderscores = true;
            DommelMapper.SetColumnNameResolver(new SnakeCaseResolver());
            DommelMapper.AddSqlBuilder(typeof(MySqlConnection), new MySqlSqlBuilder());
        }

        // Chống Deadlock: IAsyncLifetime khởi chạy container bất đồng bộ an toàn hơn static constructor.
        public async Task InitializeAsync()
        {
            await _dbContainer.StartAsync();
            
            if (!_schemaInitialized)
            {
                await _semaphore.WaitAsync();
                try
                {
                    if (!_schemaInitialized)
                    {
                        await InitializeSchemaAsync();
                        _schemaInitialized = true;
                    }
                }
                finally
                {
                    _semaphore.Release();
                }
            }
        }

        async Task IAsyncLifetime.DisposeAsync() => await _dbContainer.DisposeAsync();

        private async Task InitializeSchemaAsync()
        {
            // Tự động tìm schema.sql ở root/Database cho mọi môi trường (Local/CI).
            string baseDir = AppContext.BaseDirectory;
            string schemaPath = Path.Combine(baseDir, "Database", "schema.sql");
            
            if (!File.Exists(schemaPath))
            {
                var dir = new DirectoryInfo(baseDir);
                while (dir != null && !File.Exists(Path.Combine(dir.FullName, "Database", "schema.sql")))
                {
                    dir = dir.Parent;
                }
                if (dir != null) schemaPath = Path.Combine(dir.FullName, "Database", "schema.sql");
            }

            var schema = await File.ReadAllTextAsync(schemaPath);
            
            // Execute batch: Hỗ trợ script phức tạp (Trigger/Procedure) không cần split ';'.
            using var conn = new MySqlConnection(_dbContainer.GetConnectionString());
            await conn.OpenAsync();
            await conn.ExecuteAsync(schema);
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseSetting("Jwt:Key", "SuperSecretTestKeyThatIsVeryLongAndSecure12345!");
            
            builder.ConfigureServices(services =>
            {
                // Cách ly môi trường: Gỡ bỏ cấu hình DB thực tế.
                services.RemoveAll<DatabaseContext>();
                services.RemoveAll<DbConnection>();

                // Bypass bảo mật: Dùng TestAuthHandler thay thế JWT infrastructure.
                services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = "Test";
                    options.DefaultChallengeScheme = "Test";
                }).AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", options => { });

                services.AddScoped<DatabaseContext>(sp => 
                {
                    // Quản lý lifecycle: DatabaseContext tự dispose connection khi kết thúc Request.
                    var conn = new MySqlConnection(_dbContainer.GetConnectionString());
                    return new DatabaseContext(conn);
                });
            });
        }

        public async Task ResetDatabaseAsync()
        {
            using var conn = new MySqlConnection(_dbContainer.GetConnectionString());
            await conn.OpenAsync();

            if (_respawner == null)
            {
                // Hiệu năng: Respawn truncate dữ liệu cực nhanh, bảo toàn cấu trúc bảng.
                _respawner = await Respawner.CreateAsync(conn, new RespawnerOptions
                {
                    DbAdapter = DbAdapter.MySql,
                    SchemasToInclude = new[] { "game_topup_test" }
                });
            }

            await _respawner.ResetAsync(conn);
        }
    }
}
