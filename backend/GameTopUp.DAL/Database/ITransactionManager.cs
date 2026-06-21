namespace GameTopUp.DAL.Database;

public interface ITransactionManager
{
    Task ExecuteAsync(Func<Task> action);
    Task<T> ExecuteAsync<T>(Func<Task<T>> action);
}