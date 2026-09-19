using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/locks/{resourceType}/{resourceKey}")]
public class AccessLocksController(IAccessLockFacade accessLockFacade) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<AccessLockStatusDto>> GetStatus(Guid gameId, string resourceType, string resourceKey) =>
        Ok(await accessLockFacade.GetStatusAsync(gameId, resourceType, resourceKey));

    [HttpPost("set")]
    public async Task<ActionResult<AccessCodeResultDto>> SetCode(Guid gameId, string resourceType, string resourceKey, [FromBody] SetAccessCodeDto input) =>
        Ok(await accessLockFacade.SetCodeAsync(gameId, resourceType, resourceKey, input));

    [HttpPost("verify")]
    public async Task<ActionResult<AccessCodeResultDto>> Verify(Guid gameId, string resourceType, string resourceKey, [FromBody] VerifyAccessCodeDto input)
    {
        var ok = await accessLockFacade.VerifyCodeAsync(gameId, resourceType, resourceKey, input.Code);
        return Ok(new AccessCodeResultDto(ok, ok ? null : "Code is incorrect."));
    }

    [HttpDelete]
    public async Task<ActionResult<AccessCodeResultDto>> Remove(Guid gameId, string resourceType, string resourceKey, [FromBody] VerifyAccessCodeDto input) =>
        Ok(await accessLockFacade.RemoveCodeAsync(gameId, resourceType, resourceKey, input.Code));
}
