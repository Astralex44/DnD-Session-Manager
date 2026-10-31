using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Hubs;
using DndSessionManager.Api.Repositories;

namespace DndSessionManager.Api.Facades;

public class ShopFacade(IUnitOfWork unitOfWork, IGameEventsBroadcaster broadcaster) : IShopFacade
{
    public async Task<IReadOnlyList<ShopDto>> GetShopsForGameAsync(Guid gameId, GameCaller caller)
    {
        var shops = await unitOfWork.Shops.GetByGameIdAsync(gameId);
        var characters = await unitOfWork.Characters.GetByGameIdAsync(gameId);
        var characterNames = characters.ToDictionary(c => c.Id, c => c.Name);
        if (caller.IsDm) return shops.Select(shop => ToDto(shop, characterNames)).ToList();

        var own = OwnCharacterIds(characters, caller);
        return shops
            .Where(shop => shop.Shares.Any(share => own.Contains(share.CharacterId)))
            .Select(shop => ToDto(shop, characterNames, own))
            .ToList();
    }

    public async Task<ShopDto?> GetShopAsync(Guid gameId, Guid shopId, GameCaller caller)
    {
        var shop = await GetOwnedShopAsync(gameId, shopId);
        if (shop is null) return null;

        var characters = await unitOfWork.Characters.GetByGameIdAsync(gameId);
        var characterNames = characters.ToDictionary(c => c.Id, c => c.Name);
        if (caller.IsDm) return ToDto(shop, characterNames);

        var own = OwnCharacterIds(characters, caller);
        return shop.Shares.Any(share => own.Contains(share.CharacterId)) ? ToDto(shop, characterNames, own) : null;
    }

