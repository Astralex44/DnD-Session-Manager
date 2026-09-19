using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class SetCharacterCurrencyDto
{
    [Range(0, int.MaxValue)] public int Quantity { get; set; }
}
