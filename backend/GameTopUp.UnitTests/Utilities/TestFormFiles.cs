using Microsoft.AspNetCore.Http;

namespace GameTopUp.UnitTests.Utilities;

internal static class TestFormFiles
{
    public static FormFile Image(string fileName = "image.png") =>
        new(Stream.Null, 0, 1, "image", fileName);
}
