namespace GameTopUp.DAL.Database;

public sealed class TransactionManager : ITransactionManager
{
    private readonly DatabaseContext _database;

    public TransactionManager(DatabaseContext database)
    {
        _database = database;
    }

    public Task ExecuteAsync(Func<Task> action) =>
        _database.ExecuteInTransactionAsync(action);

    public Task<T> ExecuteAsync<T>(Func<Task<T>> action) =>
        _database.ExecuteInTransactionAsync(action);
}