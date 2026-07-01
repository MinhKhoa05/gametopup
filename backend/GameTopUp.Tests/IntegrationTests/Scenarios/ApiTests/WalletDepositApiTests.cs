using System.Net;
using FluentAssertions;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities;
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

        await response.ShouldHaveError(HttpStatusCode.Forbidden, ErrorCode.Forbidden);
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

        var deposits = await response.ShouldBeSuccess<CursorPageResponse<WalletDepositResponse>>();

        var deposit = deposits.Items.Should().ContainSingle().Subject;

        deposit.Id.Should().Be(userDeposit.Id);
        deposit.UserId.Should().Be(user.Id);
        deposit.Amount.Should().Be(100_000m);
    }

    [Fact]
    public async Task GetMyDepositRequestCursorPage_ShouldPaginateByCursorAndApplyFilter()
    {
        var user = await Factory.SeedUserAsync();

        var pendingDeposit = await Factory.SeedWalletDepositAsync(user.Id, deposit =>
        {
            deposit.Status = WalletDepositStatus.Pending;
        });

        var confirmedDeposit = await Factory.SeedWalletDepositAsync(user.Id, deposit =>
        {
            deposit.Status = WalletDepositStatus.UserConfirmed;
        });

        var approvedDeposit = await Factory.SeedWalletDepositAsync(user.Id, deposit =>
        {
            deposit.Status = WalletDepositStatus.Approved;
        });

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.GetAsync("/api/deposits?limit=2");

        var firstPage = await response.ShouldBeSuccess<CursorPageResponse<WalletDepositResponse>>();

        firstPage.Items.Select(deposit => deposit.Id).Should().Equal(approvedDeposit.Id, confirmedDeposit.Id);
        firstPage.NextCursor.Should().Be(confirmedDeposit.Id);
        firstPage.HasMore.Should().BeTrue();

        response = await client.GetAsync($"/api/deposits?cursor={firstPage.NextCursor}&limit=2");

        var secondPage = await response.ShouldBeSuccess<CursorPageResponse<WalletDepositResponse>>();

        secondPage.Items.Should().ContainSingle(deposit => deposit.Id == pendingDeposit.Id);
        secondPage.NextCursor.Should().BeNull();
        secondPage.HasMore.Should().BeFalse();

        response = await client.GetAsync("/api/deposits?filter=active&limit=10");

        var filteredPage = await response.ShouldBeSuccess<CursorPageResponse<WalletDepositResponse>>();

        filteredPage.Items.Select(deposit => deposit.Id).Should().Equal(confirmedDeposit.Id, pendingDeposit.Id);
        filteredPage.NextCursor.Should().BeNull();
        filteredPage.HasMore.Should().BeFalse();

        response = await client.GetAsync("/api/deposits?filter=watching&limit=10");

        filteredPage = await response.ShouldBeSuccess<CursorPageResponse<WalletDepositResponse>>();

        filteredPage.Items.Select(deposit => deposit.Id).Should().Equal(confirmedDeposit.Id, pendingDeposit.Id);

        response = await client.GetAsync("/api/deposits?filter=pending&limit=10");

        filteredPage = await response.ShouldBeSuccess<CursorPageResponse<WalletDepositResponse>>();

        filteredPage.Items.Should().ContainSingle(deposit => deposit.Id == pendingDeposit.Id);

        response = await client.GetAsync("/api/deposits?filter=userConfirmed&limit=10");

        filteredPage = await response.ShouldBeSuccess<CursorPageResponse<WalletDepositResponse>>();

        filteredPage.Items.Should().ContainSingle(deposit => deposit.Id == confirmedDeposit.Id);
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
        await response.ShouldBeSuccess();

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
