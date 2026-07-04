using System.Net;
using FluentAssertions;
using GameTopUp.DAL.Entities;
using GameTopUp.IntegrationTests.Extensions;
using GameTopUp.IntegrationTests.Infrastructure;

namespace GameTopUp.IntegrationTests.Scenarios.ConcurrencyTests;

[Collection("Integration")]
public sealed class WalletDepositConcurrencyTests : BaseIntegrationTest
{
    public WalletDepositConcurrencyTests(CustomWebApplicationFactory factory)
        : base(factory)
    {
    }

    [Fact]
    public async Task ConcurrentApproveDeposit_ShouldCreditWalletOnlyOnce()
    {
        // Arrange
        const decimal depositAmount = 100_000m;
        var user = await Factory.SeedUserAsync();

        await Factory.SeedWalletAsync(user.Id, wallet =>
        {
            wallet.Balance = 50_000m;
        });

        var deposit = await Factory.SeedWalletDepositAsync(user.Id, request =>
        {
            request.Amount = depositAmount;
            request.Status = WalletDepositStatus.UserConfirmed;
        });

        var adminA = await Factory.SeedAdminAsync();
        var adminB = await Factory.SeedAdminAsync();

        using var clientA = CreateHeaderAuthenticatedClient(adminA);
        using var clientB = CreateHeaderAuthenticatedClient(adminB);

        // Act
        var approveTaskA = clientA.PostAsync($"/api/admin/deposits/{deposit.Id}/approve", null);
        var approveTaskB = clientB.PostAsync($"/api/admin/deposits/{deposit.Id}/approve", null);

        var responses = await Task.WhenAll(approveTaskA, approveTaskB);

        // Assert
        responses.Should().OnlyContain(response => response.IsSuccessStatusCode);

        var updatedDeposit = await Factory.GetWalletDepositAsync(deposit.Id);
        updatedDeposit!.Status.Should().Be(WalletDepositStatus.Approved);
        updatedDeposit.ReviewedBy.Should().BeOneOf(adminA.Id, adminB.Id);
        updatedDeposit.ReviewedAt.Should().NotBeNull();

        var wallet = await Factory.GetWalletAsync(user.Id);
        wallet!.Balance.Should().Be(150_000m);

        var transactions = await Factory.GetWalletTransactionsAsync(user.Id);
        var transaction = transactions.Should().ContainSingle().Subject;
        transaction.Type.Should().Be(WalletTransactionType.Deposit);
        transaction.Amount.Should().Be(depositAmount);
        transaction.ReferenceId.Should().Be(deposit.Code);
    }

    [Fact]
    public async Task ConcurrentApproveAndRejectDeposit_ShouldAllowOnlyOneFinalReview()
    {
        // Arrange
        const decimal depositAmount = 100_000m;
        var user = await Factory.SeedUserAsync();

        await Factory.SeedWalletAsync(user.Id, wallet =>
        {
            wallet.Balance = 25_000m;
        });

        var deposit = await Factory.SeedWalletDepositAsync(user.Id, request =>
        {
            request.Amount = depositAmount;
            request.Status = WalletDepositStatus.UserConfirmed;
        });

        var adminA = await Factory.SeedAdminAsync();
        var adminB = await Factory.SeedAdminAsync();

        using var approveClient = CreateHeaderAuthenticatedClient(adminA);
        using var rejectClient = CreateHeaderAuthenticatedClient(adminB);

        // Act
        var approveTask = approveClient.PostAsync($"/api/admin/deposits/{deposit.Id}/approve", null);
        var rejectTask = rejectClient.PostAsync($"/api/admin/deposits/{deposit.Id}/reject", null);

        var approveResponse = await approveTask;
        var rejectResponse = await rejectTask;

        // Assert
        new[] { approveResponse, rejectResponse }
            .Count(response => response.IsSuccessStatusCode)
            .Should()
            .Be(1);

        new[] { approveResponse, rejectResponse }
            .Count(response => response.StatusCode == HttpStatusCode.BadRequest)
            .Should()
            .Be(1);

        var updatedDeposit = await Factory.GetWalletDepositAsync(deposit.Id);
        updatedDeposit!.Status.Should().BeOneOf(WalletDepositStatus.Approved, WalletDepositStatus.Rejected);
        updatedDeposit.ReviewedAt.Should().NotBeNull();

        var wallet = await Factory.GetWalletAsync(user.Id);

        var transactions = await Factory.GetWalletTransactionsAsync(user.Id);

        if (updatedDeposit.Status == WalletDepositStatus.Approved)
        {
            approveResponse.IsSuccessStatusCode.Should().BeTrue();
            rejectResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            updatedDeposit.ReviewedBy.Should().Be(adminA.Id);
            wallet!.Balance.Should().Be(125_000m);
            transactions.Should().ContainSingle(transaction =>
                transaction.Type == WalletTransactionType.Deposit &&
                transaction.Amount == depositAmount &&
                transaction.ReferenceId == deposit.Code);
        }
        else
        {
            rejectResponse.IsSuccessStatusCode.Should().BeTrue();
            approveResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            updatedDeposit.ReviewedBy.Should().Be(adminB.Id);
            wallet!.Balance.Should().Be(25_000m);
            transactions.Should().BeEmpty();
        }
    }
}
