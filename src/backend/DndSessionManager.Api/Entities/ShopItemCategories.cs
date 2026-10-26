namespace DndSessionManager.Api.Entities;

// The DM's fixed list of shop categories (2026-10-26), in display order. The
// shop view groups items in this order. Mirrored in the frontend's
// types/shop.ts SHOP_ITEM_CATEGORIES — change both together.
public static class ShopItemCategories
{
    public const string Miscellaneous = "Miscellaneous";

    public static readonly string[] All =
    [
        "Armor and shields", "Weapons", "Adventuring gear", "Tools",
        "Spellcasting focus", "Gemstones", "Poisons", Miscellaneous,
    ];

    // Case-insensitive match onto the canonical spelling; null when unknown.
    public static string? Normalize(string? value) =>
        All.FirstOrDefault(c => string.Equals(c, value?.Trim(), StringComparison.OrdinalIgnoreCase));
}
