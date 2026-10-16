namespace DndSessionManager.Api.Data;

// The one hardcoded game every entity currently runs against, pre-Login.
// AuthFacade also provisions new logins into this game until real game
// selection exists.
public static class DemoGame
{
    public static readonly Guid Id = Guid.Parse("00000000-0000-0000-0000-000000000001");
}