    public async Task<ShopDto> CreateShopAsync(Guid gameId, CreateShopDto input)
    {
        var shop = new Shop { Id = Guid.NewGuid(), GameId = gameId, Name = input.Name.Trim(), Description = input.Description, Location = input.Location.Trim() };
        await unitOfWork.Shops.AddAsync(shop);
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "shops");
        return ToDto(shop, new Dictionary<Guid, string>());
    }

    public async Task<ShopDto?> UpdateShopAsync(Guid gameId, Guid shopId, UpdateShopDto input)
    {
        var shop = await GetOwnedShopAsync(gameId, shopId);
        if (shop is null) return null;

        shop.Name = input.Name.Trim();
        shop.Description = input.Description;
        shop.Location = input.Location.Trim();

        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "shops");
        var characterNames = await CharacterNamesForGameAsync(gameId);
        return ToDto(shop, characterNames);
    }

    public async Task<bool> DeleteShopAsync(Guid gameId, Guid shopId)
    {
        var shop = await GetOwnedShopAsync(gameId, shopId);
        if (shop is null) return false;

        unitOfWork.Shops.Remove(shop);
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "shops");
        return true;
    }

    public async Task<(ShopShareDto? Share, bool Forbidden)> SetShareAsync(
        Guid gameId, Guid shopId, Guid characterId, UpsertShopShareDto input, GameCaller caller)
    {
        if (await GetOwnedShopAsync(gameId, shopId) is null) return (null, false);

        var character = await unitOfWork.Characters.GetByIdAsync(characterId);
        if (character is null || character.GameId != gameId) return (null, false);

        var share = await unitOfWork.ShopShares.GetByShopAndCharacterAsync(shopId, characterId);
        if (!caller.IsDm && (character.OwnerUserId != caller.UserId || share is null)) return (null, true);

        if (share is null)
        {
            share = new ShopShare { Id = Guid.NewGuid(), ShopId = shopId, CharacterId = characterId };
            await unitOfWork.ShopShares.AddAsync(share);
        }

        share.Hidden = input.Hidden;
        share.Locked = input.Locked;

        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "shops");
        return (new ShopShareDto(share.Id, share.CharacterId, character.Name, share.Hidden, share.Locked), false);
    }

    public async Task<bool> RemoveShareAsync(Guid gameId, Guid shopId, Guid characterId)
    {
        if (await GetOwnedShopAsync(gameId, shopId) is null) return false;

        var share = await unitOfWork.ShopShares.GetByShopAndCharacterAsync(shopId, characterId);
        if (share is null) return false;

        unitOfWork.ShopShares.Remove(share);
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "shops");
        return true;
    }

    public async Task<bool> ShareWithAllAsync(Guid gameId, Guid shopId)
    {
        var shop = await GetOwnedShopAsync(gameId, shopId);
        if (shop is null) return false;

        foreach (var character in await unitOfWork.Characters.GetByGameIdAsync(gameId))
        {
            var share = shop.Shares.FirstOrDefault(s => s.CharacterId == character.Id);
            if (share is null)
            {
                await unitOfWork.ShopShares.AddAsync(new ShopShare { Id = Guid.NewGuid(), ShopId = shopId, CharacterId = character.Id });
            }
            else
            {
                share.Hidden = false;
            }
        }

        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "shops");
        return true;
    }

    public async Task<bool> RemoveAllSharesAsync(Guid gameId, Guid shopId)
    {
        var shop = await GetOwnedShopAsync(gameId, shopId);
        if (shop is null) return false;

        foreach (var share in shop.Shares.ToList()) unitOfWork.ShopShares.Remove(share);
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "shops");
        return true;
    }

    public async Task<ShopDto?> SetSaleModeForAllItemsAsync(Guid gameId, Guid shopId, SetShopSaleModeDto input)
    {
        if (!Enum.TryParse<ShopSaleMode>(input.SaleMode, true, out var mode)) return null;
        var shop = await GetOwnedShopAsync(gameId, shopId);
        if (shop is null) return null;

        foreach (var item in shop.Items)
        {
            item.SaleMode = mode;
            // A per-player item needs a limit; keep an existing one, default to 1
            // (the spec's "each player can buy it once"). Shared stock keeps its
            // existing count — null means unlimited.
            if (mode == ShopSaleMode.PerPlayerLimited) item.MaxPerCharacter ??= 1;
        }

        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "shops");
        return ToDto(shop, await CharacterNamesForGameAsync(gameId));
    }

    public async Task<ShopItemDto?> AddItemAsync(Guid gameId, Guid shopId, CreateShopItemDto input)
    {
        if (await GetOwnedShopAsync(gameId, shopId) is null) return null;
        if (!await AllDenominationsBelongToGameAsync(gameId, input.Prices.Select(p => p.DenominationId))) return null;
        if (ShopItemCategories.Normalize(input.Category) is not { } category) return null;

        var item = new ShopItem
        {
            Id = Guid.NewGuid(),
            ShopId = shopId,
            Name = input.Name.Trim(),
            Description = input.Description,
            Icon = input.Icon,
            Category = category,
            Weight = input.Weight,
            SaleMode = ParseSaleMode(input.SaleMode),
            StockQuantity = input.StockQuantity,
            MaxPerCharacter = input.MaxPerCharacter,
        };
        foreach (var price in input.Prices)
        {
            item.Prices.Add(new ShopItemPrice { Id = Guid.NewGuid(), ShopItemId = item.Id, CurrencyDenominationId = price.DenominationId, Amount = price.Amount });
        }

        await unitOfWork.ShopItems.AddAsync(item);
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "shops");

        var saved = await unitOfWork.ShopItems.GetByIdAsync(item.Id);
        return saved is null ? null : ToItemDto(saved);
    }

    public async Task<ShopItemDto?> UpdateItemAsync(Guid gameId, Guid shopId, Guid itemId, UpdateShopItemDto input)
    {
        if (await GetOwnedShopAsync(gameId, shopId) is null) return null;
        var item = await unitOfWork.ShopItems.GetByIdAsync(itemId);
        if (item is null || item.ShopId != shopId) return null;
        if (!await AllDenominationsBelongToGameAsync(gameId, input.Prices.Select(p => p.DenominationId))) return null;
        if (ShopItemCategories.Normalize(input.Category) is not { } category) return null;

        item.Name = input.Name.Trim();
        item.Description = input.Description;
        item.Icon = input.Icon;
        item.Category = category;
        item.Weight = input.Weight;
        item.SaleMode = ParseSaleMode(input.SaleMode);
        item.StockQuantity = input.StockQuantity;
        item.MaxPerCharacter = input.MaxPerCharacter;

        foreach (var existingPrice in await unitOfWork.ShopItemPrices.GetByShopItemIdAsync(itemId))
        {
            unitOfWork.ShopItemPrices.Remove(existingPrice);
        }
        foreach (var price in input.Prices)
        {
            await unitOfWork.ShopItemPrices.AddAsync(new ShopItemPrice { Id = Guid.NewGuid(), ShopItemId = itemId, CurrencyDenominationId = price.DenominationId, Amount = price.Amount });
        }

        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "shops");
        var saved = await unitOfWork.ShopItems.GetByIdAsync(itemId);
        return saved is null ? null : ToItemDto(saved);
    }

    public async Task<bool> RemoveItemAsync(Guid gameId, Guid shopId, Guid itemId)
    {
        if (await GetOwnedShopAsync(gameId, shopId) is null) return false;
        var item = await unitOfWork.ShopItems.GetByIdAsync(itemId);
        if (item is null || item.ShopId != shopId) return false;

        unitOfWork.ShopItems.Remove(item);
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "shops");
        return true;
    }

    // Exact-denomination, no-conversion purchase (see wiki/Decision-Log.md "Shop:
    // shared stock vs. per-player limit" and the currency house rule): every
    // price component must be paid in full in its own denomination, nothing is
    // converted or substituted, and the whole check-and-debit happens in one
    // SaveChangesAsync call so it commits atomically.
    public async Task<(PurchaseResultDto? Result, bool Forbidden)> PurchaseAsync(
        Guid gameId, Guid shopId, Guid itemId, CreatePurchaseDto input, GameCaller caller)
    {
        var shop = await GetOwnedShopAsync(gameId, shopId);
        if (shop is null) return (null, false);
        var item = await unitOfWork.ShopItems.GetByIdAsync(itemId);
        if (item is null || item.ShopId != shopId) return (null, false);

        var character = await unitOfWork.Characters.GetByIdAsync(input.CharacterId);
        if (character is null || character.GameId != gameId) return (null, false);

        if (!caller.IsDm)
        {
            var ownsCharacter = character.OwnerUserId == caller.UserId;
            var sharedWithCharacter = shop.Shares.Any(share => share.CharacterId == character.Id);
            var negotiatedPrice = input.OverridePrices is { Count: > 0 };
            if (!ownsCharacter || !sharedWithCharacter || negotiatedPrice) return (null, true);
        }

        return (await PurchaseCheckedAsync(gameId, item, character, input), false);
    }

    private async Task<PurchaseResultDto> PurchaseCheckedAsync(Guid gameId, ShopItem item, Character character, CreatePurchaseDto input)
    {
        var itemId = item.Id;

        if (item.SaleMode == ShopSaleMode.SharedStock)
        {
            if (item.StockQuantity is { } stock && stock < input.Quantity)
            {
                return new PurchaseResultDto(false, "Not enough stock left.", null);
            }
        }
        else
        {
            var alreadyBought = (await unitOfWork.Purchases.GetByShopItemAndCharacterAsync(itemId, character.Id)).Sum(p => p.Quantity);
            if (item.MaxPerCharacter is { } max && alreadyBought + input.Quantity > max)
            {
                return new PurchaseResultDto(false, $"Limit reached — this character can buy at most {max} of this item.", null);
            }
        }

        // A DM negotiating a price mid-session can charge something other than the
        // item's configured price for this one sale. Null/empty OverridePrices means
        // "use the item's normal price" — the pre-existing behavior.
        List<(Guid DenominationId, int Amount, string Abbreviation, string Color)> effectivePrices;
        if (input.OverridePrices is { Count: > 0 })
        {
            var denominationIds = input.OverridePrices.Select(p => p.DenominationId).ToList();
            if (!await AllDenominationsBelongToGameAsync(gameId, denominationIds))
            {
                return new PurchaseResultDto(false, "Invalid price override — unknown currency denomination.", null);
            }

            var denominations = (await unitOfWork.CurrencyDenominations.GetByGameIdAsync(gameId)).ToDictionary(d => d.Id);
            effectivePrices = input.OverridePrices
                .Select(p => (p.DenominationId, p.Amount, denominations[p.DenominationId].Abbreviation, denominations[p.DenominationId].Color))
                .ToList();
        }
        else
        {
            effectivePrices = item.Prices
                .Select(p => (p.CurrencyDenominationId, p.Amount, p.CurrencyDenomination?.Abbreviation ?? "?", p.CurrencyDenomination?.Color ?? ""))
                .ToList();
        }

        var wallet = await unitOfWork.CharacterCurrencies.GetByCharacterIdAsync(character.Id);
        var walletByDenomination = wallet.ToDictionary(c => c.CurrencyDenominationId, c => c);

        foreach (var price in effectivePrices)
        {
            var required = price.Amount * input.Quantity;
            var held = walletByDenomination.GetValueOrDefault(price.DenominationId)?.Quantity ?? 0;
            if (held < required)
            {
                return new PurchaseResultDto(false, $"Not enough {price.Abbreviation} — needs {required}, has {held}.", null);
            }
        }

        foreach (var price in effectivePrices)
        {
            walletByDenomination[price.DenominationId].Quantity -= price.Amount * input.Quantity;
        }

        if (item.SaleMode == ShopSaleMode.SharedStock && item.StockQuantity is { } currentStock)
        {
            item.StockQuantity = currentStock - input.Quantity;
        }

        var purchase = new Purchase
        {
            Id = Guid.NewGuid(),
            ShopItemId = itemId,
            CharacterId = character.Id,
            Quantity = input.Quantity,
            PurchasedAt = DateTime.UtcNow,
        };
        await unitOfWork.Purchases.AddAsync(purchase);
        await AddToInventoryAsync(character.Id, item, input.Quantity);
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "shops");
        await broadcaster.NotifyAsync(gameId, "characters");

        var totalPaid = effectivePrices
            .Select(p => new ShopItemPriceDto(p.DenominationId, p.Abbreviation, p.Color, p.Amount * input.Quantity))
            .ToList();
        return new PurchaseResultDto(true, null, new PurchaseDto(purchase.Id, item.Id, item.Name, character.Id, character.Name, purchase.Quantity, purchase.PurchasedAt, totalPaid));
    }

    // A bought item lands in the buyer's inventory in the same save as the coins
    // and stock. Same name already there (case-insensitive) → the quantity goes
    // up on that row instead of adding a duplicate (DM request 2026-10-26).
    private async Task AddToInventoryAsync(Guid characterId, ShopItem item, int quantity)
    {
        var inventory = await unitOfWork.CharacterItems.GetByCharacterIdAsync(characterId);
        var existing = inventory.FirstOrDefault(i => string.Equals(i.Name.Trim(), item.Name.Trim(), StringComparison.OrdinalIgnoreCase));
        if (existing is not null)
        {
            existing.Quantity += quantity;
            return;
        }

        await unitOfWork.CharacterItems.AddAsync(new CharacterItem
        {
            Id = Guid.NewGuid(),
            CharacterId = characterId,
            Category = item.Category,
            Name = item.Name.Trim(),
            Quantity = quantity,
            Weight = item.Weight,
            Description = item.Description,
        });
    }

    private async Task<bool> AllDenominationsBelongToGameAsync(Guid gameId, IEnumerable<Guid> denominationIds)
    {
        var gameDenominationIds = (await unitOfWork.CurrencyDenominations.GetByGameIdAsync(gameId)).Select(d => d.Id).ToHashSet();
        return denominationIds.All(gameDenominationIds.Contains);
    }

    private static ShopSaleMode ParseSaleMode(string value) =>
        Enum.TryParse<ShopSaleMode>(value, true, out var mode) ? mode : ShopSaleMode.SharedStock;

    private async Task<Shop?> GetOwnedShopAsync(Guid gameId, Guid shopId)
    {
        var shop = await unitOfWork.Shops.GetByIdAsync(shopId);
        return shop is not null && shop.GameId == gameId ? shop : null;
    }

    private async Task<Dictionary<Guid, string>> CharacterNamesForGameAsync(Guid gameId) =>
        (await unitOfWork.Characters.GetByGameIdAsync(gameId)).ToDictionary(c => c.Id, c => c.Name);

    private static HashSet<Guid> OwnCharacterIds(IEnumerable<Character> characters, GameCaller caller) =>
        characters.Where(c => c.OwnerUserId == caller.UserId).Select(c => c.Id).ToHashSet();

    // onlyCharacters: a player's view — other characters' share rows left out.
    private static ShopDto ToDto(Shop shop, IReadOnlyDictionary<Guid, string> characterNames, IReadOnlySet<Guid>? onlyCharacters = null) => new(
        shop.Id, shop.GameId, shop.Name, shop.Description, shop.Location,
        shop.Items.Select(ToItemDto).ToList(),
        shop.Shares.Where(share => onlyCharacters is null || onlyCharacters.Contains(share.CharacterId)).Select(share => new ShopShareDto(
            share.Id, share.CharacterId, characterNames.GetValueOrDefault(share.CharacterId, "Unknown"),
            share.Hidden, share.Locked)).ToList());

    private static ShopItemDto ToItemDto(ShopItem item) => new(
        item.Id, item.Name, item.Description, item.Icon, item.Category, item.Weight, item.SaleMode.ToString(),
        item.StockQuantity, item.MaxPerCharacter,
        item.Prices.Select(p => new ShopItemPriceDto(p.CurrencyDenominationId, p.CurrencyDenomination?.Abbreviation ?? "?", p.CurrencyDenomination?.Color ?? "", p.Amount)).ToList());
}
