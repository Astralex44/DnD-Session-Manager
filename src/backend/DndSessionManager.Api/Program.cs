using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;
using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Facades;
using DndSessionManager.Api.Hubs;
using DndSessionManager.Api.Repositories;
using DndSessionManager.Api.Storage;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.DataProtection;
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
builder.Services.AddScoped<IAccessLockRepository, AccessLockRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IGameMemberRepository, GameMemberRepository>();
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
builder.Services.AddScoped<IAccessLockFacade, AccessLockFacade>();
builder.Services.AddScoped<IAuthFacade, AuthFacade>();
builder.Services.AddSingleton<IDocumentFileStorage, DocumentFileStorage>();
builder.Services.AddSingleton<IMonsterFileStorage, MonsterFileStorage>();
builder.Services.AddSingleton<IGameEventsBroadcaster, GameEventsBroadcaster>();

// The auth cookie is encrypted with Data Protection keys. By default those
// live inside the container and die with it, so every deploy would log
// everyone out — persist them in Postgres instead. Fixed application name so
// a rebuilt container recognizes the same key ring.
builder.Services.AddDataProtection()
    .PersistKeysToDbContext<AppDbContext>()
    .SetApplicationName("DndSessionManager");

// Release 1 auth (see the repo's Entscheidungs-Log — Discord OAuth only,
// Google/multi-provider deferred until after v1 ships). Cookie holds our own
// session; the Discord OAuth handshake only runs once, at login, to resolve
// who the person is (AuthFacade.FindOrCreateUserAsync).
//
// Discord scheme is only registered once real credentials exist. ASP.NET
// Core's auth middleware eagerly validates every registered scheme's options
// on *every* request (it has to check each remote handler's CallbackPath),
// so an OAuth scheme with an empty ClientId throws on every single request
// in the app, not just at login — this isn't optional, it's what keeps the
// rest of the API alive before Severin has a Discord app registered.
var discordClientId = builder.Configuration["Authentication:Discord:ClientId"];
var discordClientSecret = builder.Configuration["Authentication:Discord:ClientSecret"];
var discordConfigured = !string.IsNullOrEmpty(discordClientId) && !string.IsNullOrEmpty(discordClientSecret);

var authenticationBuilder = builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    if (discordConfigured) options.DefaultChallengeScheme = "Discord";
})
.AddCookie(options =>
{
    // Frontend and API live on different subdomains (dnd.astralex.dev /
    // dnd-api.astralex.dev) in prod, and different localhost ports in dev —
    // both need a cross-site cookie. SameAsRequest keeps Secure correct in
    // both http-local-dev and https-prod without two separate configs.
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;

    // This is an API, not an MVC app — an unauthenticated [Authorize] request
    // should get a plain 401/403, never the default redirect-to-a-login-page
    // behavior the cookie handler assumes by default.
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});

if (discordConfigured)
{
    authenticationBuilder.AddOAuth("Discord", options =>
    {
        options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.ClientId = discordClientId!;
        options.ClientSecret = discordClientSecret!;
        options.CallbackPath = "/api/auth/discord/callback";
        options.AuthorizationEndpoint = "https://discord.com/api/oauth2/authorize";
        options.TokenEndpoint = "https://discord.com/api/oauth2/token";
        options.UserInformationEndpoint = "https://discord.com/api/users/@me";
        options.Scope.Add("identify");

        options.Events = new OAuthEvents
        {
            OnCreatingTicket = async context =>
            {
                var request = new HttpRequestMessage(HttpMethod.Get, options.UserInformationEndpoint);
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", context.AccessToken);
                var response = await context.Backchannel.SendAsync(
                    request, HttpCompletionOption.ResponseHeadersRead, context.HttpContext.RequestAborted);
                response.EnsureSuccessStatusCode();
                var profile = await response.Content.ReadFromJsonAsync<JsonElement>();

                var discordId = profile.GetProperty("id").GetString()!;
                var username = profile.TryGetProperty("global_name", out var globalName) && globalName.ValueKind == JsonValueKind.String
                    ? globalName.GetString()!
                    : profile.GetProperty("username").GetString()!;
                var avatarUrl = profile.TryGetProperty("avatar", out var avatar) && avatar.ValueKind == JsonValueKind.String
                    ? $"https://cdn.discordapp.com/avatars/{discordId}/{avatar.GetString()}.png"
                    : null;

                var authFacade = context.HttpContext.RequestServices.GetRequiredService<IAuthFacade>();
                var (user, membership) = await authFacade.FindOrCreateUserAsync(discordId, username, avatarUrl);

                context.Identity!.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()));
                context.Identity!.AddClaim(new Claim(ClaimTypes.Name, user.Username));
                context.Identity!.AddClaim(new Claim("discord_id", discordId));
                context.Identity!.AddClaim(new Claim("role", membership.Role.ToString()));
            },
        };
    });
}
builder.Services.AddAuthorization();

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
    if (app.Environment.IsDevelopment() && !dbContext.Games.Any(game => game.Id == DemoGame.Id))
    {
        dbContext.Games.Add(new Game
        {
            Id = DemoGame.Id,
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
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<GameHub>("/hubs/game");

app.Run();
