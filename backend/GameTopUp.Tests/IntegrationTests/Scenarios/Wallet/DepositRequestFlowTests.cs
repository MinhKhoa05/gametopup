using System.Net;
using FluentAssertions;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.Tests.IntegrationTests.Infrastructure;
using GameTopUp.Tests.IntegrationTests.Support;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.Wallet;

[Collection("Integration")]
public sealed class DepositRequestFlowTests : BaseIntegrationTest
{
    public DepositRequestFlowTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [DockerFact]
    public async Task MemberShouldCreateConfirmAndAdminApproveDepositRequest_WithoutDoubleCredit()
    {
        var member = await Factory.SeedUserAsync(UserRole.Member);
        await Factory.SeedWalletAsync(member.Id, 0m);
        var admin = await Factory.SeedAdminAsync();

        using var memberClient = CreateAuthenticatedClient(member.Id, member.DisplayName, member.Email, member.Role);
        using var adminClient = CreateAuthenticatedClient(admin.Id, admin.DisplayName, admin.Email, admin.Role);

        var createResponse = await memberClient.PostJsonAsync("/api/deposits", new CreateDepositRequest
        {
            Amount = 100000m
        });

        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var createBody = await createResponse.ReadApiResponseAsync<WalletDepositRequestResponseDTO>();
        createBody.Success.Should().BeTrue();
        createBody.Data.Should().NotBeNull();
        var requestId = createBody.Data!.Id;
        createBody.Data.Status.Should().Be(WalletDepositRequestStatus.Pending);

        var confirmResponse = await memberClient.PostAsync($"/api/deposits/{requestId}/confirm", null);
        confirmResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var confirmBody = await confirmResponse.ReadApiResponseAsync<WalletDepositRequestResponseDTO>();
        confirmBody.Data.Should().NotBeNull();
        confirmBody.Data!.Status.Should().Be(WalletDepositRequestStatus.UserConfirmed);

        var approveResponse = await adminClient.PostJsonAsync($"/api/admin/deposits/{requestId}/approve", new ReviewDepositRequest
        {
            Note = "verified"
        });
        approveResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var approveBody = await approveResponse.ReadApiResponseAsync<AdminDepositRequestResponseDTO>();
        approveBody.Data.Should().NotBeNull();
        approveBody.Data!.Status.Should().Be(WalletDepositRequestStatus.Approved);
        approveBody.Data.ReviewedBy.Should().Be(admin.Id);
        approveBody.Data.AdminNote.Should().Be("verified");

        var wallet = await Factory.GetWalletAsync(member.Id);
        wallet.Should().NotBeNull();
        wallet!.Balance.Should().Be(100000m);

        var transactions = await Factory.GetWalletTransactionsAsync(member.Id);
        transactions.Should().ContainSingle(transaction => transaction.Type == WalletTransactionType.Deposit && transaction.Amount == 100000m);

        var approveAgainResponse = await adminClient.PostJsonAsync($"/api/admin/deposits/{requestId}/approve", new ReviewDepositRequest
        {
            Note = "verified again"
        });
        approveAgainResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var walletAfterSecondApprove = await Factory.GetWalletAsync(member.Id);
        walletAfterSecondApprove.Should().NotBeNull();
        walletAfterSecondApprove!.Balance.Should().Be(100000m);
    }

    [DockerFact]
    public async Task MemberShouldSeeOnlyTheirOwnDepositRequests_AndFilterByStatus()
    {
        var member = await Factory.SeedUserAsync(UserRole.Member);
        var other = await Factory.SeedUserAsync(UserRole.Member);
        await Factory.SeedDepositRequestAsync(member.Id, 100000m, WalletDepositRequestStatus.Pending);
        await Factory.SeedDepositRequestAsync(member.Id, 200000m, WalletDepositRequestStatus.UserConfirmed);
        await Factory.SeedDepositRequestAsync(other.Id, 300000m, WalletDepositRequestStatus.Approved);

        using var memberClient = CreateAuthenticatedClient(member.Id, member.DisplayName, member.Email, member.Role);

        var allResponse = await memberClient.GetAsync("/api/deposits");
        allResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var allBody = await allResponse.ReadApiResponseAsync<List<WalletDepositRequestResponseDTO>>();
        allBody.Data.Should().NotBeNull();
        allBody.Data.Should().HaveCount(2);

        var filteredResponse = await memberClient.GetAsync($"/api/deposits?status={WalletDepositRequestStatus.UserConfirmed}");
        filteredResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var filteredBody = await filteredResponse.ReadApiResponseAsync<List<WalletDepositRequestResponseDTO>>();
        filteredBody.Data.Should().NotBeNull();
        filteredBody.Data!.Should().ContainSingle(request => request.Status == WalletDepositRequestStatus.UserConfirmed);
    }

