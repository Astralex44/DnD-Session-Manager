namespace DndSessionManager.Api.Dtos;

public class CreateSessionMonsterDto
{
    // Optional — when set, Name/HpMax default from the Monster template
    // unless explicitly overridden below (e.g. spawning "Goblin 2").
    public Guid? MonsterId { get; set; }

    public string? Name { get; set; }

    public int? HpMax { get; set; }
}
