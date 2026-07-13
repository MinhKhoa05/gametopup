namespace GameTopUp.BLL.Services.Emails;

public sealed class EmailMessage
{
    public string To { get; set; } = string.Empty;

    public string Subject { get; set; } = string.Empty;

    public string HtmlBody { get; set; } = string.Empty;
}
