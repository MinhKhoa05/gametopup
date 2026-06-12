using System.Security.Claims;
using GameTopUp.Api;
using GameTopUp.BLL.Context;
using GameTopUp.DAL.Entities.Users;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult ApiOk(object? data = null, string? message = null) =>
        Ok(ApiResponse.Ok(data, message));

    protected IActionResult ApiCreated(object? data = null, string? message = null) =>
        StatusCode(StatusCodes.Status201Created, ApiResponse.Ok(data, message));

    protected UserContext CurrentUser
    {
        get
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var displayName = User.FindFirstValue(ClaimTypes.Name) ?? string.Empty;
            var email = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
            var roleClaim = User.FindFirstValue(ClaimTypes.Role) ?? nameof(UserRole.Member);

            return new UserContext
            {
                UserId = long.TryParse(userIdClaim, out var userId) ? userId : 0,
                DisplayName = displayName,
                Email = email,
                Role = Enum.TryParse<UserRole>(roleClaim, ignoreCase: true, out var role) ? role : UserRole.Member
            };
        }
    }
}
