using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface IDiceFacade
{
    // The caller's own last 5 rolls — there is no way to read anyone else's.
    Task<IReadOnlyList<DiceRollDto>> GetHistoryAsync(Guid gameId, GameCaller caller);

    // Null when the dice size isn't one of d4/d6/d8/d10/d12/d20.
    Task<DiceRollDto?> RollAsync(Guid gameId, GameCaller caller, RollDiceDto input);

    // Forbidden when a player sets ForUserId, or the target isn't a member.
    Task<(DiceRollDto? Roll, bool Forbidden)> RecordPhysicalAsync(Guid gameId, GameCaller caller, RecordPhysicalRollDto input);

    // Only ever the caller's own history. False when the roll isn't theirs.
    Task<bool> DeleteRollAsync(Guid gameId, GameCaller caller, Guid rollId);
    Task ClearHistoryAsync(Guid gameId, GameCaller caller);
}
