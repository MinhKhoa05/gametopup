using FluentAssertions;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services.Auth;

namespace GameTopUp.Tests.UnitTests.Services;

public class PasswordServiceTests
{
    private readonly PasswordService _service = new();

    [Fact]
    public void Validate_ShouldThrow_WhenPasswordIsWeak()
    {
        var act = () => _service.Validate("weakpass");

        act.Should().Throw<BusinessException>()
            .Which.ErrorCode.Should().Be(ErrorCode.WeakPassword);
    }

    [Fact]
    public void Validate_ShouldPass_WhenPasswordIsStrong()
    {
        var act = () => _service.Validate("StrongPass1!");

        act.Should().NotThrow();
    }
}
