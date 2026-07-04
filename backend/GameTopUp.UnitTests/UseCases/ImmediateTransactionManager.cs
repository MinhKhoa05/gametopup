using GameTopUp.DAL.Database;

public sealed class ImmediateTransactionManager : ITransactionManager
{
    public Task ExecuteAsync(Func<Task> action) => action();

    public Task<T> ExecuteAsync<T>(Func<Task<T>> action) => action();
}