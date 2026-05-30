using System;
using System.Threading.Tasks;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using Microsoft.Extensions.DependencyInjection;

namespace GameTopUp.Tests.IntegrationTests.Infrastructure
{
    public static class TestDatabaseExtensions
    {
        #region DB EXECUTION

        private static async Task<T> WithDb<T>(
            this CustomWebApplicationFactory<Program> factory,
            Func<DatabaseContext, Task<T>> action)
        {
            using var scope = factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
            return await action(db);
        }

        #endregion

        #region SEED

        public static async Task<User> SeedUserAsync(
            this CustomWebApplicationFactory<Program> factory,
            UserRole role = UserRole.Member,
            Action<User>? customize = null)
        {
            var uniqueCode = UniqueCode();

            var user = User.Create($"Test User {uniqueCode}", $"test_user_{uniqueCode}@test.local", "hash", role);

            customize?.Invoke(user);

            return await factory.WithDb(async db =>
            {
                user.Id = await db.InsertAsync<User, long>(user);
                return user;
            });
        }

        public static async Task<Wallet> SeedWalletAsync(
            this CustomWebApplicationFactory<Program> factory,
            long userId,
            decimal initialBalance = 0,
            Action<Wallet>? customize = null)
        {
            var wallet = Wallet.CreateForUser(userId, initialBalance);

            customize?.Invoke(wallet);

            return await factory.WithDb(async db =>
            {
                wallet.Id = await db.InsertAsync<Wallet, long>(wallet);
                return wallet;
            });
        }

        public static async Task<Game> SeedGameAsync(
            this CustomWebApplicationFactory<Program> factory,
            Action<Game>? customize = null)
        {
            var game = Game.Create($"Test Game {UniqueCode()}");

            customize?.Invoke(game);

            return await factory.WithDb(async db =>
            {
                game.Id = await db.InsertAsync<Game, long>(game);
                return game;
            });
        }

        public static async Task<GamePackage> SeedGamePackageAsync(
            this CustomWebApplicationFactory<Program> factory,
            long gameId,
            decimal salePrice = 100,
            int initialStock = 0,
            Action<GamePackage>? customize = null)
        {
            var package = GamePackage.Create(
                $"Test Package {UniqueCode()}",
                gameId,
                salePrice,
                salePrice,
                salePrice,
                stockQuantity: initialStock);

            customize?.Invoke(package);

            return await factory.WithDb(async db =>
            {
                package.Id = await db.InsertAsync<GamePackage, long>(package);
                return package;
            });
        }

        public static async Task<Order> SeedOrderAsync(
            this CustomWebApplicationFactory<Program> factory,
            long userId,
            long packageId,
            OrderStatus status = OrderStatus.Pending,
            int quantity = 1,
            decimal packageSalePrice = 100, // 
            Action<Order>? customize = null)
        {

            var order = Order.Create(userId, packageId, packageSalePrice, quantity, $"test_acc_{UniqueCode()}");
            order.Status = status;

            customize?.Invoke(order);

            return await factory.WithDb(async db =>
            {
                order.Id = await db.InsertAsync<Order, long>(order);
                return order;
            });
        }

        #endregion

        #region QUERY

        public static Task<Order?> GetOrderAsync(this CustomWebApplicationFactory<Program> factory, long id)
            => factory.WithDb(db => db.GetByIdAsync<Order>(id));

        public static Task<User?> GetUserAsync(this CustomWebApplicationFactory<Program> factory, long id)
            => factory.WithDb(db => db.GetByIdAsync<User>(id));

        public static Task<Wallet?> GetWalletAsync(this CustomWebApplicationFactory<Program> factory, long userId)
            => factory.WithDb(db =>
                db.QueryFirstAsync<Wallet>(
                    "SELECT * FROM wallets WHERE user_id = @UserId",
                    new { UserId = userId }));

        public static Task<int> GetOrderHistoryCountAsync(this CustomWebApplicationFactory<Program> factory, long orderId)
            => factory.WithDb(db =>
                db.ScalarAsync<int>(
                    "SELECT COUNT(*) FROM order_history WHERE order_id = @OrderId",
                    new { OrderId = orderId }));

        public static Task<GamePackage?> GetPackageAsync(this CustomWebApplicationFactory<Program> factory, long id)
            => factory.WithDb(db => db.GetByIdAsync<GamePackage>(id));

        #endregion

        private static string UniqueCode() => Guid.NewGuid().ToString("N")[..10];
    }
}
