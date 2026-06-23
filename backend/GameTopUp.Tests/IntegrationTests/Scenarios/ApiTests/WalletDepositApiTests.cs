using System.Net;
using FluentAssertions;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.Tests.IntegrationTests.Extensions;
using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.ApiTests;

[Collection("Integration")]
public sealed class DepositApiTests : BaseIntegrationTest
{
    public DepositApiTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateDepositRequest_ShouldCreatePendingDeposit()
    {
        var user = await Factory.SeedUserAsync();
        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.PostJsonAsync("/api/deposits", new CreateDepositRequest { Amount = 100_00m });

        var createdDeposit = await response.ShouldBeSuccess<WalletDepositResponse>(HttpStatusCode.Created);

        var deposit = await Factory.GetWalletDepositAsync(createdDeposit.Id);

        deposit.Should().NotBeNull();

        deposit!.UserId.Should().Be(user.Id);
        deposit.Amount.Should().Be(100_00m);
        deposit.Status.Should().Be(WalletDepositStatus.Pending);
        deposit.Code.Should().NotBeNullOrWhiteSpace();
        deposit.TransferContent.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task GetDepositRequest_ShouldReturnDeposit_WhenOwner()
    {
        var user = await Factory.SeedUserAsync();
        var deposit = await Factory.SeedWalletDepositAsync(user.Id, d =>
        {
            d.Amount = 777_777m;
        });

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.GetAsync($"/api/deposits/{deposit.Id}");
        
        var depositResponse = await response.ShouldBeSuccess<WalletDepositResponse>();

        depositResponse.Id.Should().Be(deposit.Id);
        depositResponse.UserId.Should().Be(user.Id);
        depositResponse.Amount.Should().Be(777_777m);
    }

    [Fact]
    public async Task GetDepositRequest_ShouldReturnForbidden_WhenDepositBelongsToAnotherUser()
    {
        var owner = await Factory.SeedUserAsync();
        var otherUser = await Factory.SeedUserAsync();

        var deposit = await Factory.SeedWalletDepositAsync(owner.Id);

        using var client = CreateHeaderAuthenticatedClient(otherUser);

        var response = await client.GetAsync($"/api/deposits/{deposit.Id}");

        await response.ShouldHaveError(HttpStatusCode.Forbidden, ErrorCode.DepositRequestForbidden);
    }

    [Fact]
    public async Task GetDepositRequest_ShouldReturnNotFound_WhenDepositDoesNotExist()
    {
        var user = await Factory.SeedUserAsync();

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.GetAsync("/api/deposits/999999");

        await response.ShouldHaveError(HttpStatusCode.NotFound, ErrorCode.DepositRequestNotFound);
    }

    [Fact]
    public async Task GetMyDepositRequests_ShouldReturnOnlyCurrentUserDeposits()
    {
        var user = await Factory.SeedUserAsync();
        var otherUser = await Factory.SeedUserAsync();

        var userDeposit = await Factory.SeedWalletDepositAsync(user.Id, deposit =>
        {
            deposit.Amount = 100_000m;
        });

        await Factory.SeedWalletDepositAsync(otherUser.Id, deposit =>
        {
            deposit.Amount = 200_000m;
        });

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.GetAsync("/api/deposits");

        var deposits = await response.ShouldBeSuccess<List<WalletDepositResponse>>();

        var deposit = deposits.Should().ContainSingle().Subject;

        deposit.Id.Should().Be(userDeposit.Id);
        deposit.UserId.Should().Be(user.Id);
        deposit.Amount.Should().Be(100_000m);
    }

    [Fact]
    public async Task GetMyDepositRequests_ShouldFilterByStatus()
    {
        var user = await Factory.SeedUserAsync();

        var pendingDeposit = await Factory.SeedWalletDepositAsync(user.Id, deposit =>
        {
            deposit.Amount = 100_000m;
            deposit.Status = WalletDepositStatus.Pending;
        });

        await Factory.SeedWalletDepositAsync(user.Id, deposit =>
        {
            deposit.Amount = 200_000m;
            deposit.Status = WalletDepositStatus.UserConfirmed;
        });

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.GetAsync($"/api/deposits?status={WalletDepositStatus.Pending}");
        var deposits = await response.ShouldBeSuccess<List<WalletDepositResponse>>();

        var deposit = deposits.Should().ContainSingle().Subject;
        deposit.Id.Should().Be(pendingDeposit.Id);
        deposit.Status.Should().Be(WalletDepositStatus.Pending);
    }

    [Fact]
    public async Task ConfirmDepositTransfer_ShouldMarkDepositAsUserConfirmed()
    {
        var user = await Factory.SeedUserAsync();
        var deposit = await Factory.SeedWalletDepositAsync(user.Id, deposit =>
        {
            deposit.Amount = 100_000m;
        });

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.PostAsync($"/api/deposits/{deposit.Id}/confirm", null);
        var despositReponse = await response.ShouldBeSuccess<WalletDepositResponse>();

        despositReponse.Id.Should().Be(deposit.Id);
        despositReponse.Status.Should().Be(WalletDepositStatus.UserConfirmed);

        var updatedDeposit = await Factory.GetWalletDepositAsync(deposit.Id);

        updatedDeposit.Should().NotBeNull();
        updatedDeposit!.UserId.Should().Be(user.Id);
        updatedDeposit.Amount.Should().Be(100_000m);
        updatedDeposit.Status.Should().Be(WalletDepositStatus.UserConfirmed);
    }

    [Fact]
    public async Task ProtectedEndpoints_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var createResponse = await Client.PostJsonAsync("/api/deposits", new CreateDepositRequest
        {
            Amount = 100_000m
        });
        createResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var listResponse = await Client.GetAsync("/api/deposits");
        listResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var confirmResponse = await Client.PostAsync("/api/deposits/1/confirm", null);
        confirmResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
