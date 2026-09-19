using DndSessionManager.Api.Data;

namespace DndSessionManager.Api.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(
        AppDbContext context,
        IQuoteRepository quotes,
        ICharacterRepository characters,
        ICharacterLevelSheetRepository characterLevelSheets,
        ICharacterSkillRepository characterSkills,
        ICharacterSaveRepository characterSaves,
        ICharacterAttackRepository characterAttacks,
        ICharacterItemRepository characterItems,
        ICharacterSpellcastingRepository characterSpellcastings,
        ICharacterSpellRepository characterSpells,
        ICharacterSpellSlotRepository characterSpellSlots,
        IDocumentRepository documents,
        IDocumentShareRepository documentShares,
        ICurrencyDenominationRepository currencyDenominations,
        ICharacterCurrencyRepository characterCurrencies,
        IShopRepository shops,
        IShopShareRepository shopShares,
        IShopItemRepository shopItems,
        IShopItemPriceRepository shopItemPrices,
        IPurchaseRepository purchases,
        IMonsterRepository monsters,
        ISessionRepository sessions,
        INoteRepository notes,
        IInitiativeEntryRepository initiativeEntries,
        IInitiativeStateRepository initiativeStates,
        IGameTimerRepository gameTimers,
        ISessionMonsterRepository sessionMonsters)
    {
        _context = context;
        Quotes = quotes;
        Characters = characters;
        CharacterLevelSheets = characterLevelSheets;
        CharacterSkills = characterSkills;
        CharacterSaves = characterSaves;
        CharacterAttacks = characterAttacks;
        CharacterItems = characterItems;
        CharacterSpellcastings = characterSpellcastings;
        CharacterSpells = characterSpells;
        CharacterSpellSlots = characterSpellSlots;
        Documents = documents;
        DocumentShares = documentShares;
        CurrencyDenominations = currencyDenominations;
        CharacterCurrencies = characterCurrencies;
        Shops = shops;
        ShopShares = shopShares;
        ShopItems = shopItems;
        ShopItemPrices = shopItemPrices;
        Purchases = purchases;
        Monsters = monsters;
        Sessions = sessions;
        Notes = notes;
        InitiativeEntries = initiativeEntries;
        InitiativeStates = initiativeStates;
        GameTimers = gameTimers;
        SessionMonsters = sessionMonsters;
    }

    public IQuoteRepository Quotes { get; }
    public ICharacterRepository Characters { get; }
    public ICharacterLevelSheetRepository CharacterLevelSheets { get; }
    public ICharacterSkillRepository CharacterSkills { get; }
    public ICharacterSaveRepository CharacterSaves { get; }
    public ICharacterAttackRepository CharacterAttacks { get; }
    public ICharacterItemRepository CharacterItems { get; }
    public ICharacterSpellcastingRepository CharacterSpellcastings { get; }
    public ICharacterSpellRepository CharacterSpells { get; }
    public ICharacterSpellSlotRepository CharacterSpellSlots { get; }
    public IDocumentRepository Documents { get; }
    public IDocumentShareRepository DocumentShares { get; }
    public ICurrencyDenominationRepository CurrencyDenominations { get; }
    public ICharacterCurrencyRepository CharacterCurrencies { get; }
    public IShopRepository Shops { get; }
    public IShopShareRepository ShopShares { get; }
    public IShopItemRepository ShopItems { get; }
    public IShopItemPriceRepository ShopItemPrices { get; }
    public IPurchaseRepository Purchases { get; }
    public IMonsterRepository Monsters { get; }
    public ISessionRepository Sessions { get; }
    public INoteRepository Notes { get; }
    public IInitiativeEntryRepository InitiativeEntries { get; }
    public IInitiativeStateRepository InitiativeStates { get; }
    public IGameTimerRepository GameTimers { get; }
    public ISessionMonsterRepository SessionMonsters { get; }

    public async Task<int> SaveChangesAsync() =>
        await _context.SaveChangesAsync();
}
