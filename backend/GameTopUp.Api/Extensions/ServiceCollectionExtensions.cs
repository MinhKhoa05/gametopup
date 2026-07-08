using GameTopUp.BLL.Options;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.Services.Orders;
using GameTopUp.BLL.Services.Auth;
using GameTopUp.BLL.Services.Dashboard;
using GameTopUp.BLL.Services.Games;
using GameTopUp.BLL.Services.Notifications;
using GameTopUp.BLL.Services.Users;
using GameTopUp.BLL.Services.Wallets;
using GameTopUp.BLL.Services.Images;
using GameTopUp.BLL.Services.Emails;
using GameTopUp.BLL.UseCases;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Interfaces;
using GameTopUp.DAL.Repositories;
using GameTopUp.DAL.Queries;
using Microsoft.Extensions.Options;

namespace GameTopUp.Api.Extensions;

public static class ServiceCollectionExtensions
{
    internal const string CorsPolicyName = "AllowReactApp";

    public static IServiceCollection AddApplicationOptions(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<AppOptions>()
            .Bind(configuration.GetSection("App"))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<CorsOptions>()
            .Bind(configuration.GetSection("Cors"))
            .ValidateOnStart();

        services.AddOptions<JwtOptions>()
            .Bind(configuration.GetSection("Jwt"))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<VietQrOptions>()
            .Bind(configuration.GetSection("VietQr"))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<EmailOptions>()
            .Bind(configuration.GetSection("Email"))
            .ValidateDataAnnotations();

        return services;
    }

    public static IServiceCollection AddCorsPolicy(this IServiceCollection services, IConfiguration configuration)
    {
        var corsOptions = configuration.GetSection("Cors").Get<CorsOptions>() ?? new CorsOptions();

        services.AddCors(options =>
        {
            options.AddPolicy(CorsPolicyName, policy =>
            {
                policy.WithOrigins(corsOptions.AllowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        return services;
    }

    public static IServiceCollection AddDatabase(this IServiceCollection services)
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
        services.AddScoped<INotificationRepository, NotificationRepository>();

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
        services.AddScoped<AdminDashboardService>();
        services.AddScoped<PasswordService>();
        services.AddScoped<TokenService>();
        services.AddScoped<RefreshTokenService>();
        services.AddScoped<WalletService>();
        services.AddScoped<WalletReadService>();
        services.AddScoped<WalletDepositService>();
        services.AddScoped<NotificationService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<OrderQuery>();
        services.AddScoped<AdminDashboardQuery>();
        services.AddScoped<WalletQuery>();

        services.AddScoped<IImageStorageService, LocalImageStorageService>();
        services.AddSingleton(sp =>
        {
            var appOptions = sp.GetRequiredService<IOptions<AppOptions>>().Value;
            return new PublicImageUrlBuilder(appOptions.BaseUrl);
        });

        return services;
    }

    public static IServiceCollection AddUseCases(this IServiceCollection services)
    {
        services.AddScoped<AuthUseCase>();
        services.AddScoped<OrderUseCase>();
        services.AddScoped<WalletDepositUseCase>();
        return services;
    }

}
