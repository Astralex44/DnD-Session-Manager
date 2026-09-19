import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from '../api/client.ts';

// NFA-01: real-time sync without a reload. One hub connection for the whole
// app (not per-widget) — components join the game group they care about and
// subscribe to the resource-area event names the backend's
// IGameEventsBroadcaster sends ("initiative", "timers", "monsters", "shops",
// "documents", "characters"). Events carry no payload; a listener just
// refetches via the existing REST GET, so this never needs to duplicate a
// DTO shape client-side. Falls back gracefully to whatever periodic poll a
// component keeps as a safety net if the connection is ever down.
const HUB_URL = `${API_BASE_URL.replace(/\/api$/, '')}/hubs/game`;

let connection: signalR.HubConnection | null = null;
let joinedGameId: string | null = null;

function getConnection(): signalR.HubConnection {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    connection.onreconnected(() => {
      if (joinedGameId) connection?.invoke('JoinGame', joinedGameId).catch(() => {});
    });

    connection.start().then(() => {
      if (joinedGameId) connection?.invoke('JoinGame', joinedGameId).catch(() => {});
    }).catch(() => {
      // Connection failures are non-fatal — components keep polling as a fallback.
    });
  }
  return connection;
}

export function joinGame(gameId: string): void {
  joinedGameId = gameId;
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    conn.invoke('JoinGame', gameId).catch(() => {});
  }
}

// Subscribe to one resource-area event for a specific game. Returns an
// unsubscribe function for use in a useEffect cleanup.
export function onGameEvent(gameId: string, eventName: string, handler: () => void): () => void {
  const conn = getConnection();
  const listener = (receivedEventName: string) => {
    if (receivedEventName === eventName) handler();
  };
  conn.on('gameEvent', listener);
  joinGame(gameId);
  return () => conn.off('gameEvent', listener);
}
