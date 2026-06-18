using GameTopUp.BLL.DTOs.Users;
using GameTopUp.BLL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers;

[Authorize]
[Route("api/users")]
public sealed class UserController : ApiControllerBase
{
    private readonly UserService _userService;

    public UserController(UserService userService)
    {
        _userService = userService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(long id)
    {
        var user = await _userService.GetProfileAsync(CurrentUser, id);
        return ApiOk(user);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var user = await _userService.GetProfileAsync(CurrentUser, CurrentUser.UserId);
        return ApiOk(user);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateUserRequest request)
    {
        await _userService.UpdateProfileAsync(CurrentUser, id, request);
        return ApiOk(null, "User updated successfully.");
    }
}
