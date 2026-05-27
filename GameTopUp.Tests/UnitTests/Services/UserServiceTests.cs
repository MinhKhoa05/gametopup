using Moq;
using GameTopUp.DAL.Interfaces.Users;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services;
using GameTopUp.DAL.Entities;
using Xunit;
using FluentAssertions;

namespace GameTopUp.Tests.UnitTests.Services
{
    public class UserServiceTests
    {
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly UserService _userService;

        public UserServiceTests()
        {
            _userRepoMock = new Mock<IUserRepository>();
            _userService = new UserService(_userRepoMock.Object);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldThrowNotFound_WhenUserDoesNotExist()
        {
            // Arrange
            _userRepoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((User?)null);

            // Act
            Func<Task> act = () => _userService.GetByIdAsync(999);

            // Assert
            await act.Should().ThrowAsync<NotFoundException>()
                .WithMessage("Người dùng không tồn tại.");
        }

        [Fact]
        public async Task RegisterAsync_ShouldCreateUser_WhenEmailIsUnique()
        {
            // Arrange
            var request = new CreateUserRequest { Name = "New User", Email = "new@test.com", Password = "hashed_password" };
            _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync((User?)null);

            User? createdUser = null;
            _userRepoMock
                .Setup(r => r.CreateAsync(It.IsAny<User>()))
                .Callback<User>(u => createdUser = u)
                .ReturnsAsync(1);

            // Act
            var userId = await _userService.RegisterWithHashedPasswordAsync(request, request.Password);

            // Assert
            userId.Should().Be(1);

            createdUser.Should().NotBeNull();
            createdUser!.Username.Should().Be(request.Name);
            createdUser.Email.Should().Be(request.Email);
            createdUser.PasswordHash.Should().Be(request.Password);
        }

        [Fact]
        public async Task RegisterAsync_ShouldThrow_WhenEmailAlreadyExists()
        {
            // Arrange
            var request = new CreateUserRequest { Name = "New User", Email = "existing@test.com" };
            _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync(new User());

            // Act
            Func<Task> act = () => _userService.RegisterWithHashedPasswordAsync(request, request.Password);

            // Assert
            await act.Should().ThrowAsync<BusinessException>().WithMessage("Email này đã được sử dụng trong hệ thống.");
            _userRepoMock.Verify(r => r.CreateAsync(It.IsAny<User>()), Times.Never);
        }
    }
}
