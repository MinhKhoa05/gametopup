using GameTopUp.BLL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/users")]
public sealed class AdminUserController : ApiControllerBase
{
    private readonly UserService _userService;

    public AdminUserController(UserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _userService.GetAllAsync(page, pageSize);
        return ApiOk(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        await _userService.DeleteAsync(id);
        return ApiOk(null, "User deleted successfully.");
    }
}
