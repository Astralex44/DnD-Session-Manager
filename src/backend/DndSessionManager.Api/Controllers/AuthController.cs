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
public class AuthController(IAuthFacade authFacade, IConfiguration configuration) : ControllerBase
{
    // Kicks off the Discord OAuth handshake — OnCreatingTicket (see Program.cs)
    // applies the login rules and signs the cookie. returnUrl is a frontend
    // path only ("/board"); anything else is ignored so this can't be used as
    // an open redirect to another site.
    [HttpGet("login")]
    public IActionResult Login([FromQuery] string? returnUrl)
    {
        var frontendBaseUrl = (configuration["Frontend:BaseUrl"] ?? string.Empty).TrimEnd('/');
        var path = returnUrl is not null && returnUrl.StartsWith('/') && !returnUrl.StartsWith("//") ? returnUrl : "/";
        return Challenge(new AuthenticationProperties { RedirectUri = frontendBaseUrl + path }, "Discord");
    }

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
