using FluentAssertions;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Entities.Wallets;

namespace GameTopUp.Tests.UnitTests.Domain;

public class EntityBehaviorTests
{
    [Fact]
    public void OrderUpdateStatus_ShouldAssignStaffWhenProvided()
    {
        var order = Order.Create(7, 44, 199m, "game-package", "game-account");

        order.UpdateStatus(OrderStatus.Processing, 3);

        order.Status.Should().Be(OrderStatus.Processing);
        order.AssignedTo.Should().Be(3);
        order.AssignedAt.Should().NotBeNull();
    }

    [Fact]
    public void OrderMarkCompleted_ShouldKeepExistingAssignee()
    {
        var order = Order.Create(7, 44, 199m, "game-package", "game-account");
        order.MarkProcessing(3, 80m);
        var assignedAt = order.AssignedAt;

        order.MarkCompleted();

        order.Status.Should().Be(OrderStatus.Completed);
        order.AssignedTo.Should().Be(3);
        order.AssignedAt.Should().Be(assignedAt);
        order.PackageCost.Should().Be(80m);
    }

    [Fact]
    public void WalletDeposit_ShouldMoveFromPendingToUserConfirmedThenApproved()
    {
        var request = WalletDeposit.Create(7, 100000m, "GTU7", "NAP GTU7");
        var confirmedAt = DateTime.UtcNow;
        var reviewedAt = confirmedAt.AddMinutes(1);

        request.Status.Should().Be(WalletDepositStatus.Pending);

        request.MarkUserConfirmed(confirmedAt);
        request.MarkApproved(1, "ok", reviewedAt);

        request.Status.Should().Be(WalletDepositStatus.Approved);
        request.UserConfirmedAt.Should().Be(confirmedAt);
        request.ReviewedBy.Should().Be(1);
        request.ReviewedAt.Should().Be(reviewedAt);
        request.AdminNote.Should().Be("ok");
    }

    [Fact]
    public void WalletDeposit_ShouldMoveFromPendingToRejected()
    {
        var request = WalletDeposit.Create(7, 100000m, "GTU7", "NAP GTU7");
        var reviewedAt = DateTime.UtcNow;

        request.MarkRejected(2, "nope", reviewedAt);

        request.Status.Should().Be(WalletDepositStatus.Rejected);
        request.ReviewedBy.Should().Be(2);
        request.ReviewedAt.Should().Be(reviewedAt);
        request.AdminNote.Should().Be("nope");
    }
}