    [DockerFact]
    public async Task CreatingDepositRequest_ShouldRejectNonPositiveOrNonIntegerAmounts()
    {
        var member = await Factory.SeedUserAsync(UserRole.Member);
        using var memberClient = CreateAuthenticatedClient(member.Id, member.DisplayName, member.Email, member.Role);

        var zeroResponse = await memberClient.PostJsonAsync("/api/deposits", new CreateDepositRequest
        {
            Amount = 0m
        });
        zeroResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var decimalResponse = await memberClient.PostJsonAsync("/api/deposits", new CreateDepositRequest
        {
            Amount = 100000.5m
        });
        decimalResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [DockerFact]
    public async Task ConfirmTransfer_ShouldRejectAnotherUsersRequest()
    {
        var owner = await Factory.SeedUserAsync(UserRole.Member);
        var attacker = await Factory.SeedUserAsync(UserRole.Member);
        var request = await Factory.SeedDepositRequestAsync(owner.Id, 50000m, WalletDepositRequestStatus.Pending);
        using var attackerClient = CreateAuthenticatedClient(attacker.Id, attacker.DisplayName, attacker.Email, attacker.Role);

        var response = await attackerClient.PostAsync($"/api/deposits/{request.Id}/confirm", null);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [DockerFact]
    public async Task AdminShouldRejectPendingRequest_ButNotApprovedRequest()
    {
        var admin = await Factory.SeedAdminAsync();
        var pending = await Factory.SeedDepositRequestAsync((await Factory.SeedUserAsync()).Id, 50000m, WalletDepositRequestStatus.Pending);
        var approved = await Factory.SeedDepositRequestAsync((await Factory.SeedUserAsync()).Id, 50000m, WalletDepositRequestStatus.Approved);

        using var adminClient = CreateAuthenticatedClient(admin.Id, admin.DisplayName, admin.Email, admin.Role);

        var pendingRejectResponse = await adminClient.PostJsonAsync($"/api/admin/deposits/{pending.Id}/reject", new ReviewDepositRequest
        {
            Note = "invalid proof"
        });
        pendingRejectResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var pendingRejectBody = await pendingRejectResponse.ReadApiResponseAsync<AdminDepositRequestResponseDTO>();
        pendingRejectBody.Data.Should().NotBeNull();
        pendingRejectBody.Data!.Status.Should().Be(WalletDepositRequestStatus.Rejected);

        var approvedRejectResponse = await adminClient.PostJsonAsync($"/api/admin/deposits/{approved.Id}/reject", new ReviewDepositRequest
        {
            Note = "too late"
        });
        approvedRejectResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var approvedRejectBody = await approvedRejectResponse.ReadApiResponseAsync<object>();
        approvedRejectBody.Success.Should().BeFalse();
    }

    [DockerFact]
    public async Task AdminApprove_ShouldFail_WhenRequestIsNotUserConfirmed()
    {
        var admin = await Factory.SeedAdminAsync();
        var request = await Factory.SeedDepositRequestAsync((await Factory.SeedUserAsync()).Id, 50000m, WalletDepositRequestStatus.Pending);
        using var adminClient = CreateAuthenticatedClient(admin.Id, admin.DisplayName, admin.Email, admin.Role);

        var response = await adminClient.PostJsonAsync($"/api/admin/deposits/{request.Id}/approve", new ReviewDepositRequest
        {
            Note = "cannot approve yet"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.ReadApiResponseAsync<object>();
        body.Success.Should().BeFalse();
        body.ErrorCode.Should().Be("DepositApproveOnlyUserConfirmed");
    }

    [DockerFact]
    public async Task MemberShouldBeForbidden_WhenListingAdminDepositRequests()
    {
        var member = await Factory.SeedUserAsync(UserRole.Member);
        using var memberClient = CreateAuthenticatedClient(member.Id, member.DisplayName, member.Email, member.Role);

        var response = await memberClient.GetAsync("/api/admin/deposits");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [DockerFact]
    public async Task MemberShouldNotApproveDepositRequest()
    {
        var member = await Factory.SeedUserAsync(UserRole.Member);
        var request = await Factory.SeedDepositRequestAsync(member.Id, 50000m, WalletDepositRequestStatus.UserConfirmed);

        using var memberClient = CreateAuthenticatedClient(member.Id, member.DisplayName, member.Email, member.Role);

        var response = await memberClient.PostJsonAsync($"/api/admin/deposits/{request.Id}/approve", new ReviewDepositRequest
        {
            Note = "not allowed"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}
