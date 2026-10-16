#!/bin/bash
# Access matrix: anonymous, stranger, DM, invited player, removed player, foreign game.
# WARNING: wipes users, members, invites in the LOCAL dev database
# (docker container "dnd-postgres") to start from a known state. Local only —
# it talks to http://localhost:5001 and never to production.
# Needs the API running in Development with Auth__DmDiscordId=111 (see README.md).
# Usage: access-matrix.sh [scratch dir for cookie jars]
S=${1:-$(mktemp -d)}; B=http://localhost:5001/api; G=00000000-0000-0000-0000-000000000001; OTHER=11111111-2222-3333-4444-555555555555
DM=$S/dm.jar; PL=$S/pl.jar; rm -f $DM $PL $S/st.jar
printf '%%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%%%EOF\n' > $S/test.pdf
pass=0; fail=0
check() { # name expected actual
  if [ "$2" = "$3" ]; then pass=$((pass+1)); printf "  ok   %-55s %s\n" "$1" "$3"; else fail=$((fail+1)); printf "  FAIL %-55s want %s got %s\n" "$1" "$2" "$3"; fi; }
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
psql() { docker exec dnd-postgres psql -U postgres -d dndsessionmanager -tAc "$1"; }

psql "delete from \"GameMembers\"; delete from \"Users\"; delete from \"GameInvites\";" >/dev/null

