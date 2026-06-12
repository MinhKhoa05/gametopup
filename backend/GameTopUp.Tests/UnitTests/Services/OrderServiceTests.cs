using FluentAssertions;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Entities.Orders;
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
    public async Task CreateOrderAsync_ShouldThrow_WhenPendingOrderAlreadyExists()
    {
        _orderRepository
            .Setup(repo => repo.HasPendingOrderAsync(7))
            .ReturnsAsync(true);

        var act = async () => await _service.CreateOrderAsync(
            new UserContext { UserId = 7 },
            new GamePackage { Id = 1, SalePrice = 1000 },
            1,
            "IGN#123");

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.PendingOrderExists);
    }

    [Fact]
    public async Task PickOrderAsync_ShouldAssignAdminAndWriteHistory()
    {
        var order = new Order { Id = 11, UserId = 7, Status = OrderStatus.Paid };
        _historyRepository
            .Setup(repo => repo.CreateAsync(It.IsAny<OrderHistory>()))
            .ReturnsAsync(1);
        _orderRepository
            .Setup(repo => repo.UpdateAsync(It.IsAny<Order>()))
            .ReturnsAsync(true);

        var result = await _service.PickOrderAsync(order, new UserContext { UserId = 99, DisplayName = "Admin", Role = GameTopUp.DAL.Entities.Users.UserRole.Admin });

        result.Changed.Should().BeTrue();
        order.Status.Should().Be(OrderStatus.Processing);
        order.AssignedTo.Should().Be(99);
    }

    [Fact]
    public async Task CancelOrderAsync_ShouldForbidCustomerWhenProcessing()
    {
        var order = new Order { Id = 11, UserId = 7, Status = OrderStatus.Processing, AssignedTo = 99 };

        var act = async () => await _service.CancelOrderAsync(order, new UserContext { UserId = 7 });

        await act.Should().ThrowAsync<ForbiddenException>()
            .Where(ex => ex.ErrorCode == ErrorCode.ProcessingOrderCannotBeCancelled);
    }

    [Fact]
    public void ValidateForPayment_ShouldReturnFalse_WhenOrderIsAlreadyPaid()
    {
        var order = new Order { Id = 11, UserId = 7, Status = OrderStatus.Paid };

        var canPay = _service.ValidateForPayment(order, new UserContext { UserId = 7 });

        canPay.Should().BeFalse();
    }
}
