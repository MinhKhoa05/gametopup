using System.ComponentModel.DataAnnotations;

namespace GameTopUp.BLL.DTOs.Wallets;

public sealed class CreateDepositRequest
{
    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal Amount { get; set; }
}
