using FluentAssertions;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services.Orders;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
using Moq;

namespace GameTopUp.UnitTests.Services;

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
        var order = CreateOrder();
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
        var order = CreateOrder(OrderStatus.Processing);
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
        var order = CreateOrder(OrderStatus.Completed);
        order.Id = 88;

        Action act = () => _service.PickOrder(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        }, 80m);

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InvalidOrderStatus);
    }

    [Fact]
    public void CompleteOrder_ShouldCompleteOrderAssignedToCurrentAdmin()
    {
        var order = CreateOrder(OrderStatus.Processing);
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
        var order = CreateOrder(OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 99;

        Action act = () => _service.CompleteOrder(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.Forbidden);
    }

    [Fact]
    public void CompleteOrder_ShouldThrow_WhenOrderIsNotProcessing()
    {
        var order = CreateOrder(OrderStatus.Pending);
        order.Id = 88;

        Action act = () => _service.CompleteOrder(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InvalidOrderStatus);
    }

    [Fact]
    public void CancelOrder_ShouldAllowMemberToCancelPendingOrderAndRecordReason()
    {
        var order = CreateOrder(OrderStatus.Pending);
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
        var order = CreateOrder(OrderStatus.Pending, userId: 8);
        order.Id = 88;

        Action act = () => _service.CancelOrder(order, new UserContext { UserId = 7 });

        act.Should().Throw<ForbiddenException>()
            .Where(ex => ex.ErrorCode == ErrorCode.Forbidden);
    }

    [Fact]
    public void CancelOrder_ShouldAllowAdminToCancelPendingOrder()
    {
        var order = CreateOrder(OrderStatus.Pending);
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
        var order = CreateOrder(OrderStatus.Processing);
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
        var order = CreateOrder(OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 3;

        Action act = () => _service.CancelOrder(order, new UserContext { UserId = 7 });

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InvalidOrderStatus);
    }

    [Fact]
    public void CancelOrder_ShouldThrow_WhenCompletedOrderIsCancelled()
    {
        var order = CreateOrder(OrderStatus.Completed);
        order.Id = 88;
        order.AssignedTo = 3;

        Action act = () => _service.CancelOrder(order, new UserContext { UserId = 7 });

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InvalidOrderStatus);
    }

    [Fact]
    public void CancelOrder_ShouldThrow_WhenAdminTriesToCancelSomeoneElsesProcessingOrder()
    {
        var order = CreateOrder(OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 99;

        Action act = () => _service.CancelOrder(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        act.Should().Throw<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.Forbidden);
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

    private static Order CreateOrder(OrderStatus status = OrderStatus.Pending, long userId = 7)
    {
        var now = DateTimeOffset.UtcNow;
        return new Order
        {
            UserId = userId,
            PackageId = 44,
            PackagePrice = 199m,
            PackageName = "package",
            PackageCost = 0m,
            GameAccountInfo = "account",
            Status = status,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

}