echo "Anonymous"
check "GET characters" 401 $(code $B/games/$G/characters)
check "GET me" 401 $(code $B/auth/me)
check "SignalR negotiate" 401 $(code -X POST http://localhost:5001/hubs/game/negotiate?negotiateVersion=1)

echo "Logins"
check "stranger dev-login refused" 403 $(code -c $S/st.jar "$B/auth/dev-login?discordId=999&handle=stranger")
check "stranger left no user row" 0 $(psql 'select count(*) from "Users"')
check "configured DM dev-login" 200 $(code -c $DM "$B/auth/dev-login?discordId=111&handle=TheDM")
check "DM role stored" Dm $(psql 'select "Role" from "GameMembers"')

echo "DM"
check "GET monsters" 200 $(code -b $DM $B/games/$G/monsters)
check "POST invite @Player1" 200 $(code -b $DM -H 'Content-Type: application/json' -d '{"discordHandle":"@Player1"}' $B/games/$G/access/invites)
check "invite stored normalized" player1 $(psql 'select "DiscordHandle" from "GameInvites"')
check "POST duplicate invite" 409 $(code -b $DM -H 'Content-Type: application/json' -d '{"discordHandle":"player1"}' $B/games/$G/access/invites)
check "POST invite for the DM himself" 409 $(code -b $DM -H 'Content-Type: application/json' -d '{"discordHandle":"thedm"}' $B/games/$G/access/invites)
check "POST initiative entry" 200 $(code -b $DM -H 'Content-Type: application/json' -d '{"name":"Goblin","value":12,"isMonster":true}' $B/games/$G/initiative/entries)
MON=$(curl -s -b $DM -F name=Goblin -F defaultHp=7 -F "file=@$S/test.pdf;type=application/pdf" $B/games/$G/monsters)
MONFILE=$(echo "$MON" | python3 -c 'import sys,json;print(json.load(sys.stdin)["fileUrl"])')
check "upload monster" yes $([ -n "$MONFILE" ] && echo yes)
DOC=$(curl -s -b $DM -F name=Room1 -F type=Map -F "file=@$S/test.pdf;type=application/pdf" $B/games/$G/documents)
DOCFILE=$(echo "$DOC" | python3 -c 'import sys,json;print(json.load(sys.stdin)["fileUrl"])')
check "upload map" yes $([ -n "$DOCFILE" ] && echo yes)
check "DM gets monster file" 200 $(code -b $DM http://localhost:5001$MONFILE)
check "DM gets map file" 200 $(code -b $DM http://localhost:5001$DOCFILE)
check "DM SignalR negotiate" 200 $(code -b $DM -X POST http://localhost:5001/hubs/game/negotiate?negotiateVersion=1)

echo "Invited player"
check "player1 dev-login" 200 $(code -c $PL "$B/auth/dev-login?discordId=222&handle=Player1")
check "player role stored" Player $(psql "select m.\"Role\" from \"GameMembers\" m join \"Users\" u on u.\"Id\"=m.\"UserId\" where u.\"DiscordId\"='222'")
check "invite used up" 0 $(psql 'select count(*) from "GameInvites"')
check "GET me" 200 $(code -b $PL $B/auth/me)
check "GET characters" 200 $(code -b $PL $B/games/$G/characters)
check "GET initiative" 200 $(code -b $PL $B/games/$G/initiative)
check "GET currency" 200 $(code -b $PL $B/games/$G/currency-denominations)
check "GET documents" 200 $(code -b $PL $B/games/$G/documents)
check "GET shops" 200 $(code -b $PL $B/games/$G/shops)
check "GET timers" 200 $(code -b $PL $B/games/$G/timers)
check "GET quotes" 200 $(code -b $PL $B/games/$G/quotes)
check "GET monsters (DM only)" 403 $(code -b $PL $B/games/$G/monsters)
check "GET session-monsters (DM only)" 403 $(code -b $PL $B/games/$G/session-monsters)
check "GET sessions (players: titles only, Phase B)" 200 $(code -b $PL $B/games/$G/sessions)
check "GET access list (DM only)" 403 $(code -b $PL $B/games/$G/access)
check "POST initiative entry (DM only)" 403 $(code -b $PL -H 'Content-Type: application/json' -d '{"name":"x","value":1}' $B/games/$G/initiative/entries)
check "POST initiative next (DM only)" 403 $(code -b $PL -X POST $B/games/$G/initiative/next)
check "POST currency (DM only)" 403 $(code -b $PL -H 'Content-Type: application/json' -d '{}' $B/games/$G/currency-denominations)
check "POST shop (DM only)" 403 $(code -b $PL -H 'Content-Type: application/json' -d '{}' $B/games/$G/shops)
check "POST quote (DM only)" 403 $(code -b $PL -H 'Content-Type: application/json' -d '{"text":"x"}' $B/games/$G/quotes)
check "POST timer (DM only)" 403 $(code -b $PL -H 'Content-Type: application/json' -d '{}' $B/games/$G/timers)
check "player gets monster file (DM only)" 403 $(code -b $PL http://localhost:5001$MONFILE)
check "player gets unshared map file (Phase B)" 403 $(code -b $PL http://localhost:5001$DOCFILE)
check "player SignalR negotiate" 200 $(code -b $PL -X POST http://localhost:5001/hubs/game/negotiate?negotiateVersion=1)
check "player, other game's characters" 403 $(code -b $PL $B/games/$OTHER/characters)
check "player re-login (already member, no invite)" 200 $(code -c $PL "$B/auth/dev-login?discordId=222&handle=player1")

echo "Files, anonymous"
check "anon map file" 401 $(code http://localhost:5001$DOCFILE)
check "anon unknown file" 401 $(code http://localhost:5001/api/files/documents/nope.pdf)
check "DM unknown file" 404 $(code -b $DM http://localhost:5001/api/files/documents/nope.pdf)

echo "DM removes player"
MID=$(psql "select m.\"Id\" from \"GameMembers\" m join \"Users\" u on u.\"Id\"=m.\"UserId\" where u.\"DiscordId\"='222'")
DMID=$(psql "select m.\"Id\" from \"GameMembers\" m join \"Users\" u on u.\"Id\"=m.\"UserId\" where u.\"DiscordId\"='111'")
check "DM can't remove himself" 404 $(code -b $DM -X DELETE $B/games/$G/access/members/$DMID)
check "DM removes player1" 204 $(code -b $DM -X DELETE $B/games/$G/access/members/$MID)
check "removed player, same cookie, GET characters" 403 $(code -b $PL $B/games/$G/characters)
check "removed player re-login refused" 403 $(code "$B/auth/dev-login?discordId=222&handle=player1")

echo "Discord callback failure → frontend redirect, not 500"
R=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "http://localhost:5001/api/auth/discord/callback?code=x&state=garbage")
check "bad state callback" "302 http://localhost:5173/login?error=login_failed" "$R"

echo; echo "passed $pass, failed $fail"
