using System.ComponentModel.DataAnnotations;
using GameTopUp.DAL.Entities;

namespace GameTopUp.BLL.Contracts;

public sealed class CreateDepositRequest
{
    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal Amount { get; set; }
}

public sealed class ReviewDepositRequest
{
    public string? Note { get; set; }
}

public enum WalletTransactionFilter
{
    Deposit = 1,
    Withdraw = 2,
    PurchaseOrder = 3,
    Refund = 4
}

public sealed class WalletTransactionResponse
{
    public long Id { get; set; }

    public decimal Amount { get; set; }
    public decimal BalanceBefore { get; set; }
    public decimal BalanceAfter { get; set; }

    public WalletTransactionType Type { get; set; }
    public string? ReferenceId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}

public enum WalletDepositFilter
{
    Active = 0,
    Pending = 1,
    UserConfirmed = 2,
    Approved = 3,
    Rejected = 4,
    Watching = 5
}

public sealed class WalletDepositResponse
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public decimal Amount { get; set; }

    public string Code { get; set; } = string.Empty;
    public string TransferContent { get; set; } = string.Empty;
    public string QrImageUrl { get; set; } = string.Empty;
    public string BankId { get; set; } = string.Empty;
    public string AccountNo { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;

    public WalletDepositStatus Status { get; set; }

    public DateTimeOffset? UserConfirmedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public long? ReviewedBy { get; set; }
    public string? AdminNote { get; set; }
}
