using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.DAL.Entities.Orders;

namespace GameTopUp.BLL.Mappers.Orders;

public static class OrderTimelineMapper
{
    public static OrderTimelineResponseDTO ToTimelineResponse(Order order, IReadOnlyCollection<OrderHistory> histories)
    {
        return new OrderTimelineResponseDTO
        {
            Status = order.Status,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,
            AssignedAt = order.AssignedAt,
            Events = histories
                .OrderBy(history => history.CreatedAt)
                .Select(ToEventResponse)
                .ToList(),
        };
    }

    private static OrderTimelineEventResponseDTO ToEventResponse(OrderHistory history)
    {
        return new OrderTimelineEventResponseDTO
        {
            FromStatus = history.FromStatus,
            ToStatus = history.ToStatus,
            Note = history.Note,
            ActionBy = history.ActionBy,
            IsAdmin = history.IsAdmin,
            CreatedAt = history.CreatedAt,
        };
    }
}
