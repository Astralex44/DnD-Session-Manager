namespace DndSessionManager.Api.Repositories;

public interface IUnitOfWork
{
    IQuoteRepository Quotes { get; }
    ICharacterRepository Characters { get; }
    ICharacterLevelSheetRepository CharacterLevelSheets { get; }
    ICharacterSkillRepository CharacterSkills { get; }
    ICharacterSaveRepository CharacterSaves { get; }
    ICharacterAttackRepository CharacterAttacks { get; }
    ICharacterItemRepository CharacterItems { get; }
    ICharacterSpellcastingRepository CharacterSpellcastings { get; }
    ICharacterSpellRepository CharacterSpells { get; }
    ICharacterSpellSlotRepository CharacterSpellSlots { get; }
    IDocumentRepository Documents { get; }
    IDocumentShareRepository DocumentShares { get; }
    ICurrencyDenominationRepository CurrencyDenominations { get; }
    ICharacterCurrencyRepository CharacterCurrencies { get; }
    IShopRepository Shops { get; }
    IShopShareRepository ShopShares { get; }
    IShopItemRepository ShopItems { get; }
    IShopItemPriceRepository ShopItemPrices { get; }
    IPurchaseRepository Purchases { get; }
    IMonsterRepository Monsters { get; }
    ISessionRepository Sessions { get; }
    INoteRepository Notes { get; }
    IInitiativeEntryRepository InitiativeEntries { get; }
    IInitiativeStateRepository InitiativeStates { get; }
    IGameTimerRepository GameTimers { get; }
    ISessionMonsterRepository SessionMonsters { get; }

    // As more vertical slices get built, their repositories get added here
    // too. A facade that touches multiple repositories (e.g. ShopFacade.Purchase,
    // which updates both the character's currency ledger and the shop item's
    // stock) calls SaveChangesAsync() once at the end so both changes commit
    // together.

    Task<int> SaveChangesAsync();
}
