using FluentAssertions;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.DAL.Interfaces.Orders;
using GameTopUp.DAL.Queries.Orders;
using GameTopUp.DAL.Database;
using Microsoft.Data.Sqlite;
using Moq;

namespace GameTopUp.Tests.UnitTests.Services;

public class OrderServiceTests : IDisposable
{
    private readonly Mock<IOrderRepository> _orderRepository = new();
    private readonly Mock<IOrderHistoryRepository> _historyRepository = new();
    private readonly DatabaseContext _database;
    private readonly OrderQuery _orderQuery;
    private readonly OrderService _service;

    public OrderServiceTests()
    {
        _database = CreateDatabaseContext();
        _orderQuery = new OrderQuery(_database);
        _service = new OrderService(_orderRepository.Object, _historyRepository.Object, _orderQuery);
    }

    [Fact]
    public void PickOrder_ShouldMovePendingOrderToProcessing()
    {
        var order = Order.Create(7, 44, 199m, "account");
        order.Id = 88;

        var history = _service.PickOrder(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        order.Status.Should().Be(OrderStatus.Processing);
        order.AssignedTo.Should().Be(3);
        order.AssignedAt.Should().NotBeNull();
        history.Should().NotBeNull();
        history.OrderId.Should().Be(88);
        history.FromStatus.Should().Be(OrderStatus.Pending);
        history.ToStatus.Should().Be(OrderStatus.Processing);
        history.ActionBy.Should().Be(3);
        history.Note.Should().Be("Admin Admin picked the order.");
    }

    [Fact]
    public void PickOrder_ShouldThrow_WhenProcessingOrderIsAlreadyAssignedToAnotherAdmin()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 99;

        Action act = () => _service.PickOrder(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.OrderAlreadyAssigned);
    }

    [Fact]
    public void PickOrder_ShouldThrow_WhenOrderIsNotPendingOrProcessing()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Completed);
        order.Id = 88;

        Action act = () => _service.PickOrder(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.OrderNotReadyForPick);
    }

    [Fact]
    public void CompleteOrder_ShouldCompleteOrderAssignedToCurrentAdmin()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 3;

        var history = _service.CompleteOrder(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        order.Status.Should().Be(OrderStatus.Completed);
        history.Should().NotBeNull();
        history.FromStatus.Should().Be(OrderStatus.Processing);
        history.ToStatus.Should().Be(OrderStatus.Completed);
        history.ActionBy.Should().Be(3);
        history.Note.Should().Be("Admin Admin completed the order.");
    }

    [Fact]
    public void CompleteOrder_ShouldThrow_WhenOrderIsAssignedToAnotherAdmin()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 99;

        Action act = () => _service.CompleteOrder(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.CannotModifyOthersOrder);
    }

    [Fact]
    public void CompleteOrder_ShouldThrow_WhenOrderIsNotProcessing()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Pending);
        order.Id = 88;

        Action act = () => _service.CompleteOrder(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.OrderStatusInvalidToComplete);
    }

    [Fact]
    public void CancelOrder_ShouldAllowMemberToCancelPendingOrderAndRecordReason()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Pending);
        order.Id = 88;

        var history = _service.CancelOrder(order, new UserContext { UserId = 7 });

        order.Status.Should().Be(OrderStatus.Cancelled);
        history.Should().NotBeNull();
        history.FromStatus.Should().Be(OrderStatus.Pending);
        history.ToStatus.Should().Be(OrderStatus.Cancelled);
        history.ActionBy.Should().Be(7);
        history.Note.Should().Be("Order cancelled.");
    }

    [Fact]
    public void CancelOrder_ShouldAllowAdminToCancelPendingOrder()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Pending);
        order.Id = 88;

        var history = _service.CancelOrder(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        order.Status.Should().Be(OrderStatus.Cancelled);
        order.AssignedTo.Should().BeNull();
        history.Should().NotBeNull();
        history.FromStatus.Should().Be(OrderStatus.Pending);
        history.ToStatus.Should().Be(OrderStatus.Cancelled);
        history.ActionBy.Should().Be(3);
        history.Note.Should().Be("Order cancelled.");
    }

    [Fact]
    public void CancelOrder_ShouldThrow_WhenMemberTriesToCancelProcessingOrder()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 3;

        Action act = () => _service.CancelOrder(order, new UserContext { UserId = 7 });

        act.Should().Throw<ForbiddenException>()
            .Where(ex => ex.ErrorCode == ErrorCode.OrderCannotBeCancelled)
            .Where(ex => ex.Message == "Order cannot be cancelled.");
    }

    [Fact]
    public void CancelOrder_ShouldThrow_WhenCompletedOrderIsCancelled()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Completed);
        order.Id = 88;
        order.AssignedTo = 3;

        Action act = () => _service.CancelOrder(order, new UserContext { UserId = 7 });

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.OrderCannotBeCancelled)
            .Where(ex => ex.Message == "Order cannot be cancelled.");
    }

    [Fact]
    public void CancelOrder_ShouldThrow_WhenAdminTriesToCancelSomeoneElsesProcessingOrder()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 99;

        Action act = () => _service.CancelOrder(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        act.Should().Throw<ForbiddenException>()
            .Where(ex => ex.ErrorCode == ErrorCode.CannotModifyOthersOrder)
            .Where(ex => ex.Message == "Không thể hủy đơn hàng của người khác.");
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
