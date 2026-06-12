using System.ComponentModel.DataAnnotations;

namespace GameTopUp.BLL.Options;

public sealed class VietQrSettings
{
    [Required]
    public string BankId { get; set; } = string.Empty;

    [Required]
    public string AccountNo { get; set; } = string.Empty;

    [Required]
    public string AccountName { get; set; } = string.Empty;

    public string Template { get; set; } = "compact2";
}
