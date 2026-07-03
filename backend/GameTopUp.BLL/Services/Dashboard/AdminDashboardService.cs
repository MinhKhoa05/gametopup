using GameTopUp.DAL.Queries;

namespace GameTopUp.BLL.Services.Dashboard;

public sealed class AdminDashboardService
{
    private readonly AdminDashboardQuery _dashboardQuery;

    public AdminDashboardService(AdminDashboardQuery dashboardQuery)
    {
        _dashboardQuery = dashboardQuery;
    }

    public async Task<AdminDashboardStatsResponse> GetStatsAsync()
    {
        return await _dashboardQuery.GetStatsAsync();
    }
}
