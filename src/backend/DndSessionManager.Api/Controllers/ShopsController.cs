using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/shops")]
public class ShopsController(IShopFacade shopFacade) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ShopDto>>> GetAll(Guid gameId) =>
        Ok(await shopFacade.GetShopsForGameAsync(gameId));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ShopDto>> GetById(Guid gameId, Guid id)
    {
        var shop = await shopFacade.GetShopAsync(gameId, id);
        return shop is null ? NotFound() : Ok(shop);
    }

    [HttpPost]
    public async Task<ActionResult<ShopDto>> Create(Guid gameId, [FromBody] CreateShopDto input)
    {
        var shop = await shopFacade.CreateShopAsync(gameId, input);
        return CreatedAtAction(nameof(GetById), new { gameId, id = shop.Id }, shop);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ShopDto>> Update(Guid gameId, Guid id, [FromBody] UpdateShopDto input)
    {
        var shop = await shopFacade.UpdateShopAsync(gameId, id, input);
        return shop is null ? NotFound() : Ok(shop);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid gameId, Guid id) =>
        await shopFacade.DeleteShopAsync(gameId, id) ? NoContent() : NotFound();

    [HttpPut("{id:guid}/shares/{characterId:guid}")]
    public async Task<ActionResult<ShopShareDto>> SetShare(Guid gameId, Guid id, Guid characterId, [FromBody] UpsertShopShareDto input)
    {
        var share = await shopFacade.SetShareAsync(gameId, id, characterId, input);
        return share is null ? NotFound() : Ok(share);
    }

    [HttpDelete("{id:guid}/shares/{characterId:guid}")]
    public async Task<IActionResult> RemoveShare(Guid gameId, Guid id, Guid characterId) =>
        await shopFacade.RemoveShareAsync(gameId, id, characterId) ? NoContent() : NotFound();

    [HttpPost("{id:guid}/items")]
    public async Task<ActionResult<ShopItemDto>> AddItem(Guid gameId, Guid id, [FromBody] CreateShopItemDto input)
    {
        var item = await shopFacade.AddItemAsync(gameId, id, input);
        return item is null ? BadRequest() : Ok(item);
    }

    [HttpPut("{id:guid}/items/{itemId:guid}")]
    public async Task<ActionResult<ShopItemDto>> UpdateItem(Guid gameId, Guid id, Guid itemId, [FromBody] UpdateShopItemDto input)
    {
        var item = await shopFacade.UpdateItemAsync(gameId, id, itemId, input);
        return item is null ? BadRequest() : Ok(item);
    }

    [HttpDelete("{id:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid gameId, Guid id, Guid itemId) =>
        await shopFacade.RemoveItemAsync(gameId, id, itemId) ? NoContent() : NotFound();

    [HttpPost("{id:guid}/items/{itemId:guid}/purchases")]
    public async Task<ActionResult<PurchaseDto>> Purchase(Guid gameId, Guid id, Guid itemId, [FromBody] CreatePurchaseDto input)
    {
        var result = await shopFacade.PurchaseAsync(gameId, id, itemId, input);
        if (result is null) return NotFound();
        return result.Success ? Ok(result.Purchase) : BadRequest(new { error = result.Error });
    }
}
