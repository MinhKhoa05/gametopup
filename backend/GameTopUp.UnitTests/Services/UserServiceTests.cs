using FluentAssertions;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services.Users;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
using Moq;

namespace GameTopUp.UnitTests.Services;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _repository = new();
    private readonly UserService _service;

    public UserServiceTests()
    {
        _service = new UserService(_repository.Object);
    }

    [Theory]
    [InlineData("New", "New")]
    [InlineData("   ", "")]
    public async Task UpdateProfileAsync_ShouldPersistNormalizedDisplayName(string displayName, string expectedDisplayName)
    {
        User? updatedUser = null;
        _repository
            .Setup(repo => repo.GetByIdAsync(7))
            .ReturnsAsync(new User
            {
                Id = 7,
                DisplayName = "Old",
                Email = "old@example.com",
                PasswordHash = "password-hash",
                Role = UserRole.Member,
                IsActive = true
            });
        _repository
            .Setup(repo => repo.UpdateAsync(It.IsAny<User>()))
            .ReturnsAsync(true)
            .Callback<User>(user => updatedUser = user);

        await _service.UpdateProfileAsync(7, new UpdateProfileRequest
        {
            DisplayName = displayName
        });

        updatedUser.Should().NotBeNull();
        updatedUser!.DisplayName.Should().Be(expectedDisplayName);
    }

    [Fact]
    public async Task DeleteAsync_ShouldThrow_WhenUserMissing()
    {
        _repository
            .Setup(repo => repo.GetByIdAsync(7))
            .ReturnsAsync((User?)null);

        var act = async () => await _service.DeleteAsync(7);

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.UserNotFound);
    }
}
