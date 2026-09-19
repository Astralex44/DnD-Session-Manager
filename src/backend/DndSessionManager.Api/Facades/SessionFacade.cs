using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Repositories;

namespace DndSessionManager.Api.Facades;

public class SessionFacade(IUnitOfWork unitOfWork) : ISessionFacade
{
    public async Task<IReadOnlyList<SessionDto>> GetSessionsForGameAsync(Guid gameId) =>
        (await unitOfWork.Sessions.GetByGameIdAsync(gameId)).Select(ToDto).ToList();

    public async Task<SessionDto> CreateSessionAsync(Guid gameId, UpsertSessionDto input)
    {
        var existing = await unitOfWork.Sessions.GetByGameIdAsync(gameId);
        var session = new Session
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            Number = existing.Count == 0 ? 1 : existing.Max(s => s.Number) + 1,
            Title = input.Title.Trim(),
            ScheduledAt = input.ScheduledAt,
            Notes = input.Notes,
        };

        await unitOfWork.Sessions.AddAsync(session);
        await unitOfWork.SaveChangesAsync();
        return ToDto(session);
    }

    public async Task<SessionDto?> UpdateSessionAsync(Guid gameId, Guid sessionId, UpsertSessionDto input)
    {
        var session = await GetOwnedSessionAsync(gameId, sessionId);
        if (session is null) return null;

        session.Title = input.Title.Trim();
        session.ScheduledAt = input.ScheduledAt;
        session.Notes = input.Notes;

        await unitOfWork.SaveChangesAsync();
        return ToDto(session);
    }

    public async Task<bool> DeleteSessionAsync(Guid gameId, Guid sessionId)
    {
        var session = await GetOwnedSessionAsync(gameId, sessionId);
        if (session is null) return false;

        unitOfWork.Sessions.Remove(session);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    private async Task<Session?> GetOwnedSessionAsync(Guid gameId, Guid sessionId)
    {
        var session = await unitOfWork.Sessions.GetByIdAsync(sessionId);
        return session is not null && session.GameId == gameId ? session : null;
    }

    private static SessionDto ToDto(Session session) => new(
        session.Id, session.GameId, session.Number, session.Title, session.ScheduledAt, session.Notes);
}
