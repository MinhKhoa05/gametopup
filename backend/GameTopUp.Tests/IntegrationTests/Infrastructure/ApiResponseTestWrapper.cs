namespace GameTopUp.Tests.IntegrationTests.Infrastructure
{
    public class ApiResponseTestWrapper<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Message { get; set; }
        public string? ErrorCode { get; set; }
    }
}
