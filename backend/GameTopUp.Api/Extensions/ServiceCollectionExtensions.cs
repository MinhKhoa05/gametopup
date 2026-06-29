using GameTopUp.BLL.Options;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.Services.Orders;
using GameTopUp.BLL.Services.Auth;
using GameTopUp.BLL.Services.Games;
using GameTopUp.BLL.Services.Users;
using GameTopUp.BLL.Services.Wallets;
using GameTopUp.BLL.Services.Images;
using GameTopUp.BLL.UseCases;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Interfaces;
using GameTopUp.DAL.Repositories;
using GameTopUp.DAL.Queries;

namespace GameTopUp.Api.Extensions;

public static class ServiceCollectionExtensions
{
    internal const string ReactAppCorsPolicy = "AllowReactApp";

    public static IServiceCollection AddGameTopUpOptions(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<JwtSettings>()
            .Bind(configuration.GetSection("Jwt"))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<VietQrSettings>()
            .Bind(configuration.GetSection("VietQr"))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        return services;
    }

    public static IServiceCollection AddGameTopUpCors(this IServiceCollection services, IConfiguration configuration)
    {
        var allowedOrigins = configuration.GetAllowedOrigins();

        services.AddCors(options =>
        {
            options.AddPolicy(ReactAppCorsPolicy, policy =>
            {
                policy.WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        return services;
    }

    public static IServiceCollection AddGameTopUpDatabase(this IServiceCollection services)
    {
        services.AddScoped<DatabaseContext>(sp =>
        {
            var configuration = sp.GetRequiredService<IConfiguration>();
            var connectionString = configuration.GetConnectionString("Default");
            return new DatabaseContext(new MySqlConnector.MySqlConnection(connectionString));
        });

        services.AddScoped<ITransactionManager, TransactionManager>();

        return services;
    }

    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IGameRepository, GameRepository>();
        services.AddScoped<IPackageRepository, PackageRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IOrderHistoryRepository, OrderHistoryRepository>();
        services.AddScoped<IWalletRepository, WalletRepository>();
        services.AddScoped<IWalletTransactionRepository, WalletTransactionRepository>();
        services.AddScoped<IWalletDepositRepository, WalletDepositRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

        return services;
    }

    public static IServiceCollection AddBusinessServices(this IServiceCollection services)
    {
        services.AddScoped<UserService>();
        services.AddScoped<GameService>();
        services.AddScoped<GameReadService>();
        services.AddScoped<GameQuery>();
        services.AddScoped<PackageService>();
        services.AddScoped<OrderService>();
        services.AddScoped<OrderReadService>();
        services.AddScoped<PasswordService>();
        services.AddScoped<TokenService>();
        services.AddScoped<RefreshTokenService>();
        services.AddScoped<WalletService>();
        services.AddScoped<WalletDepositService>();
        services.AddScoped<OrderQuery>();

        return services;
    }

    public static IServiceCollection AddUseCases(this IServiceCollection services)
    {
        services.AddScoped<AuthUseCase>();
        services.AddScoped<OrderUseCase>();
        services.AddScoped<WalletDepositUseCase>();
        return services;
    }

    public static IServiceCollection AddCommonServices(this IServiceCollection services)
    {
        services.AddScoped<IImageStorageService, LocalImageStorageService>();
        return services;
    }
}
