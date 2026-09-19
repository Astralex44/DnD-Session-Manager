using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Game> Games => Set<Game>();
    public DbSet<Quote> Quotes => Set<Quote>();
    public DbSet<Character> Characters => Set<Character>();
    public DbSet<CharacterLevelSheet> CharacterLevelSheets => Set<CharacterLevelSheet>();
    public DbSet<CharacterSkill> CharacterSkills => Set<CharacterSkill>();
    public DbSet<CharacterSave> CharacterSaves => Set<CharacterSave>();
    public DbSet<CharacterAttack> CharacterAttacks => Set<CharacterAttack>();
    public DbSet<CharacterItem> CharacterItems => Set<CharacterItem>();
    public DbSet<CharacterSpellcasting> CharacterSpellcastings => Set<CharacterSpellcasting>();
    public DbSet<CharacterSpell> CharacterSpells => Set<CharacterSpell>();
    public DbSet<CharacterSpellSlot> CharacterSpellSlots => Set<CharacterSpellSlot>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<DocumentShare> DocumentShares => Set<DocumentShare>();
    public DbSet<CurrencyDenomination> CurrencyDenominations => Set<CurrencyDenomination>();
    public DbSet<CharacterCurrency> CharacterCurrencies => Set<CharacterCurrency>();
    public DbSet<Shop> Shops => Set<Shop>();
    public DbSet<ShopShare> ShopShares => Set<ShopShare>();
    public DbSet<ShopItem> ShopItems => Set<ShopItem>();
    public DbSet<ShopItemPrice> ShopItemPrices => Set<ShopItemPrice>();
    public DbSet<Purchase> Purchases => Set<Purchase>();
    public DbSet<Monster> Monsters => Set<Monster>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<InitiativeEntry> InitiativeEntries => Set<InitiativeEntry>();
    public DbSet<InitiativeState> InitiativeStates => Set<InitiativeState>();
    public DbSet<GameTimer> GameTimers => Set<GameTimer>();
    public DbSet<SessionMonster> SessionMonsters => Set<SessionMonster>();
    public DbSet<AccessLock> AccessLocks => Set<AccessLock>();

    // As more entities from the ERD get their own vertical slice, they get
    // added here (DbSet<Character>, DbSet<Document>, ...) and configured below.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Game>(entity =>
        {
            entity.Property(g => g.Name).IsRequired().HasMaxLength(200);
        });

        modelBuilder.Entity<Quote>(entity =>
        {
            entity.Property(q => q.Text).IsRequired().HasMaxLength(2000);

            entity.HasOne(q => q.Game)
                  .WithMany(g => g.Quotes)
                  .HasForeignKey(q => q.GameId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Deleting a session un-links its quotes rather than deleting them —
            // the quote itself is still worth keeping.
            entity.HasOne(q => q.Session)
                  .WithMany()
                  .HasForeignKey(q => q.SessionId)
                  .OnDelete(DeleteBehavior.SetNull);

            // Same for the attributed character — deleting the character
            // shouldn't take their quotes down with them.
            entity.HasOne(q => q.Character)
                  .WithMany()
                  .HasForeignKey(q => q.CharacterId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Character>(entity =>
        {
            entity.Property(character => character.Name).IsRequired().HasMaxLength(200);
            entity.Property(character => character.Race).HasMaxLength(100);
            entity.Property(character => character.Class).IsRequired().HasMaxLength(100);
            entity.Property(character => character.PlayerName).HasMaxLength(200);
            entity.Property(character => character.Status).IsRequired().HasMaxLength(30);
            entity.HasOne(character => character.Game)
                  .WithMany()
                  .HasForeignKey(character => character.GameId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(character => character.LevelSheets)
                  .WithOne(sheet => sheet.Character)
                  .HasForeignKey(sheet => sheet.CharacterId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(character => character.ActiveLevelSheet)
                  .WithMany()
                  .HasForeignKey(character => character.ActiveLevelSheetId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<CharacterLevelSheet>(entity =>
        {
            entity.Property(sheet => sheet.Level).IsRequired();
        });

        modelBuilder.Entity<CharacterSkill>(entity =>
        {
            entity.Property(skill => skill.SkillName).IsRequired().HasMaxLength(50);
            entity.HasOne(skill => skill.Character)
                  .WithMany(character => character.Skills)
                  .HasForeignKey(skill => skill.CharacterId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CharacterSave>(entity =>
        {
            entity.Property(save => save.Ability).IsRequired().HasMaxLength(20);
            entity.HasOne(save => save.Character)
                  .WithMany(character => character.Saves)
                  .HasForeignKey(save => save.CharacterId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CharacterAttack>(entity =>
        {
            entity.Property(attack => attack.Name).IsRequired().HasMaxLength(200);
            entity.HasOne(attack => attack.Character)
                  .WithMany(character => character.Attacks)
                  .HasForeignKey(attack => attack.CharacterId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CharacterItem>(entity =>
        {
            entity.Property(item => item.Name).IsRequired().HasMaxLength(200);
            entity.Property(item => item.Weight).HasPrecision(10, 2);
            entity.HasOne(item => item.Character)
                  .WithMany(character => character.Items)
                  .HasForeignKey(item => item.CharacterId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CharacterSpellcasting>(entity =>
        {
            entity.Property(spellcasting => spellcasting.Class).IsRequired().HasMaxLength(100);
            entity.HasOne(spellcasting => spellcasting.LevelSheet)
                  .WithOne(sheet => sheet.Spellcasting)
                  .HasForeignKey<CharacterSpellcasting>(spellcasting => spellcasting.LevelSheetId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CharacterSpell>(entity =>
        {
            entity.Property(spell => spell.Name).IsRequired().HasMaxLength(200);
            entity.HasOne(spell => spell.LevelSheet)
                  .WithMany(sheet => sheet.Spells)
                  .HasForeignKey(spell => spell.LevelSheetId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CharacterSpellSlot>(entity =>
        {
            entity.HasOne(slot => slot.LevelSheet)
                  .WithMany(sheet => sheet.SpellSlots)
                  .HasForeignKey(slot => slot.LevelSheetId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Document>(entity =>
        {
            entity.Property(doc => doc.Name).IsRequired().HasMaxLength(200);
            entity.Property(doc => doc.FileUrl).IsRequired();
            entity.Property(doc => doc.Type).IsRequired().HasConversion<string>().HasMaxLength(20);
            entity.HasOne(doc => doc.Game)
                  .WithMany()
                  .HasForeignKey(doc => doc.GameId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DocumentShare>(entity =>
        {
            entity.HasIndex(share => new { share.DocumentId, share.CharacterId }).IsUnique();
            entity.HasOne(share => share.Document)
                  .WithMany(doc => doc.Shares)
                  .HasForeignKey(share => share.DocumentId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(share => share.Character)
                  .WithMany()
                  .HasForeignKey(share => share.CharacterId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CurrencyDenomination>(entity =>
        {
            entity.Property(d => d.Name).IsRequired().HasMaxLength(50);
            entity.Property(d => d.Abbreviation).IsRequired().HasMaxLength(10);
            entity.Property(d => d.Color).IsRequired().HasMaxLength(20);
            entity.HasOne(d => d.Game)
                  .WithMany()
                  .HasForeignKey(d => d.GameId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CharacterCurrency>(entity =>
        {
            entity.HasIndex(c => new { c.CharacterId, c.CurrencyDenominationId }).IsUnique();
            entity.HasOne(c => c.Character)
                  .WithMany(character => character.Currencies)
                  .HasForeignKey(c => c.CharacterId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(c => c.CurrencyDenomination)
                  .WithMany()
                  .HasForeignKey(c => c.CurrencyDenominationId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Shop>(entity =>
        {
            entity.Property(shop => shop.Name).IsRequired().HasMaxLength(200);
            entity.HasOne(shop => shop.Game)
                  .WithMany()
                  .HasForeignKey(shop => shop.GameId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ShopShare>(entity =>
        {
            entity.HasIndex(share => new { share.ShopId, share.CharacterId }).IsUnique();
            entity.HasOne(share => share.Shop)
                  .WithMany(shop => shop.Shares)
                  .HasForeignKey(share => share.ShopId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(share => share.Character)
                  .WithMany()
                  .HasForeignKey(share => share.CharacterId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ShopItem>(entity =>
        {
            entity.Property(item => item.Name).IsRequired().HasMaxLength(200);
            entity.Property(item => item.SaleMode).HasConversion<string>().HasMaxLength(30);
            entity.HasOne(item => item.Shop)
                  .WithMany(shop => shop.Items)
                  .HasForeignKey(item => item.ShopId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ShopItemPrice>(entity =>
        {
            entity.HasOne(price => price.ShopItem)
                  .WithMany(item => item.Prices)
                  .HasForeignKey(price => price.ShopItemId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(price => price.CurrencyDenomination)
                  .WithMany()
                  .HasForeignKey(price => price.CurrencyDenominationId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Purchase>(entity =>
        {
            entity.HasOne(purchase => purchase.ShopItem)
                  .WithMany()
                  .HasForeignKey(purchase => purchase.ShopItemId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(purchase => purchase.Character)
                  .WithMany()
                  .HasForeignKey(purchase => purchase.CharacterId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Monster>(entity =>
        {
            entity.Property(monster => monster.Name).IsRequired().HasMaxLength(200);
            entity.Property(monster => monster.FileUrl).IsRequired();
            entity.HasOne(monster => monster.Game)
                  .WithMany()
                  .HasForeignKey(monster => monster.GameId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Session>(entity =>
        {
            entity.Property(session => session.Title).HasMaxLength(200);
            entity.HasOne(session => session.Game)
                  .WithMany()
                  .HasForeignKey(session => session.GameId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Note>(entity =>
        {
            entity.Property(note => note.OwnerName).IsRequired().HasMaxLength(100);
            entity.Property(note => note.Title).IsRequired().HasMaxLength(200);
            // Not unique — a person can have many pages now, not just one.
            entity.HasIndex(note => new { note.GameId, note.OwnerName });
            entity.HasOne(note => note.Game)
                  .WithMany()
                  .HasForeignKey(note => note.GameId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<InitiativeEntry>(entity =>
        {
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.HasOne(e => e.Game)
                  .WithMany()
                  .HasForeignKey(e => e.GameId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<InitiativeState>(entity =>
        {
            entity.HasIndex(s => s.GameId).IsUnique();
            entity.HasOne(s => s.Game)
                  .WithMany()
                  .HasForeignKey(s => s.GameId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<GameTimer>(entity =>
        {
            entity.Property(t => t.Label).IsRequired().HasMaxLength(200);
            entity.HasOne(t => t.Game)
                  .WithMany()
                  .HasForeignKey(t => t.GameId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SessionMonster>(entity =>
        {
            entity.Property(m => m.Name).IsRequired().HasMaxLength(200);
            entity.HasOne(m => m.Game)
                  .WithMany()
                  .HasForeignKey(m => m.GameId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(m => m.Monster)
                  .WithMany()
                  .HasForeignKey(m => m.MonsterId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<AccessLock>(entity =>
        {
            entity.Property(l => l.ResourceType).IsRequired().HasMaxLength(50);
            entity.Property(l => l.ResourceKey).IsRequired().HasMaxLength(200);
            entity.Property(l => l.CodeHash).IsRequired();
            entity.Property(l => l.CodeSalt).IsRequired();
            entity.HasIndex(l => new { l.GameId, l.ResourceType, l.ResourceKey }).IsUnique();
            entity.HasOne(l => l.Game)
                  .WithMany()
                  .HasForeignKey(l => l.GameId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
