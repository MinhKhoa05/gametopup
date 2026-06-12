using System.Text.Json;
using FluentAssertions;
using GameTopUp.BLL.DTOs.Auths;

namespace GameTopUp.Tests.UnitTests.DTOs;

public class AuthResponseDTOTests
{
    [Fact]
    public void Serialize_ShouldOmitUser_WhenRefreshResponseDoesNotSetIt()
    {
        var json = JsonSerializer.Serialize(
            new AuthResponseDTO
        {
            AccessToken = "access",
            RefreshToken = "refresh"
        },
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        json.Should().NotContain("\"user\"");
    }
}
