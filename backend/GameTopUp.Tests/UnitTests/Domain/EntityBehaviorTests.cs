using FluentAssertions;
using GameTopUp.DAL.Entities.Auth;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.DAL.Entities.Wallets;

namespace GameTopUp.Tests.UnitTests.Domain;

public class EntityBehaviorTests
{
    [Fact]
    public void UserCreate_ShouldInitializeActiveUserWithTimestamps()
    {
        var before = DateTime.UtcNow;
        var user = User.Create("  Alice  ", "alice@example.com", "hash", UserRole.Admin);
        var after = DateTime.UtcNow;

        user.DisplayName.Should().Be("  Alice  ");
        user.Email.Should().Be("alice@example.com");
        user.PasswordHash.Should().Be("hash");
        user.Role.Should().Be(UserRole.Admin);
        user.IsActive.Should().BeTrue();
        user.CreatedAt.Should().BeOnOrAfter(before);
        user.CreatedAt.Should().BeOnOrBefore(after);
        user.UpdatedAt.Should().BeOnOrAfter(before);
        user.UpdatedAt.Should().BeOnOrBefore(after);
    }

    [Fact]
    public void GameCreate_ShouldTrimNameAndDefaultToActive()
    {
        var game = Game.Create("  PUBG  ", "https://cdn.test/game.png", "/games/game.png");

        game.Name.Should().Be("PUBG");
        game.ImageUrl.Should().Be("https://cdn.test/game.png");
        game.ImageRelativePath.Should().Be("/games/game.png");
        game.IsActive.Should().BeTrue();
    }

    [Fact]
    public void RefreshTokenCreate_ShouldSetExpiryRelativeToCreationTime()
    {
        var before = DateTime.UtcNow;
        var token = RefreshToken.Create(7, "HASH", TimeSpan.FromDays(7));
        var after = DateTime.UtcNow;

        token.UserId.Should().Be(7);
        token.TokenHash.Should().Be("HASH");
        token.CreatedAt.Should().BeOnOrAfter(before);
        token.CreatedAt.Should().BeOnOrBefore(after);
        token.ExpiresAt.Should().BeAfter(token.CreatedAt);
    }

    [Fact]
    public void OrderCreate_ShouldSetPendingStateAndTimestamps()
    {
        var before = DateTime.UtcNow;
        var order = Order.Create(7, 44, 199m, "game-account");
        var after = DateTime.UtcNow;

        order.UserId.Should().Be(7);
        order.GamePackageId.Should().Be(44);
        order.UnitPrice.Should().Be(199m);
        order.Total.Should().Be(199m);
        order.GameAccountInfo.Should().Be("game-account");
        order.Status.Should().Be(OrderStatus.Pending);
        order.CreatedAt.Should().BeOnOrAfter(before);
        order.CreatedAt.Should().BeOnOrBefore(after);
        order.UpdatedAt.Should().BeOnOrAfter(before);
        order.UpdatedAt.Should().BeOnOrBefore(after);
    }

    [Fact]
    public void OrderUpdateStatus_ShouldUpdateAssignedFieldsOnlyWhenProvided()
    {
        var order = Order.Create(7, 44, 199m, "game-account");
        var originalAssignedAt = order.AssignedAt;

        order.UpdateStatus(OrderStatus.Processing, 3);

        order.Status.Should().Be(OrderStatus.Processing);
        order.AssignedTo.Should().Be(3);
        order.AssignedAt.Should().NotBeNull();
        order.UpdatedAt.Should().BeAfter(order.CreatedAt);
        order.AssignedAt.Should().NotBe(originalAssignedAt);
    }

    [Fact]
    public void OrderMarkCompleted_ShouldKeepExistingAssignee()
    {
        var order = Order.Create(7, 44, 199m, "game-account");
        order.MarkProcessing(3);
        var assignedAt = order.AssignedAt;

        order.MarkCompleted();

        order.Status.Should().Be(OrderStatus.Completed);
        order.AssignedTo.Should().Be(3);
        order.AssignedAt.Should().Be(assignedAt);
    }

    [Fact]
    public void WalletCreateForUser_ShouldSeedWalletWithBalanceAndTimestamps()
    {
        var before = DateTime.UtcNow;
        var wallet = Wallet.CreateForUser(7, 250m);
        var after = DateTime.UtcNow;

        wallet.UserId.Should().Be(7);
        wallet.Balance.Should().Be(250m);
        wallet.CreatedAt.Should().BeOnOrAfter(before);
        wallet.CreatedAt.Should().BeOnOrBefore(after);
        wallet.UpdatedAt.Should().BeOnOrAfter(before);
        wallet.UpdatedAt.Should().BeOnOrBefore(after);
    }

    [Fact]
    public void WalletDepositCreate_ShouldStartPendingAndAllowTransitions()
    {
        var request = WalletDeposit.Create(7, 100000m, "GTU7", "NAP GTU7");
        var confirmedAt = DateTime.UtcNow;

        request.Status.Should().Be(WalletDepositStatus.Pending);

        request.MarkUserConfirmed(confirmedAt);
        request.Status.Should().Be(WalletDepositStatus.UserConfirmed);
        request.UserConfirmedAt.Should().Be(confirmedAt);

        request.MarkApproved(1, "ok", confirmedAt.AddMinutes(1));
        request.Status.Should().Be(WalletDepositStatus.Approved);
        request.ReviewedBy.Should().Be(1);
        request.AdminNote.Should().Be("ok");

        request.MarkRejected(2, "nope", confirmedAt.AddMinutes(2));
        request.Status.Should().Be(WalletDepositStatus.Rejected);
        request.ReviewedBy.Should().Be(2);
        request.AdminNote.Should().Be("nope");
    }
}
