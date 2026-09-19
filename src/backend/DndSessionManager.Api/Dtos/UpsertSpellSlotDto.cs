using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class UpsertSpellSlotDto
{
    [Range(1, 9)] public int Level { get; set; }
    [Range(0, 99)] public int Total { get; set; }
    [Range(0, 99)] public int Expended { get; set; }
}
