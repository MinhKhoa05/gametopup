using GameTopUp.BLL.Common;
using GameTopUp.BLL.Options;
using GameTopUp.BLL.Interfaces;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.Services.Auth;
using GameTopUp.BLL.Services.Games;
using GameTopUp.BLL.UseCases;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Interfaces.Auth;
using GameTopUp.DAL.Interfaces.Games;
using GameTopUp.DAL.Interfaces.Orders;
using GameTopUp.DAL.Interfaces.Users;
using GameTopUp.DAL.Interfaces.Wallets;
using GameTopUp.DAL.Repositories.Auth;
using GameTopUp.DAL.Repositories.Games;
using GameTopUp.DAL.Repositories.Orders;
using GameTopUp.DAL.Repositories.Users;
using GameTopUp.DAL.Repositories.Wallets;

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

        return services;
    }

    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IGameRepository, GameRepository>();
        services.AddScoped<IGamePackageRepository, GamePackageRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IOrderHistoryRepository, OrderHistoryRepository>();
        services.AddScoped<IWalletRepository, WalletRepository>();
        services.AddScoped<IWalletTransactionRepository, WalletTransactionRepository>();
        services.AddScoped<IWalletDepositRequestRepository, WalletDepositRequestRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

        return services;
    }

    public static IServiceCollection AddBusinessServices(this IServiceCollection services)
    {
        services.AddScoped<UserService>();
        services.AddScoped<GameService>();
        services.AddScoped<GamePackageService>();
        services.AddScoped<OrderService>();
        services.AddScoped<PasswordService>();
        services.AddScoped<TokenService>();
        services.AddScoped<RefreshTokenService>();
        services.AddScoped<WalletService>();
        services.AddScoped<WalletDepositRequestService>();

        return services;
    }

    public static IServiceCollection AddUseCases(this IServiceCollection services)
    {
        services.AddScoped<AuthUseCase>();
        services.AddScoped<GameUseCase>();
        services.AddScoped<GamePackageUseCase>();
        services.AddScoped<OrderUseCase>();
        services.AddScoped<WalletUseCase>();
        return services;
    }

    public static IServiceCollection AddCommonServices(this IServiceCollection services)
    {
        services.AddScoped<IImageStorageService, LocalImageStorageService>();
        return services;
    }
}
