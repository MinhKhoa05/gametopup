using GameTopUp.BLL.Utils;
using FluentAssertions;
using Xunit;

namespace GameTopUp.Tests.UnitTests.Utils
{
    public class NormalizeNameTests
    {
        [Theory]
        [InlineData("999 Kim Cương", "999 kim cuong")]
        [InlineData("Gói Nạp Đặc Biệt", "goi nap dac biet")]
        [InlineData("ALPHA-123", "alpha-123")]
        [InlineData(" Liên Quân Mobile ", "lien quan mobile")]
        [InlineData(null, "")]
        [InlineData("   ", "")]
        public void Normalize_ShouldNormalizeCorrectly(string? input, string expected)
        {
            // Act
            var result = NormalizeName.Normalize(input!);

            // Assert
            result.Should().Be(expected);
        }
    }
}
