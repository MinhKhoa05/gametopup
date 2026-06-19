using FluentAssertions;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.DAL.Interfaces.Users;
using Moq;

namespace GameTopUp.Tests.UnitTests.Services;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _repository = new();
    private readonly UserService _service;

    public UserServiceTests()
    {
        _service = new UserService(_repository.Object);
    }

    [Fact]
    public async Task UpdateProfileAsync_ShouldPersistUpdatedUser()
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

        await _service.UpdateProfileAsync(new UserContext { UserId = 7 }, 7, new UpdateUserRequest
        {
            DisplayName = "New",
            Email = "new@example.com",
            IsActive = false
        });

        updatedUser.Should().NotBeNull();
        updatedUser!.DisplayName.Should().Be("New");
        updatedUser.Email.Should().Be("new@example.com");
        updatedUser.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateProfileAsync_ShouldThrow_WhenEmailAlreadyExistsOnAnotherUser()
    {
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
            .Setup(repo => repo.ExistsByEmailAsync("taken@example.com"))
            .ReturnsAsync(true);

        var act = async () => await _service.UpdateProfileAsync(new UserContext { UserId = 7 }, 7, new UpdateUserRequest
        {
            Email = "taken@example.com"
        });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.EmailExists);
        _repository.Verify(repo => repo.UpdateAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task UpdateProfileAsync_ShouldIgnoreBlankFieldsAndKeepExistingValues()
    {
        User? updatedUser = null;
        _repository
            .Setup(repo => repo.GetByIdAsync(7))
            .ReturnsAsync(new User
            {
                Id = 7,
                DisplayName = "Old",
                Email = "old@example.com",
                Role = UserRole.Member,
                IsActive = true
            });
        _repository
            .Setup(repo => repo.UpdateAsync(It.IsAny<User>()))
            .ReturnsAsync(true)
            .Callback<User>(user => updatedUser = user);

        await _service.UpdateProfileAsync(new UserContext { UserId = 7 }, 7, new UpdateUserRequest
        {
            DisplayName = "   ",
            Email = null
        });

        updatedUser.Should().NotBeNull();
        updatedUser!.DisplayName.Should().Be("Old");
        updatedUser.Email.Should().Be("old@example.com");
    }

    [Fact]
    public async Task GetProfileAsync_ShouldThrowForbidden_WhenMemberRequestsAnotherUser()
    {
        var act = async () => await _service.GetProfileAsync(new UserContext { UserId = 7 }, 8);

        await act.Should().ThrowAsync<ForbiddenException>()
            .Where(ex => ex.ErrorCode == ErrorCode.Forbidden);
    }

    [Fact]
    public async Task UpdateProfileAsync_ShouldAllowAdminToUpdateAnotherUser()
    {
        User? updatedUser = null;
        _repository
            .Setup(repo => repo.GetByIdAsync(8))
            .ReturnsAsync(new User
            {
                Id = 8,
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

        await _service.UpdateProfileAsync(new UserContext { UserId = 1, Role = UserRole.Admin }, 8, new UpdateUserRequest
        {
            DisplayName = "AdminEdit"
        });

        updatedUser.Should().NotBeNull();
        updatedUser!.DisplayName.Should().Be("AdminEdit");
    }

    [Fact]
    public async Task DeleteAsync_ShouldDeleteUser_WhenUserExists()
    {
        _repository
            .Setup(repo => repo.GetByIdAsync(7))
            .ReturnsAsync(new User { Id = 7 });
        _repository
            .Setup(repo => repo.DeleteAsync(7))
            .ReturnsAsync(1);

        await _service.DeleteAsync(7);

        _repository.Verify(repo => repo.DeleteAsync(7), Times.Once);
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
