namespace GameTopUp.Api.Extensions;

public static class ConfigurationExtensions
{
    public static void ApplyEnvironmentOverrides(this IConfiguration configuration)
    {
        ApplyDatabase(configuration);
        ApplySecrets(configuration);
    }

    public static string[] GetAllowedOrigins(this IConfiguration configuration)
    {
        return configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
    }

    private static void ApplyDatabase(IConfiguration configuration)
    {
        SetFromEnv(configuration, "Database:Host", "DB_HOST");
        SetFromEnv(configuration, "Database:Port", "DB_PORT");
        SetFromEnv(configuration, "Database:Name", "DB_NAME");
        SetFromEnv(configuration, "Database:User", "DB_USER");
        SetFromEnv(configuration, "Database:Password", "DB_PASSWORD");

        var dbHost = configuration["Database:Host"];
        var dbPort = configuration["Database:Port"];
        var dbName = configuration["Database:Name"];
        var dbUser = configuration["Database:User"];
        var dbPass = configuration["Database:Password"];

        configuration["ConnectionStrings:Default"] = $"server={dbHost};port={dbPort};database={dbName};user={dbUser};password={dbPass};SslMode=None;";
    }

    private static void ApplySecrets(IConfiguration configuration)
    {
        SetFromEnv(configuration, "Jwt:Key", "JWT_KEY");
        SetFromEnv(configuration, "VietQr:BankId", "VIETQR_BANK_ID");
        SetFromEnv(configuration, "VietQr:AccountNo", "VIETQR_ACCOUNT_NO");
        SetFromEnv(configuration, "VietQr:AccountName", "VIETQR_ACCOUNT_NAME");
        SetFromEnv(configuration, "VietQr:Template", "VIETQR_TEMPLATE");
    }

    private static void SetFromEnv(IConfiguration configuration, string key, string envName)
    {
        var value = Environment.GetEnvironmentVariable(envName);
        if (!string.IsNullOrWhiteSpace(value))
        {
            configuration[key] = value;
        }
    }
}
