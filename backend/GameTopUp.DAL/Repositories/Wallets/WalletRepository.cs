using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.DAL.Interfaces.Wallets;

namespace GameTopUp.DAL.Repositories.Wallets;

public sealed class WalletRepository : IWalletRepository
{
    private readonly DatabaseContext _database;

    public WalletRepository(DatabaseContext database)
    {
        _database = database;
    }

    public Task<Wallet?> GetByUserIdAsync(long userId) =>
        _database.QueryFirstOrDefaultAsync<Wallet>("SELECT * FROM wallets WHERE user_id = @UserId", new { UserId = userId });

    public Task<Wallet?> GetWithLockByUserIdAsync(long userId) =>
        _database.QueryFirstOrDefaultAsync<Wallet>("SELECT * FROM wallets WHERE user_id = @UserId FOR UPDATE", new { UserId = userId });

    public Task UpsertWalletAsync(Wallet wallet) =>
        _database.ExecuteAsync(
            @"INSERT INTO wallets (user_id, balance, created_at, updated_at)
              VALUES (@UserId, @Balance, @CreatedAt, @UpdatedAt)
              ON DUPLICATE KEY UPDATE user_id = user_id;",
            wallet);

    public Task<int> UpdateBalanceAsync(long walletId, decimal newBalance) =>
        _database.ExecuteAsync(
            "UPDATE wallets SET balance = @Balance, updated_at = @UpdatedAt WHERE id = @Id",
            new { Id = walletId, Balance = newBalance, UpdatedAt = DateTime.UtcNow });
}
