using GameTopUp.DAL.Entities.Orders;

namespace GameTopUp.BLL.DTOs.Orders;

public sealed class OrderChangeResult
{
    public Order Order { get; }
    public OrderStatus? FromStatus { get; }
    public bool Changed { get; }

    public OrderChangeResult(Order order, OrderStatus? fromStatus, bool changed)
    {
        Order = order;
        FromStatus = fromStatus;
        Changed = changed;
    }

    public static OrderChangeResult ChangedStatus(Order order, OrderStatus fromStatus) => new(order, fromStatus, true);

    public static OrderChangeResult Unchanged(Order order) => new(order, null, false);
}
