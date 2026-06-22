namespace GameTopUp.BLL.DTOs.Orders;

public sealed class OrderDetailResponse
{
    public OrderResponse Order { get; set; } = null!;
    public List<OrderHistoryResponse> Histories { get; set; } = [];
}
