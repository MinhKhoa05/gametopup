namespace GameTopUp.Tests.IntegrationTests.Support;

public sealed class ApiResponseEnvelope<T>
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? ErrorCode { get; set; }
    public T? Data { get; set; }
}
