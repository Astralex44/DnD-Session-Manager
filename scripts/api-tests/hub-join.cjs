// Joins a game's SignalR group with a curl cookie jar's login and prints
// JOINED or REJECTED. Usage: node hub-join.cjs <path to node_modules/@microsoft/signalr> <cookie jar> <gameId>
const signalR = require(process.argv[2]);
const fs = require('fs');
const jar = fs.readFileSync(process.argv[3], 'utf8').split('\n').filter(l => l && (!l.startsWith('#') || l.startsWith('#HttpOnly_')));
const cookie = jar.map(l => l.split('\t')).filter(p => p.length >= 7).map(p => `${p[5]}=${p[6]}`).join('; ');
const conn = new signalR.HubConnectionBuilder()
  .withUrl('http://localhost:5001/hubs/game', { headers: { Cookie: cookie } })
  .configureLogging(signalR.LogLevel.None).build();
conn.start()
  .then(() => conn.invoke('JoinGame', process.argv[4]))
  .then(() => { console.log('JOINED'); return conn.stop(); })
  .catch(e => { console.log('REJECTED: ' + e.message.split('\n')[0]); return conn.stop(); });
