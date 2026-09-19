using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Hubs;
using DndSessionManager.Api.Repositories;
using DndSessionManager.Api.Storage;

namespace DndSessionManager.Api.Facades;

public class DocumentFacade(IUnitOfWork unitOfWork, IDocumentFileStorage fileStorage, IGameEventsBroadcaster broadcaster) : IDocumentFacade
{
    public async Task<IReadOnlyList<DocumentDto>> GetDocumentsForGameAsync(Guid gameId)
    {
        var documents = await unitOfWork.Documents.GetByGameIdAsync(gameId);
        var characterNames = await CharacterNamesForGameAsync(gameId);
        return documents.Select(doc => ToDto(doc, characterNames)).ToList();
    }

    public async Task<DocumentDto?> GetDocumentAsync(Guid gameId, Guid documentId)
    {
        var document = await GetOwnedDocumentAsync(gameId, documentId);
        if (document is null) return null;

        var characterNames = await CharacterNamesForGameAsync(gameId);
        return ToDto(document, characterNames);
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

    public async Task<DocumentShareDto?> SetShareAsync(Guid gameId, Guid documentId, Guid characterId, UpsertDocumentShareDto input)
    {
        var document = await GetOwnedDocumentAsync(gameId, documentId);
        if (document is null) return null;

        var character = await unitOfWork.Characters.GetByIdAsync(characterId);
        if (character is null || character.GameId != gameId) return null;

        var share = await unitOfWork.DocumentShares.GetByDocumentAndCharacterAsync(documentId, characterId);
        if (share is null)
        {
            share = new DocumentShare { Id = Guid.NewGuid(), DocumentId = documentId, CharacterId = characterId };
            await unitOfWork.DocumentShares.AddAsync(share);
        }

        share.Hidden = input.Hidden;
        share.Locked = input.Locked;

        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "documents");
        return new DocumentShareDto(share.Id, share.CharacterId, character.Name, share.Hidden, share.Locked);
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

    private async Task<Document?> GetOwnedDocumentAsync(Guid gameId, Guid documentId)
    {
        var document = await unitOfWork.Documents.GetByIdAsync(documentId);
        return document is not null && document.GameId == gameId ? document : null;
    }

    private async Task<Dictionary<Guid, string>> CharacterNamesForGameAsync(Guid gameId) =>
        (await unitOfWork.Characters.GetByGameIdAsync(gameId)).ToDictionary(c => c.Id, c => c.Name);

    private static DocumentType ParseDocumentType(string value) =>
        Enum.TryParse<DocumentType>(value, true, out var type) ? type : DocumentType.Map;

    private static DocumentDto ToDto(Document document, IReadOnlyDictionary<Guid, string> characterNames) => new(
        document.Id, document.GameId, document.Type.ToString(), document.Name, document.FileUrl, document.OriginalFileName, document.UploadedAt,
        document.Shares.Select(share => new DocumentShareDto(
            share.Id, share.CharacterId, characterNames.GetValueOrDefault(share.CharacterId, "Unknown"),
            share.Hidden, share.Locked)).ToList());
}
