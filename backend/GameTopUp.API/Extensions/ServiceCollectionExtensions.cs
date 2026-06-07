using GameTopUp.BLL.Interfaces;
using GameTopUp.BLL.Common;
using GameTopUp.BLL.Options;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.Services.Auth;
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

namespace GameTopUp.API.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddGameTopUpOptions(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
            services.Configure<VietQrSettings>(configuration.GetSection("VietQr"));

            return services;
        }

        public static IServiceCollection AddGameTopUpDatabase(this IServiceCollection services)
        {
            services.AddScoped<DatabaseContext>(sp =>
            {
                var config = sp.GetRequiredService<IConfiguration>();
                var connectionString = config.GetConnectionString("Default");
                return new DatabaseContext(new MySqlConnector.MySqlConnection(connectionString!));
            });

            return services;
        }

        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IOrderRepository, OrderRepository>();
            services.AddScoped<IOrderHistoryRepository, OrderHistoryRepository>();
            services.AddScoped<IWalletTransactionRepository, WalletTransactionRepository>();
            services.AddScoped<IWalletRepository, WalletRepository>();
            services.AddScoped<IWalletDepositRequestRepository, WalletDepositRequestRepository>();
            services.AddScoped<IGameRepository, GameRepository>();
            services.AddScoped<IGamePackageRepository, GamePackageRepository>();
            services.AddScoped<IGameAccountRepository, GameAccountRepository>();
            services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

            return services;
        }

        public static IServiceCollection AddBusinessServices(this IServiceCollection services)
        {
            services.AddScoped<UserService>();
            services.AddScoped<GameService>();
            services.AddScoped<GamePackageService>();
            services.AddScoped<OrderService>();
            services.AddScoped<WalletService>();
            services.AddScoped<WalletDepositRequestService>();
            services.AddScoped<RefreshTokenService>();
            services.AddScoped<TokenService>();
            services.AddScoped<PasswordService>();

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
}
