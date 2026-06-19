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
        var createBody = await createResponse.ReadApiResponseAsync<WalletDepositResponseDTO>();
        createBody.Success.Should().BeTrue();
        createBody.Data.Should().NotBeNull();
        var requestId = createBody.Data!.Id;
        createBody.Data.Status.Should().Be(WalletDepositStatus.Pending);

        var requestAfterCreate = await Factory.GetDepositRequestAsync(requestId);
        requestAfterCreate.Should().NotBeNull();
        requestAfterCreate!.Status.Should().Be(WalletDepositStatus.Pending);
        requestAfterCreate.Amount.Should().Be(100000m);

        var confirmResponse = await memberClient.PostAsync($"/api/deposits/{requestId}/confirm", null);
        confirmResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var confirmBody = await confirmResponse.ReadApiResponseAsync<WalletDepositResponseDTO>();
        confirmBody.Data.Should().NotBeNull();
        confirmBody.Data!.Status.Should().Be(WalletDepositStatus.UserConfirmed);

        var requestAfterConfirm = await Factory.GetDepositRequestAsync(requestId);
        requestAfterConfirm.Should().NotBeNull();
        requestAfterConfirm!.Status.Should().Be(WalletDepositStatus.UserConfirmed);
        requestAfterConfirm.UserConfirmedAt.Should().NotBeNull();

        var approveResponse = await adminClient.PostJsonAsync($"/api/admin/deposits/{requestId}/approve", new ReviewDepositRequest
        {
            Note = "verified"
        });
        approveResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var approveBody = await approveResponse.ReadApiResponseAsync<AdminDepositRequestResponseDTO>();
        approveBody.Data.Should().NotBeNull();
        approveBody.Data!.Status.Should().Be(WalletDepositStatus.Approved);
        approveBody.Data.ReviewedBy.Should().Be(admin.Id);
        approveBody.Data.AdminNote.Should().Be("verified");

        var requestAfterApprove = await Factory.GetDepositRequestAsync(requestId);
        requestAfterApprove.Should().NotBeNull();
        requestAfterApprove!.Status.Should().Be(WalletDepositStatus.Approved);
        requestAfterApprove.ReviewedBy.Should().Be(admin.Id);
        requestAfterApprove.AdminNote.Should().Be("verified");

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

        var requestAfterSecondApprove = await Factory.GetDepositRequestAsync(requestId);
        requestAfterSecondApprove.Should().NotBeNull();
        requestAfterSecondApprove!.Status.Should().Be(WalletDepositStatus.Approved);
        requestAfterSecondApprove.ReviewedBy.Should().Be(admin.Id);
        requestAfterSecondApprove.AdminNote.Should().Be("verified");

        var transactionsAfterSecondApprove = await Factory.GetWalletTransactionsAsync(member.Id);
        transactionsAfterSecondApprove.Should().HaveCount(1);
    }

    [DockerFact]
    public async Task MemberShouldSeeOnlyTheirOwnDepositRequests_AndFilterByStatus()
    {
        var member = await Factory.SeedUserAsync(UserRole.Member);
        var other = await Factory.SeedUserAsync(UserRole.Member);
        await Factory.SeedDepositRequestAsync(member.Id, 100000m, WalletDepositStatus.Pending);
        await Factory.SeedDepositRequestAsync(member.Id, 200000m, WalletDepositStatus.UserConfirmed);
        await Factory.SeedDepositRequestAsync(other.Id, 300000m, WalletDepositStatus.Approved);

        using var memberClient = CreateAuthenticatedClient(member.Id, member.DisplayName, member.Email, member.Role);

        var allResponse = await memberClient.GetAsync("/api/deposits");
        allResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var allBody = await allResponse.ReadApiResponseAsync<List<WalletDepositResponseDTO>>();
        allBody.Data.Should().NotBeNull();
        allBody.Data.Should().HaveCount(2);

        var filteredResponse = await memberClient.GetAsync($"/api/deposits?status={WalletDepositStatus.UserConfirmed}");
        filteredResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var filteredBody = await filteredResponse.ReadApiResponseAsync<List<WalletDepositResponseDTO>>();
        filteredBody.Data.Should().NotBeNull();
        filteredBody.Data!.Should().ContainSingle(request => request.Status == WalletDepositStatus.UserConfirmed);
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
        var request = await Factory.SeedDepositRequestAsync(owner.Id, 50000m, WalletDepositStatus.Pending);
        using var attackerClient = CreateAuthenticatedClient(attacker.Id, attacker.DisplayName, attacker.Email, attacker.Role);

        var response = await attackerClient.PostAsync($"/api/deposits/{request.Id}/confirm", null);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [DockerFact]
    public async Task AdminShouldRejectPendingRequest_ButNotApprovedRequest()
    {
        var admin = await Factory.SeedAdminAsync();
        var pendingOwner = await Factory.SeedUserAsync();
        var approvedOwner = await Factory.SeedUserAsync();
        await Factory.SeedWalletAsync(pendingOwner.Id, 0m);
        await Factory.SeedWalletAsync(approvedOwner.Id, 0m);
        var pending = await Factory.SeedDepositRequestAsync(pendingOwner.Id, 50000m, WalletDepositStatus.Pending);
        var approved = await Factory.SeedDepositRequestAsync(approvedOwner.Id, 50000m, WalletDepositStatus.Approved);

        using var adminClient = CreateAuthenticatedClient(admin.Id, admin.DisplayName, admin.Email, admin.Role);

        var pendingRejectResponse = await adminClient.PostJsonAsync($"/api/admin/deposits/{pending.Id}/reject", new ReviewDepositRequest
        {
            Note = "invalid proof"
        });
        pendingRejectResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var pendingRejectBody = await pendingRejectResponse.ReadApiResponseAsync<AdminDepositRequestResponseDTO>();
        pendingRejectBody.Data.Should().NotBeNull();
        pendingRejectBody.Data!.Status.Should().Be(WalletDepositStatus.Rejected);

        var rejectedRequest = await Factory.GetDepositRequestAsync(pending.Id);
        rejectedRequest.Should().NotBeNull();
        rejectedRequest!.Status.Should().Be(WalletDepositStatus.Rejected);
        rejectedRequest.ReviewedBy.Should().Be(admin.Id);

        var pendingOwnerWallet = await Factory.GetWalletAsync(pendingOwner.Id);
        pendingOwnerWallet.Should().NotBeNull();
        pendingOwnerWallet!.Balance.Should().Be(0m);
        var pendingOwnerTransactions = await Factory.GetWalletTransactionsAsync(pendingOwner.Id);
        pendingOwnerTransactions.Should().BeEmpty();

        var approvedRejectResponse = await adminClient.PostJsonAsync($"/api/admin/deposits/{approved.Id}/reject", new ReviewDepositRequest
        {
            Note = "too late"
        });
        approvedRejectResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var approvedRejectBody = await approvedRejectResponse.ReadApiResponseAsync<object>();
        approvedRejectBody.Success.Should().BeFalse();

        var approvedRequest = await Factory.GetDepositRequestAsync(approved.Id);
        approvedRequest.Should().NotBeNull();
        approvedRequest!.Status.Should().Be(WalletDepositStatus.Approved);

        var approvedOwnerWallet = await Factory.GetWalletAsync(approvedOwner.Id);
        approvedOwnerWallet.Should().NotBeNull();
        approvedOwnerWallet!.Balance.Should().Be(0m);
        var approvedOwnerTransactions = await Factory.GetWalletTransactionsAsync(approvedOwner.Id);
        approvedOwnerTransactions.Should().BeEmpty();
    }

    [DockerFact]
    public async Task AdminApprove_ShouldFail_WhenRequestIsNotUserConfirmed()
    {
        var admin = await Factory.SeedAdminAsync();
        var owner = await Factory.SeedUserAsync();
        await Factory.SeedWalletAsync(owner.Id, 0m);
        var request = await Factory.SeedDepositRequestAsync(owner.Id, 50000m, WalletDepositStatus.Pending);
        using var adminClient = CreateAuthenticatedClient(admin.Id, admin.DisplayName, admin.Email, admin.Role);

        var response = await adminClient.PostJsonAsync($"/api/admin/deposits/{request.Id}/approve", new ReviewDepositRequest
        {
            Note = "cannot approve yet"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.ReadApiResponseAsync<object>();
        body.Success.Should().BeFalse();
        body.ErrorCode.Should().Be("DepositApproveOnlyUserConfirmed");

        var requestAfterFailedApprove = await Factory.GetDepositRequestAsync(request.Id);
        requestAfterFailedApprove.Should().NotBeNull();
        requestAfterFailedApprove!.Status.Should().Be(WalletDepositStatus.Pending);

        var ownerWallet = await Factory.GetWalletAsync(owner.Id);
        ownerWallet.Should().NotBeNull();
        ownerWallet!.Balance.Should().Be(0m);
        var ownerTransactions = await Factory.GetWalletTransactionsAsync(owner.Id);
        ownerTransactions.Should().BeEmpty();
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
        var request = await Factory.SeedDepositRequestAsync(member.Id, 50000m, WalletDepositStatus.UserConfirmed);

        using var memberClient = CreateAuthenticatedClient(member.Id, member.DisplayName, member.Email, member.Role);

        var response = await memberClient.PostJsonAsync($"/api/admin/deposits/{request.Id}/approve", new ReviewDepositRequest
        {
            Note = "not allowed"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}
