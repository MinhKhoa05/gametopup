using GameTopUp.DAL.Entities.Orders;

namespace GameTopUp.BLL.DTOs.Orders;

public sealed class OrderChangeResult
{
    public Order Order { get; private set; } = null!;
    public OrderStatus? FromStatus { get; private set; }
    public OrderStatus ToStatus { get; private set; }
    public bool Changed { get; private set; }

    public static OrderChangeResult ChangedStatus(Order order, OrderStatus fromStatus)
    {
        return new OrderChangeResult
        {
            Order = order,
            FromStatus = fromStatus,
            ToStatus = order.Status,
            Changed = true
        };
    }

    public static OrderChangeResult Unchanged(Order order)
    {
        return new OrderChangeResult
        {
            Order = order,
            FromStatus = null,
            ToStatus = order.Status,
            Changed = false
        };
    }
}
