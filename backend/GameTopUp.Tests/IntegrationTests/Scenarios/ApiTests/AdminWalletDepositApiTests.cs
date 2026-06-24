using System.Net;
using FluentAssertions;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.Tests.IntegrationTests.Extensions;
using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.ApiTests;

[Collection("Integration")]
public sealed class AdminWalletDepositApiTests : BaseIntegrationTest
{
    public AdminWalletDepositApiTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetDepositRequests_ShouldReturnRequestsAndFilterByStatus()
    {
        var user = await Factory.SeedUserAsync();
        var pendingDeposit = await Factory.SeedWalletDepositAsync(user.Id);

        var confirmedDeposit = await Factory.SeedWalletDepositAsync(user.Id, d =>
        {
            d.Status = WalletDepositStatus.UserConfirmed;
        });

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.GetAsync("/api/admin/deposits");

        var depositRequests = await response.ShouldBeSuccess<List<WalletDepositResponse>>();

        depositRequests.Should().Contain(item => item.Id == pendingDeposit.Id);
        depositRequests.Should().Contain(item => item.Id == confirmedDeposit.Id);

        response = await client.GetAsync($"/api/admin/deposits?status={WalletDepositStatus.Pending}");

        var filteredDepositRequests = await response.ShouldBeSuccess<List<WalletDepositResponse>>();

        filteredDepositRequests.Should().ContainSingle(item => item.Id == pendingDeposit.Id);
    }

    [Fact]
    public async Task GetDepositRequests_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var response = await Client.GetAsync("/api/admin/deposits");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetDepositRequests_ShouldReturnForbidden_WhenMember()
    {
        var member = await Factory.SeedUserAsync();

        using var client = CreateHeaderAuthenticatedClient(member);

        var response = await client.GetAsync("/api/admin/deposits");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task ApproveDepositRequest_ShouldCreditWalletAndMarkApproved()
    {
        var user = await Factory.SeedUserAsync();

        await Factory.SeedWalletAsync(user.Id, wallet => wallet.Balance = 100_000m);

        var deposit = await Factory.SeedWalletDepositAsync(user.Id, d =>
        {
            d.Amount = 100_000m;
            d.Status = WalletDepositStatus.UserConfirmed;
        });

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.PostAsync($"/api/admin/deposits/{deposit.Id}/approve", null);

        await response.ShouldBeSuccess();

        var wallet = await Factory.GetWalletAsync(user.Id);

        wallet.Should().NotBeNull();
        wallet!.Balance.Should().Be(200_000m);

        var transactions = await Factory.GetWalletTransactionsAsync(user.Id);

        transactions.Should().ContainSingle();

        transactions[0].Type.Should().Be(WalletTransactionType.Deposit);
        transactions[0].Amount.Should().Be(100_000m);
        transactions[0].ReferenceId.Should().Be(deposit.Code);
    }

    [Fact]
    public async Task ApproveDepositRequest_ShouldReturnBadRequest_WhenRequestIsNotUserConfirmed()
    {
        var user = await Factory.SeedUserAsync();
        await Factory.SeedWalletAsync(user.Id);

        var deposit = await Factory.SeedWalletDepositAsync(user.Id);

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.PostAsync($"/api/admin/deposits/{deposit.Id}/approve", null);

        await response.ShouldHaveError(HttpStatusCode.BadRequest, ErrorCode.InvalidDepositStatus);
    }

    [Fact]
    public async Task ApproveDepositRequest_ShouldReturnNotFound_WhenDepositDoesNotExist()
    {
        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.PostAsync("/api/admin/deposits/999999/approve", null);

        await response.ShouldHaveError(HttpStatusCode.NotFound, ErrorCode.DepositRequestNotFound);
    }


    [Fact]
    public async Task RejectDepositRequest_ShouldNotCreditWallet()
    {
        var user = await Factory.SeedUserAsync();

        await Factory.SeedWalletAsync(user.Id, wallet => wallet.Balance = 50_000m);

        var deposit = await Factory.SeedWalletDepositAsync(user.Id, d =>
        {
            d.Amount = 100_000m;
            d.Status = WalletDepositStatus.UserConfirmed;
        });

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.PostAsync($"/api/admin/deposits/{deposit.Id}/reject", null);

        await response.ShouldBeSuccess();

        var wallet = await Factory.GetWalletAsync(user.Id);

        wallet.Should().NotBeNull();
        wallet!.Balance.Should().Be(50_000m);

        var transactions = await Factory.GetWalletTransactionsAsync(user.Id);

        transactions.Should().BeEmpty();
    }

    [Fact]
    public async Task RejectDepositRequest_ShouldReturnNotFound_WhenDepositDoesNotExist()
    {
        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.PostAsync("/api/admin/deposits/999999/reject", null);

        await response.ShouldHaveError(HttpStatusCode.NotFound, ErrorCode.DepositRequestNotFound);
    }
}