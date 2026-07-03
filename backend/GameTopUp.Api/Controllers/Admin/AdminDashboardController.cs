using GameTopUp.BLL.Services.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/dashboard")]
public sealed class AdminDashboardController : ApiControllerBase
{
    private readonly AdminDashboardService _dashboardService;

    public AdminDashboardController(AdminDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _dashboardService.GetStatsAsync();
        return ApiOk(stats);
    }
}
