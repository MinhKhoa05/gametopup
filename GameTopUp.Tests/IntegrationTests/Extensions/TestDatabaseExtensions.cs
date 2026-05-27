using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;

namespace GameTopUp.Tests.IntegrationTests.Infrastructure
{
    /// <summary>
    /// Helper cho test database: seed + query nhanh trong integration test.
    /// </summary>
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

        private static async Task WithDb(
            this CustomWebApplicationFactory<Program> factory,
            Func<DatabaseContext, Task> action)
        {
            using var scope = factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
            await action(db);
        }

        #endregion

        #region SEED

        public static async Task<User> SeedUserAsync(
            this CustomWebApplicationFactory<Program> factory,
            string username,
            Action<User>? customize = null)
        {
            var user = new User
            {
                Username = username,
                Email = $"{username}@test.com",
                PasswordHash = "hash",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

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
            decimal balance,
            Action<Wallet>? customize = null)
        {
            var wallet = new Wallet
            {
                UserId = userId,
                Balance = balance,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            customize?.Invoke(wallet);

            return await factory.WithDb(async db =>
            {
                await db.InsertAsync<Wallet, long>(wallet);
                return wallet;
            });
        }

        public static async Task<Game> SeedGameAsync(
            this CustomWebApplicationFactory<Program> factory,
            string name,
            Action<Game>? customize = null)
        {
            var game = new Game
            {
                Name = name,
                IsActive = true
            };

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
            string name,
            Action<GamePackage>? customize = null)
        {
            var package = new GamePackage
            {
                GameId = gameId,
                Name = name,
                NormalizedName = name.ToLower(),
                SalePrice = 100,
                OriginalPrice = 100,
                ImportPrice = 100,
                IsActive = true,
                StockQuantity = 0
            };

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
            Action<Order>? customize = null)
        {
            var order = new Order
            {
                UserId = userId,
                GamePackageId = packageId,
                UnitPrice = 100,
                Quantity = 1,
                GameAccountInfo = "test_acc",
                Status = OrderStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

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
    }
}