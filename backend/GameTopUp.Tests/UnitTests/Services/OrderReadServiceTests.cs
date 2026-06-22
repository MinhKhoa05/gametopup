using FluentAssertions;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services.Orders;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.DAL.Interfaces.Orders;
using GameTopUp.DAL.Queries.Orders;
using Microsoft.Data.Sqlite;
using Moq;

namespace GameTopUp.Tests.UnitTests.Services;

public class OrderReadServiceTests : IDisposable
{
    private readonly Mock<IOrderRepository> _orderRepository = new();
    private readonly Mock<IOrderHistoryRepository> _historyRepository = new();
    private readonly DatabaseContext _database;
    private readonly OrderReadService _service;

    public OrderReadServiceTests()
    {
        _database = CreateDatabaseContext();
        _service = new OrderReadService(_orderRepository.Object, _historyRepository.Object, new OrderQuery(_database));
    }

    [Fact]
    public async Task GetOrderDetailAsync_ShouldReturnOwnOrderAndHistories()
    {
        var expected = Order.Create(7, 44, 199m, "package", "account");
        expected.Id = 88;
        var histories = new List<OrderHistory>
        {
            OrderHistory.Create(88, OrderStatus.Pending, OrderStatus.Pending, 7)
        };
        _orderRepository.Setup(repo => repo.GetByIdAsync(88))
            .ReturnsAsync(expected);
        _historyRepository.Setup(repo => repo.GetByOrderIdAsync(88))
            .ReturnsAsync(histories);

        var detail = await _service.GetOrderDetailAsync(new UserContext { UserId = 7 }, 88);

        detail.Order.Id.Should().Be(expected.Id);
        detail.Histories.Should().HaveCount(1);
        detail.Histories[0].OrderId.Should().Be(88);
    }

    [Fact]
    public async Task GetOrderDetailAsync_ShouldThrowForbidden_WhenOrderBelongsToAnotherUser()
    {
        var existing = Order.Create(8, 44, 199m, "package", "account");
        existing.Id = 88;
        _orderRepository.Setup(repo => repo.GetByIdAsync(88))
            .ReturnsAsync(existing);

        var act = async () => await _service.GetOrderDetailAsync(new UserContext { UserId = 7 }, 88);

        await act.Should().ThrowAsync<ForbiddenException>()
            .Where(ex => ex.ErrorCode == ErrorCode.CannotModifyOthersOrder);
    }

    [Fact]
    public async Task GetOrderDetailAsync_ShouldAllowAdminToAccessAnyOrder()
    {
        var expected = Order.Create(8, 44, 199m, "package", "account");
        expected.Id = 88;
        var histories = new List<OrderHistory>
        {
            OrderHistory.Create(88, OrderStatus.Pending, OrderStatus.Pending, 8)
        };
        _orderRepository.Setup(repo => repo.GetByIdAsync(88))
            .ReturnsAsync(expected);
        _historyRepository.Setup(repo => repo.GetByOrderIdAsync(88))
            .ReturnsAsync(histories);

        var detail = await _service.GetOrderDetailAsync(new UserContext
        {
            UserId = 3,
            Role = UserRole.Admin
        }, 88);

        detail.Order.Id.Should().Be(expected.Id);
        detail.Histories.Should().HaveCount(1);
        detail.Histories[0].OrderId.Should().Be(88);
    }

    private static DatabaseContext CreateDatabaseContext()
    {
        var connection = new SqliteConnection("Data Source=:memory:");
        connection.Open();
        return new DatabaseContext(connection);
    }

    public void Dispose()
    {
        _database.Dispose();
    }
}
