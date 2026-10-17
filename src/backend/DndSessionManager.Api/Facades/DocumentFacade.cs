using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Hubs;
using DndSessionManager.Api.Repositories;
using DndSessionManager.Api.Storage;

namespace DndSessionManager.Api.Facades;

public class DocumentFacade(IUnitOfWork unitOfWork, IDocumentFileStorage fileStorage, IGameEventsBroadcaster broadcaster) : IDocumentFacade
{
    public async Task<IReadOnlyList<DocumentDto>> GetDocumentsForGameAsync(Guid gameId, GameCaller caller)
    {
        var documents = await unitOfWork.Documents.GetByGameIdAsync(gameId);
        var characters = await unitOfWork.Characters.GetByGameIdAsync(gameId);
        var characterNames = characters.ToDictionary(c => c.Id, c => c.Name);
        if (caller.IsDm) return documents.Select(doc => ToDto(doc, characterNames)).ToList();

        var own = OwnCharacterIds(characters, caller);
        return documents
            .Where(doc => doc.Shares.Any(share => own.Contains(share.CharacterId)))
            .Select(doc => ToDto(doc, characterNames, own))
            .ToList();
    }

    public async Task<DocumentDto?> GetDocumentAsync(Guid gameId, Guid documentId, GameCaller caller)
    {
        var document = await GetOwnedDocumentAsync(gameId, documentId);
        if (document is null) return null;

        var characters = await unitOfWork.Characters.GetByGameIdAsync(gameId);
        var characterNames = characters.ToDictionary(c => c.Id, c => c.Name);
        if (caller.IsDm) return ToDto(document, characterNames);

        var own = OwnCharacterIds(characters, caller);
        return document.Shares.Any(share => own.Contains(share.CharacterId)) ? ToDto(document, characterNames, own) : null;
    }

    public async Task<DocumentDto> CreateDocumentAsync(Guid gameId, CreateDocumentDto input)
    {
        var fileUrl = await fileStorage.SaveAsync(input.File);
        var document = new Document
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            Type = ParseDocumentType(input.Type),
            Name = input.Name.Trim(),
            FileUrl = fileUrl,
            OriginalFileName = input.File.FileName,
            UploadedAt = DateTime.UtcNow,
        };

        await unitOfWork.Documents.AddAsync(document);
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "documents");
        return ToDto(document, new Dictionary<Guid, string>());
    }

    public async Task<DocumentDto?> UpdateDocumentAsync(Guid gameId, Guid documentId, UpdateDocumentDto input)
    {
        var document = await GetOwnedDocumentAsync(gameId, documentId);
        if (document is null) return null;

        document.Name = input.Name.Trim();

        if (input.File is not null)
        {
            var previousFileUrl = document.FileUrl;
            document.FileUrl = await fileStorage.SaveAsync(input.File);
            document.OriginalFileName = input.File.FileName;
            fileStorage.Delete(previousFileUrl);
        }

        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "documents");
        var characterNames = await CharacterNamesForGameAsync(gameId);
        return ToDto(document, characterNames);
    }

    public async Task<bool> DeleteDocumentAsync(Guid gameId, Guid documentId)
    {
        var document = await GetOwnedDocumentAsync(gameId, documentId);
        if (document is null) return false;

        unitOfWork.Documents.Remove(document);
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "documents");
        fileStorage.Delete(document.FileUrl);
        return true;
    }

    public async Task<(DocumentShareDto? Share, bool Forbidden)> SetShareAsync(
        Guid gameId, Guid documentId, Guid characterId, UpsertDocumentShareDto input, GameCaller caller)
    {
        var document = await GetOwnedDocumentAsync(gameId, documentId);
        if (document is null) return (null, false);

        var character = await unitOfWork.Characters.GetByIdAsync(characterId);
        if (character is null || character.GameId != gameId) return (null, false);

        var share = await unitOfWork.DocumentShares.GetByDocumentAndCharacterAsync(documentId, characterId);
        var hidden = input.Hidden;
        var locked = input.Locked;
        if (!caller.IsDm)
        {
            var own = OwnCharacterIds(await unitOfWork.Characters.GetByGameIdAsync(gameId), caller);
            if (own.Contains(characterId))
            {
                // Declutter your own copy — you can't share a document to yourself.
                if (share is null) return (null, true);
            }
            else
            {
                // Handing it on: only from a character that holds it, only as a
                // fresh share, and the recipient's own Hide/Lock is theirs alone.
                var holdsIt = document.Shares.Any(s => own.Contains(s.CharacterId));
                if (!holdsIt || share is not null) return (null, true);
                hidden = false;
                locked = false;
            }
        }

        if (share is null)
        {
            share = new DocumentShare { Id = Guid.NewGuid(), DocumentId = documentId, CharacterId = characterId };
            await unitOfWork.DocumentShares.AddAsync(share);
        }

        share.Hidden = hidden;
        share.Locked = locked;

        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "documents");
        return (new DocumentShareDto(share.Id, share.CharacterId, character.Name, share.Hidden, share.Locked), false);
    }

    public async Task<bool> RemoveShareAsync(Guid gameId, Guid documentId, Guid characterId)
    {
        if (await GetOwnedDocumentAsync(gameId, documentId) is null) return false;

        var share = await unitOfWork.DocumentShares.GetByDocumentAndCharacterAsync(documentId, characterId);
        if (share is null) return false;

        unitOfWork.DocumentShares.Remove(share);
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "documents");
        return true;
    }

    public async Task<int> EndSessionAsync(Guid gameId)
    {
        var hidden = 0;
        foreach (var map in (await unitOfWork.Documents.GetByGameIdAsync(gameId)).Where(d => d.Type == DocumentType.Map))
        {
            foreach (var share in map.Shares.Where(s => !s.Locked && !s.Hidden))
            {
                share.Hidden = true;
                hidden++;
            }
        }

        await unitOfWork.SaveChangesAsync();
        if (hidden > 0) await broadcaster.NotifyAsync(gameId, "documents");
        return hidden;
    }

    private async Task<Document?> GetOwnedDocumentAsync(Guid gameId, Guid documentId)
    {
        var document = await unitOfWork.Documents.GetByIdAsync(documentId);
        return document is not null && document.GameId == gameId ? document : null;
    }

    private async Task<Dictionary<Guid, string>> CharacterNamesForGameAsync(Guid gameId) =>
        (await unitOfWork.Characters.GetByGameIdAsync(gameId)).ToDictionary(c => c.Id, c => c.Name);

    private static DocumentType ParseDocumentType(string value) =>
        Enum.TryParse<DocumentType>(value, true, out var type) ? type : DocumentType.Map;

    private static HashSet<Guid> OwnCharacterIds(IEnumerable<Character> characters, GameCaller caller) =>
        characters.Where(c => c.OwnerUserId == caller.UserId).Select(c => c.Id).ToHashSet();

    // onlyCharacters: a player's view — share rows of other characters are
    // left out (who else has a map is the DM's business).
    private static DocumentDto ToDto(Document document, IReadOnlyDictionary<Guid, string> characterNames, IReadOnlySet<Guid>? onlyCharacters = null) => new(
        document.Id, document.GameId, document.Type.ToString(), document.Name, document.FileUrl, document.OriginalFileName, document.UploadedAt,
        document.Shares.Where(share => onlyCharacters is null || onlyCharacters.Contains(share.CharacterId)).Select(share => new DocumentShareDto(
            share.Id, share.CharacterId, characterNames.GetValueOrDefault(share.CharacterId, "Unknown"),
            share.Hidden, share.Locked)).ToList());
}
