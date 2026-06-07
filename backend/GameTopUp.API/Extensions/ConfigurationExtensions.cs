namespace GameTopUp.API.Extensions
{
    public static class ConfigurationExtensions
    {
        public static void ApplyEnvironmentOverrides(this IConfiguration configuration)
        {
            ApplyDatabase(configuration);
            ApplyJwt(configuration);
            ApplyCors(configuration);
            ApplyVietQr(configuration);
        }

        private static void ApplyDatabase(IConfiguration configuration)
        {
            var dbHost = Environment.GetEnvironmentVariable("DB_HOST") ?? configuration["Database:Host"] ?? "127.0.0.1";
            var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? configuration["Database:Port"] ?? "3307";
            var dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? configuration["Database:Name"] ?? "game_topup_db";
            var dbUser = Environment.GetEnvironmentVariable("DB_USER") ?? configuration["Database:User"] ?? "game_topup_user";
            var dbPass = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? configuration["Database:Password"] ?? "";

            configuration["ConnectionStrings:Default"] =
                $"server={dbHost};port={dbPort};database={dbName};user={dbUser};password={dbPass};SslMode=None;";
        }

        private static void ApplyJwt(IConfiguration configuration)
        {
            SetFromEnv(configuration, "Jwt:Key", "JWT_KEY");
            configuration["Jwt:Issuer"] = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? configuration["Jwt:Issuer"] ?? "GameTopUp";
            configuration["Jwt:Audience"] = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? configuration["Jwt:Audience"] ?? "GameTopUpUsers";
            configuration["Jwt:ExpireMinutes"] = Environment.GetEnvironmentVariable("JWT_EXPIRE_MINUTES") ?? configuration["Jwt:ExpireMinutes"] ?? "30";
        }

        private static void ApplyCors(IConfiguration configuration)
        {
            configuration["AllowedOrigins"] =
                Environment.GetEnvironmentVariable("ALLOWED_ORIGINS") ?? configuration["AllowedOrigins"] ?? "http://localhost:3000";
        }

        private static void ApplyVietQr(IConfiguration configuration)
        {
            SetFromEnv(configuration, "VietQr:BankId", "VIETQR_BANK_ID");
            SetFromEnv(configuration, "VietQr:AccountNo", "VIETQR_ACCOUNT_NO");
            SetFromEnv(configuration, "VietQr:AccountName", "VIETQR_ACCOUNT_NAME");
            configuration["VietQr:Template"] =
                Environment.GetEnvironmentVariable("VIETQR_TEMPLATE") ?? configuration["VietQr:Template"] ?? "compact2";
        }

        private static void SetFromEnv(IConfiguration configuration, string key, string envName)
        {
            configuration[key] = Environment.GetEnvironmentVariable(envName) ?? configuration[key];
        }
    }
}
