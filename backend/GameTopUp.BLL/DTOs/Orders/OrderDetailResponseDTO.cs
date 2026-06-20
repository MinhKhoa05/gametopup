namespace GameTopUp.BLL.DTOs.Orders;

public sealed class OrderDetailResponseDTO
{
    public OrderResponseDTO Order { get; set; } = null!;
    public List<OrderHistoryResponseDTO> Histories { get; set; } = [];
}
