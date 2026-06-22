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

        var request = new CreateDepositRequest
        {
            Amount = 100_000m
        };

        var response = await client.PostJsonAsync("/api/deposits", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var body = await response.ReadApiResponseAsync<WalletDepositResponse>();
        body.Success.Should().BeTrue();
        body.Data.Should().NotBeNull();

        body.Data!.Amount.Should().Be(request.Amount);
        body.Data.Status.Should().Be(WalletDepositStatus.Pending);

        var deposit = await Factory.GetWalletDepositAsync(body.Data.Id);

        deposit.Should().NotBeNull();
        deposit!.UserId.Should().Be(user.Id);
        deposit.Amount.Should().Be(request.Amount);
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
            d.Amount = 100_000m;
            d.Status = WalletDepositStatus.Pending;
        });

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.GetAsync($"/api/deposits/{deposit.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.ReadApiResponseAsync<WalletDepositResponse>();
        body.Success.Should().BeTrue();
        body.Data.Should().NotBeNull();

        body.Data!.Id.Should().Be(deposit.Id);
        body.Data.UserId.Should().Be(user.Id);
        body.Data.Amount.Should().Be(deposit.Amount);
    }

    [Fact]
    public async Task GetDepositRequest_ShouldReturnForbidden_WhenDepositBelongsToAnotherUser()
    {
        var owner = await Factory.SeedUserAsync();
        var otherUser = await Factory.SeedUserAsync();

        var deposit = await Factory.SeedWalletDepositAsync(owner.Id);

        using var client = CreateHeaderAuthenticatedClient(otherUser);

        var response = await client.GetAsync($"/api/deposits/{deposit.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var body = await response.ReadApiResponseAsync<object>();
        body.Success.Should().BeFalse();
        body.ErrorCode.Should().Be(ErrorCode.DepositRequestForbidden);
    }

    [Fact]
    public async Task GetDepositRequest_ShouldReturnNotFound_WhenDepositDoesNotExist()
    {
        var user = await Factory.SeedUserAsync();

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.GetAsync("/api/deposits/999999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);

        var body = await response.ReadApiResponseAsync<object>();
        body.Success.Should().BeFalse();
        body.ErrorCode.Should().Be(ErrorCode.DepositRequestNotFound);
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

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.ReadApiResponseAsync<List<WalletDepositResponse>>();
        body.Success.Should().BeTrue();
        body.Data.Should().NotBeNull();

        var result = body.Data!.Should().ContainSingle().Subject;
        result.Id.Should().Be(userDeposit.Id);
        result.Amount.Should().Be(userDeposit.Amount);
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

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.ReadApiResponseAsync<List<WalletDepositResponse>>();
        body.Success.Should().BeTrue();
        body.Data.Should().NotBeNull();

        var result = body.Data!.Should().ContainSingle().Subject;
        result.Id.Should().Be(pendingDeposit.Id);
        result.Status.Should().Be(WalletDepositStatus.Pending);
    }

    [Fact]
    public async Task ConfirmDepositTransfer_ShouldMarkDepositAsUserConfirmed()
    {
        var user = await Factory.SeedUserAsync();
        var deposit = await Factory.SeedWalletDepositAsync(user.Id, deposit =>
        {
            deposit.Amount = 100_000m;
            deposit.Status = WalletDepositStatus.Pending;
        });

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.PostAsync($"/api/deposits/{deposit.Id}/confirm", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.ReadApiResponseAsync<WalletDepositResponse>();
        body.Success.Should().BeTrue();
        body.Data.Should().NotBeNull();

        body.Data!.Id.Should().Be(deposit.Id);
        body.Data.Status.Should().Be(WalletDepositStatus.UserConfirmed);

        var updatedDeposit = await Factory.GetWalletDepositAsync(deposit.Id);

        updatedDeposit.Should().NotBeNull();
        updatedDeposit!.UserId.Should().Be(user.Id);
        updatedDeposit.Amount.Should().Be(deposit.Amount);
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
