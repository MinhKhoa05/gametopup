using System.Net;
using System.Net.Mail;
using System.Text;
using GameTopUp.BLL.Options;
using Microsoft.Extensions.Options;

namespace GameTopUp.BLL.Services.Emails;

public class EmailService : IEmailService
{
    private const int SmtpTimeoutMilliseconds = 30_000;

    private readonly EmailSettings _settings;

    public EmailService(IOptions<EmailSettings> emailOptions)
    {
        _settings = emailOptions.Value;
    }

    public async Task<bool> SendEmailAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(message);
        ValidateSettings();

        using var mailMessage = CreateMailMessage(message);
        using var smtpClient = CreateSmtpClient();

        await smtpClient.SendMailAsync(mailMessage).WaitAsync(cancellationToken).ConfigureAwait(false);
        return true;
    }

    private MailMessage CreateMailMessage(EmailMessage message)
    {
        if (string.IsNullOrWhiteSpace(message.To))
        {
            throw new ArgumentException("Recipient email is required.", nameof(message));
        }

        if (string.IsNullOrWhiteSpace(message.Subject))
        {
            throw new ArgumentException("Email subject is required.", nameof(message));
        }

        if (string.IsNullOrWhiteSpace(message.HtmlBody))
        {
            throw new ArgumentException("Email body is required.", nameof(message));
        }

        var mailMessage = new MailMessage
        {
            From = string.IsNullOrWhiteSpace(_settings.FromName)
                ? new MailAddress(_settings.FromEmail)
                : new MailAddress(_settings.FromEmail, _settings.FromName, Encoding.UTF8),
            Subject = message.Subject.Trim(),
            Body = message.HtmlBody,
            IsBodyHtml = true,
            BodyEncoding = Encoding.UTF8,
            SubjectEncoding = Encoding.UTF8
        };

        mailMessage.To.Add(message.To.Trim());

        return mailMessage;
    }

    private SmtpClient CreateSmtpClient()
    {
        return new SmtpClient(_settings.Host, _settings.Port)
        {
            Credentials = new NetworkCredential(_settings.Username, _settings.Password),
            EnableSsl = true,
            Timeout = SmtpTimeoutMilliseconds
        };
    }

    private void ValidateSettings()
    {
        if (string.IsNullOrWhiteSpace(_settings.Host))
        {
            throw new InvalidOperationException("Email host is not configured.");
        }

        if (string.IsNullOrWhiteSpace(_settings.FromEmail))
        {
            throw new InvalidOperationException("Email sender address is not configured.");
        }

        if (string.IsNullOrWhiteSpace(_settings.Username))
        {
            throw new InvalidOperationException("Email username is not configured.");
        }

        if (string.IsNullOrWhiteSpace(_settings.Password))
        {
            throw new InvalidOperationException("Email password is not configured.");
        }
    }
}
