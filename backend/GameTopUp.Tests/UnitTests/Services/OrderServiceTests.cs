using FluentAssertions;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services.Orders;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.DAL.Interfaces.Orders;
using Moq;

namespace GameTopUp.Tests.UnitTests.Services;

public class OrderServiceTests
{
    private readonly Mock<IOrderRepository> _orderRepository = new();
    private readonly Mock<IOrderHistoryRepository> _historyRepository = new();
    private readonly OrderService _service;

    public OrderServiceTests()
    {
        _service = new OrderService(_orderRepository.Object, _historyRepository.Object);
    }

    [Fact]
    public void PickOrder_ShouldMovePendingOrderToProcessing()
    {
        var order = Order.Create(7, 44, 199m, "package", "account");
        order.Id = 88;

        var history = _service.PickOrder(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        }, 80m);

        order.Status.Should().Be(OrderStatus.Processing);
        order.AssignedTo.Should().Be(3);
        order.AssignedAt.Should().NotBeNull();
        order.PackageCost.Should().Be(80m);
        history.Should().NotBeNull();
        history.OrderId.Should().Be(88);
        history.FromStatus.Should().Be(OrderStatus.Pending);
        history.ToStatus.Should().Be(OrderStatus.Processing);
        history.ActionBy.Should().Be(3);
        history.Note.Should().BeNull();
    }

    [Fact]
    public void PickOrder_ShouldThrow_WhenOrderIsAlreadyProcessing()
    {
        var order = Order.Create(7, 44, 199m, "package", "account", OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 99;

        Action act = () => _service.PickOrder(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        }, 80m);

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.OrderAlreadyAssigned);
    }

    [Fact]
    public void PickOrder_ShouldThrow_WhenOrderIsNotPendingOrProcessing()
    {
        var order = Order.Create(7, 44, 199m, "package", "account", OrderStatus.Completed);
        order.Id = 88;

        Action act = () => _service.PickOrder(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        }, 80m);

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.OrderNotReadyForPick);
    }

    [Fact]
    public void CompleteOrder_ShouldCompleteOrderAssignedToCurrentAdmin()
    {
        var order = Order.Create(7, 44, 199m, "package", "account", OrderStatus.Processing);
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
        history.Note.Should().BeNull();
    }

    [Fact]
    public void CompleteOrder_ShouldThrow_WhenOrderIsAssignedToAnotherAdmin()
    {
        var order = Order.Create(7, 44, 199m, "package", "account", OrderStatus.Processing);
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
        var order = Order.Create(7, 44, 199m, "package", "account", OrderStatus.Pending);
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
        var order = Order.Create(7, 44, 199m, "package", "account", OrderStatus.Pending);
        order.Id = 88;

        var history = _service.CancelOrder(order, new UserContext { UserId = 7 }, "changed my mind");

        order.Status.Should().Be(OrderStatus.Cancelled);
        history.Should().NotBeNull();
        history.FromStatus.Should().Be(OrderStatus.Pending);
        history.ToStatus.Should().Be(OrderStatus.Cancelled);
        history.ActionBy.Should().Be(7);
        history.Note.Should().Be("changed my mind");
    }

    [Fact]
    public void CancelOrder_ShouldThrow_WhenMemberTriesToCancelAnotherUsersPendingOrder()
    {
        var order = Order.Create(8, 44, 199m, "package", "account", OrderStatus.Pending);
        order.Id = 88;

        Action act = () => _service.CancelOrder(order, new UserContext { UserId = 7 });

        act.Should().Throw<ForbiddenException>()
            .Where(ex => ex.ErrorCode == ErrorCode.CannotModifyOthersOrder);
    }

    [Fact]
    public void CancelOrder_ShouldAllowAdminToCancelPendingOrder()
    {
        var order = Order.Create(7, 44, 199m, "package", "account", OrderStatus.Pending);
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
        history.Note.Should().BeNull();
    }

    [Fact]
    public void CancelOrder_ShouldAllowAssignedAdminToCancelProcessingOrderAndRecordReason()
    {
        var order = Order.Create(7, 44, 199m, "package", "account", OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 3;

        var history = _service.CancelOrder(order, new UserContext
        {
            UserId = 3,
            Role = UserRole.Admin
        }, "cannot fulfill");

        order.Status.Should().Be(OrderStatus.Cancelled);
        history.FromStatus.Should().Be(OrderStatus.Processing);
        history.ToStatus.Should().Be(OrderStatus.Cancelled);
        history.ActionBy.Should().Be(3);
        history.Note.Should().Be("cannot fulfill");
    }

    [Fact]
    public void CancelOrder_ShouldThrow_WhenMemberTriesToCancelProcessingOrder()
    {
        var order = Order.Create(7, 44, 199m, "package", "account", OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 3;

        Action act = () => _service.CancelOrder(order, new UserContext { UserId = 7 });

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.OrderCannotBeCancelled);
    }

    [Fact]
    public void CancelOrder_ShouldThrow_WhenCompletedOrderIsCancelled()
    {
        var order = Order.Create(7, 44, 199m, "package", "account", OrderStatus.Completed);
        order.Id = 88;
        order.AssignedTo = 3;

        Action act = () => _service.CancelOrder(order, new UserContext { UserId = 7 });

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.OrderCannotBeCancelled);
    }

    [Fact]
    public void CancelOrder_ShouldThrow_WhenAdminTriesToCancelSomeoneElsesProcessingOrder()
    {
        var order = Order.Create(7, 44, 199m, "package", "account", OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 99;

        Action act = () => _service.CancelOrder(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.CannotModifyOthersOrder);
    }

    [Fact]
    public async Task LockByIdOrThrowAsync_ShouldThrow_WhenOrderDoesNotExist()
    {
        _orderRepository.Setup(repo => repo.GetWithLockByIdAsync(88))
            .ReturnsAsync((Order?)null);

        var act = async () => await _service.LockByIdOrThrowAsync(88);

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.OrderNotFound);
    }

}
