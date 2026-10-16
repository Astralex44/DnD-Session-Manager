using System.Security.Claims;
using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthFacade authFacade) : ControllerBase
{
    // Kicks off the Discord OAuth handshake — AuthenticationHandler.OnCreatingTicket
    // (see Program.cs) does the actual find-or-create and signs the cookie.
    [HttpGet("login")]
    public IActionResult Login([FromQuery] string? returnUrl) =>
        Challenge(new AuthenticationProperties { RedirectUri = returnUrl ?? "/" }, "Discord");

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<MeDto>> Me()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var result = await authFacade.GetMeAsync(userId);
        if (result is null) return Unauthorized();

        var (user, membership) = result.Value;
        return Ok(new MeDto(user.Id, user.Username, user.AvatarUrl, membership.GameId, membership.Role.ToString()));
    }
}
