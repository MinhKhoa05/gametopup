using System.Security.Claims;
using GameTopUp.Api;
using GameTopUp.BLL.Context;
using GameTopUp.DAL.Entities.Users;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult ApiOk() => Ok(ApiResponse.Ok());

    protected IActionResult ApiOk<T>(T? data) => Ok(ApiResponse.Ok(data));

    protected IActionResult ApiCreated<T>(T? data)
        => StatusCode(StatusCodes.Status201Created, ApiResponse.Ok(data));

    protected UserContext CurrentUser
    {
        get
        {
            var roleClaim = User.FindFirstValue(ClaimTypes.Role) ?? nameof(UserRole.Member);

            return new UserContext
            {
                UserId = long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId) ? userId : 0,
                DisplayName = User.FindFirstValue(ClaimTypes.Name) ?? string.Empty,
                Email = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty,
                Role = Enum.TryParse<UserRole>(roleClaim, ignoreCase: true, out var role) ? role : UserRole.Member
            };
        }
    }
}
