using System.Data;
using System.Data.Common;
using Dapper;
using Dommel;
using MySqlConnector;

namespace GameTopUp.DAL.Database;

public sealed class DatabaseContext : IAsyncDisposable, IDisposable
{
    private readonly DbConnection _connection;
    private DbTransaction? _transaction;

    static DatabaseContext()
    {
        DefaultTypeMap.MatchNamesWithUnderscores = true;
        DommelMapper.SetColumnNameResolver(new SnakeCaseResolver());
        DommelMapper.AddSqlBuilder(typeof(MySqlConnector.MySqlConnection), new Dommel.MySqlSqlBuilder());
    }

    public DatabaseContext(DbConnection connection)
    {
        _connection = connection;
    }

    public DbConnection Connection => _connection;
    public DbTransaction? Transaction => _transaction;

    public async Task EnsureOpenAsync()
    {
        if (_connection.State == ConnectionState.Open)
        {
            return;
        }

        const int maxRetries = 5;
        const int delaySeconds = 2;

        for (var attempt = 0; attempt < maxRetries; attempt++)
        {
            try
            {
                await _connection.OpenAsync();
                return;
            }
            catch
            {
                if (attempt == maxRetries - 1)
                {
                    throw;
                }

                await Task.Delay(TimeSpan.FromSeconds(delaySeconds));
            }
        }
    }

    public async Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> action)
    {
        const int maxAttempts = 3;

        if (_transaction != null)
        {
            return await action();
        }

        await EnsureOpenAsync();

        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            await using var transaction = await _connection.BeginTransactionAsync();
            _transaction = transaction;

            try
            {
                var result = await action();
                await transaction.CommitAsync();
                return result;
            }
            catch (MySqlException ex) when (IsTransientTransactionError(ex) && attempt < maxAttempts)
            {
                await transaction.RollbackAsync();
                await Task.Delay(TimeSpan.FromMilliseconds(25 * attempt));
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
            finally
            {
                _transaction = null;
            }
        }

        throw new InvalidOperationException("Transaction retry loop exited unexpectedly.");
    }

    public async Task ExecuteInTransactionAsync(Func<Task> action)
    {
        await ExecuteInTransactionAsync(async () =>
        {
            await action();
            return true;
        });
    }

    public ValueTask DisposeAsync()
    {
        _transaction?.Dispose();
        return _connection.DisposeAsync();
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _connection.Dispose();
    }

    private static bool IsTransientTransactionError(MySqlException exception)
    {
        return exception.Number is 1205 or 1213;
    }
}

public sealed class SnakeCaseResolver : IColumnNameResolver
{
    public string ResolveColumnName(System.Reflection.PropertyInfo propertyInfo)
    {
        var text = propertyInfo.Name;
        return string.Concat(text.Select((ch, index) => index > 0 && char.IsUpper(ch) ? "_" + ch : ch.ToString())).ToLowerInvariant();
    }
}
