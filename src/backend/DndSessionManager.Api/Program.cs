using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;
using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Facades;
using DndSessionManager.Api.Hubs;
using DndSessionManager.Api.Repositories;
using DndSessionManager.Api.Storage;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Authorization;
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
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IGameMemberRepository, GameMemberRepository>();
builder.Services.AddScoped<IGameInviteRepository, GameInviteRepository>();
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
builder.Services.AddScoped<IAuthFacade, AuthFacade>();
builder.Services.AddScoped<IGameAccessListFacade, GameAccessListFacade>();
builder.Services.AddScoped<IGameAccess, GameAccess>();
builder.Services.AddScoped<IAuthorizationHandler, GameRoleHandler>();
builder.Services.AddHttpContextAccessor();
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

// Where the browser goes after login/refusal — the frontend, not this API.
var frontendBaseUrl = (builder.Configuration["Frontend:BaseUrl"] ?? string.Empty).TrimEnd('/');

var authenticationBuilder = builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    // No Discord default challenge: an unauthenticated API call must get a
    // plain 401 (cookie handler, below), never a redirect to Discord that a
    // fetch can't follow. Only /api/auth/login challenges Discord, explicitly.
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
                var handle = profile.GetProperty("username").GetString()!;
                var displayName = profile.TryGetProperty("global_name", out var globalName) && globalName.ValueKind == JsonValueKind.String
                    ? globalName.GetString()!
                    : handle;
                var avatarUrl = profile.TryGetProperty("avatar", out var avatar) && avatar.ValueKind == JsonValueKind.String
                    ? $"https://cdn.discordapp.com/avatars/{discordId}/{avatar.GetString()}.png"
                    : null;

                var authFacade = context.HttpContext.RequestServices.GetRequiredService<IAuthFacade>();
                var result = await authFacade.SignInAsync(discordId, handle, displayName, avatarUrl);
                if (result is null)
                {
                    context.Identity!.AddClaim(new Claim(AuthClaims.NotInvited, "true"));
                    return;
                }

                var (user, membership) = result.Value;
                context.Identity!.AddClaims(AuthClaims.For(user, membership));
            },

            // Not on the DM's list → no session, straight to the frontend's
            // "not invited" page.
            OnTicketReceived = context =>
            {
                if (context.Principal?.HasClaim(c => c.Type == AuthClaims.NotInvited) == true)
                {
                    context.Response.Redirect($"{frontendBaseUrl}/not-invited");
                    context.HandleResponse();
                }
                return Task.CompletedTask;
            },

            // Cancelled on Discord's consent screen, expired state, Discord
            // down, ... — send the person back to the login page instead of
            // a raw 500 from the callback endpoint.
            OnRemoteFailure = context =>
            {
                context.Response.Redirect($"{frontendBaseUrl}/login?error=login_failed");
                context.HandleResponse();
                return Task.CompletedTask;
            },
        };
    });
}
builder.Services.AddAuthorization(GamePolicies.Add);

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

    // Every page runs against this one fixed game until game selection
    // exists, and logins are provisioned into it — make sure it exists in
    // every environment, not only local development.
    if (!dbContext.Games.Any(game => game.Id == DemoGame.Id))
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

// Development-only test login: runs the exact same login rules as Discord
// (AuthFacade.SignInAsync) and issues the same cookie, so the access rules
// can be exercised locally without a Discord app. Never mapped outside
// Development.
if (app.Environment.IsDevelopment())
{
    app.MapGet("/api/auth/dev-login", async (HttpContext http, IAuthFacade authFacade, string discordId, string handle) =>
    {
        var result = await authFacade.SignInAsync(discordId, handle, handle, null);
        if (result is null) return Results.Forbid();

        var (user, membership) = result.Value;
        var identity = new ClaimsIdentity(AuthClaims.For(user, membership), CookieAuthenticationDefaults.AuthenticationScheme);
        await http.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));
        return Results.Ok(new { user.Id, Role = membership.Role.ToString() });
    });
}

app.Run();
