using FluentAssertions;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services.Notifications;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
using Moq;

namespace GameTopUp.UnitTests.Services;

public class NotificationServiceTests
{
    private readonly Mock<INotificationRepository> _repository = new();
    private readonly NotificationService _service;

    public NotificationServiceTests()
    {
        _service = new NotificationService(_repository.Object);
    }

    [Fact]
    public async Task CreateNotificationAsync_ShouldTrimInputsAndPersistUnreadNotification()
    {
        Notification? captured = null;
        _repository.Setup(repo => repo.CreateAsync(It.IsAny<Notification>()))
            .Callback<Notification>(notification => captured = notification)
            .ReturnsAsync(99);
        var startedAt = DateTimeOffset.UtcNow;

        await _service.CreateNotificationAsync(new CreateNotificationRequest
        {
            UserId = 7,
            Type = NotificationType.OrderPlaced,
            Title = "  Order placed  ",
            Message = "  Order #123 has been created.  "
        });

        var finishedAt = DateTimeOffset.UtcNow;

        captured.Should().NotBeNull();
        captured!.UserId.Should().Be(7);
        captured.Title.Should().Be("Order placed");
        captured.Message.Should().Be("Order #123 has been created.");
        captured.IsRead.Should().BeFalse();
        captured.ReadAt.Should().BeNull();
        captured.CreatedAt.Should().BeOnOrAfter(startedAt).And.BeOnOrBefore(finishedAt);
        _repository.Verify(repo => repo.CreateAsync(It.IsAny<Notification>()), Times.Once);
    }

    [Fact]
    public async Task CreateNotificationAsync_ShouldThrowBadRequest_WhenRequiredFieldsAreBlank()
    {
        var act = () => _service.CreateNotificationAsync(new CreateNotificationRequest
        {
            UserId = 7,
            Type = NotificationType.OrderPlaced,
            Title = " ",
            Message = "Message"
        });

        await act.Should()
            .ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.BadRequest);

        _repository.Verify(repo => repo.CreateAsync(It.IsAny<Notification>()), Times.Never);
    }
}
