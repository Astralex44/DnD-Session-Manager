using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Facades;
using DndSessionManager.Api.Hubs;
using DndSessionManager.Api.Repositories;
using DndSessionManager.Api.Storage;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Infrastructure;

QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// Repositories — one registration per entity as new slices get built.
builder.Services.AddScoped<IQuoteRepository, QuoteRepository>();
builder.Services.AddScoped<ICharacterRepository, CharacterRepository>();
builder.Services.AddScoped<ICharacterLevelSheetRepository, CharacterLevelSheetRepository>();
builder.Services.AddScoped<ICharacterSkillRepository, CharacterSkillRepository>();
builder.Services.AddScoped<ICharacterSaveRepository, CharacterSaveRepository>();
builder.Services.AddScoped<ICharacterAttackRepository, CharacterAttackRepository>();
builder.Services.AddScoped<ICharacterItemRepository, CharacterItemRepository>();
builder.Services.AddScoped<ICharacterSpellcastingRepository, CharacterSpellcastingRepository>();
builder.Services.AddScoped<ICharacterSpellRepository, CharacterSpellRepository>();
builder.Services.AddScoped<ICharacterSpellSlotRepository, CharacterSpellSlotRepository>();
builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();
builder.Services.AddScoped<IDocumentShareRepository, DocumentShareRepository>();
builder.Services.AddScoped<ICurrencyDenominationRepository, CurrencyDenominationRepository>();
builder.Services.AddScoped<ICharacterCurrencyRepository, CharacterCurrencyRepository>();
builder.Services.AddScoped<IShopRepository, ShopRepository>();
builder.Services.AddScoped<IShopShareRepository, ShopShareRepository>();
builder.Services.AddScoped<IShopItemRepository, ShopItemRepository>();
builder.Services.AddScoped<IShopItemPriceRepository, ShopItemPriceRepository>();
builder.Services.AddScoped<IPurchaseRepository, PurchaseRepository>();
builder.Services.AddScoped<IMonsterRepository, MonsterRepository>();
builder.Services.AddScoped<ISessionRepository, SessionRepository>();
builder.Services.AddScoped<INoteRepository, NoteRepository>();
builder.Services.AddScoped<IInitiativeEntryRepository, InitiativeEntryRepository>();
builder.Services.AddScoped<IInitiativeStateRepository, InitiativeStateRepository>();
builder.Services.AddScoped<IGameTimerRepository, GameTimerRepository>();
builder.Services.AddScoped<ISessionMonsterRepository, SessionMonsterRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Facades — business logic layer, one per entity/feature area.
builder.Services.AddScoped<IQuoteFacade, QuoteFacade>();
builder.Services.AddScoped<ICharacterFacade, CharacterFacade>();
builder.Services.AddScoped<IDocumentFacade, DocumentFacade>();
builder.Services.AddScoped<ICurrencyFacade, CurrencyFacade>();
builder.Services.AddScoped<IShopFacade, ShopFacade>();
builder.Services.AddScoped<IMonsterFacade, MonsterFacade>();
builder.Services.AddScoped<ISessionFacade, SessionFacade>();
builder.Services.AddScoped<INoteFacade, NoteFacade>();
builder.Services.AddScoped<IInitiativeFacade, InitiativeFacade>();
builder.Services.AddScoped<IGameTimerFacade, GameTimerFacade>();
builder.Services.AddScoped<ISessionMonsterFacade, SessionMonsterFacade>();
builder.Services.AddSingleton<IDocumentFileStorage, DocumentFileStorage>();
builder.Services.AddSingleton<IMonsterFileStorage, MonsterFileStorage>();
builder.Services.AddSingleton<IGameEventsBroadcaster, GameEventsBroadcaster>();

// Allows localhost, any private-LAN origin (not just one hardcoded IP — other
// players' phones/laptops on the same WiFi can reach the API when the
// frontend is opened via the DM's machine's LAN IP instead of "localhost"),
// and whatever's explicitly configured under Cors:AllowedOrigins (the real
// production frontend origin, e.g. https://dnd.astralex.dev — set via the
// Cors__AllowedOrigins__0 environment variable in the prod compose file,
// same pattern astralex.dev.todo-api uses for its own CORS origin). Still
// not AllowAnyOrigin — this app has no auth, so origins are allow-listed.
var configuredOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

bool IsAllowedOrigin(string origin)
{
    if (configuredOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase)) return true;
    if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri)) return false;
    if (uri.Host is "localhost" or "127.0.0.1") return true;
    if (!System.Net.IPAddress.TryParse(uri.Host, out var ip)) return false;
    var bytes = ip.GetAddressBytes();
    if (bytes.Length != 4) return false;
    return bytes[0] switch
    {
        10 => true,
        172 => bytes[1] is >= 16 and <= 31,
        192 => bytes[1] == 168,
        _ => false,
    };
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.SetIsOriginAllowed(IsAllowedOrigin)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var app = builder.Build();

// Apply the tracked EF Core schema before serving requests. This makes a new
// Compose database usable immediately and is a no-op after migrations exist.
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();

    // QuotesPage uses this fixed game until the game selection flow exists.
    // Seed it only for local development so the foreign key remains valid.
    var demoGameId = Guid.Parse("00000000-0000-0000-0000-000000000001");
    if (app.Environment.IsDevelopment() && !dbContext.Games.Any(game => game.Id == demoGameId))
    {
        dbContext.Games.Add(new Game
        {
            Id = demoGameId,
            Name = "Demo Game",
            CreatedAt = DateTime.UtcNow,
        });
        dbContext.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");
app.UseAuthorization();
app.MapControllers();
app.MapHub<GameHub>("/hubs/game");

app.Run();
