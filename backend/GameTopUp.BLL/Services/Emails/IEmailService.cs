namespace GameTopUp.BLL.Services.Emails;

public interface IEmailService
{
    Task<bool> SendEmailAsync(EmailMessage message, CancellationToken cancellationToken = default);
}
