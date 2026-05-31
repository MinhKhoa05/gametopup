using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using GameTopUp.BLL.Context;
using GameTopUp.DAL.Entities;

namespace GameTopUp.API.Controllers
{
    [ApiController]
    public abstract class ApiControllerBase : ControllerBase
    {
        protected UserContext CurrentUser
        {
            get
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return null!;
                }

                var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
                var role = Enum.TryParse<UserRole>(roleClaim, ignoreCase: true, out var parsedRole)
                    ? parsedRole
                    : UserRole.Member;

                return new UserContext
                {
                    UserId = long.Parse(userIdClaim.Value),
                    Username = User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty,
                    Role = role
                };
            }
        }

        protected IActionResult ApiOk(object? data = null, string? message = null)
        {
            return Ok(ApiResponse.Ok(data, message));
        }

        protected IActionResult ApiCreated(object? data = null, string? message = null)
        {
            return StatusCode(201, ApiResponse.Ok(data, message));
        }
    }
}
