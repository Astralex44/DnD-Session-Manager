#!/bin/bash
# v0.12 checks: "Share with everyone" / "Unshare all" for maps, documents and shops.
# WARNING: wipes users, members, invites, characters, shops, currencies and documents in the LOCAL dev
# database (docker container "dnd-postgres"), like ownership-matrix.sh. Local only.
# Needs the API running in Development with Auth__DmDiscordId=111 (see README.md).
# Usage: share-all-matrix.sh [scratch dir for cookie jars]
S=${1:-$(mktemp -d)}; H=${DND_TEST_API:-http://localhost:5001}; B=$H/api; G=00000000-0000-0000-0000-000000000001
DM=$S/c_dm.jar; RO=$S/c_ro.jar; SE=$S/c_se.jar; rm -f $DM $RO $SE
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then pass=$((pass+1)); printf "  ok   %-62s %s\n" "$1" "$3"; else fail=$((fail+1)); printf "  FAIL %-62s want %s got %s\n" "$1" "$2" "$3"; fi; }
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
J=(-H 'Content-Type: application/json')
sql() { docker exec dnd-postgres psql -U postgres -d ${DND_TEST_DB:-dndsessionmanager} -tAc "$1"; }
jget() { python3 -c "import sys,json;d=json.load(sys.stdin);print($1)"; }

sql 'delete from "DiceRolls"; delete from "GameTimers"; delete from "Notes"; delete from "DocumentShares"; delete from "Documents"; delete from "Purchases"; delete from "ShopShares"; delete from "ShopItemPrices"; delete from "ShopItems"; delete from "Shops"; delete from "CharacterCurrencies"; delete from "CurrencyDenominations"; update "Characters" set "ActiveLevelSheetId"=null; delete from "Characters"; delete from "GameMembers"; delete from "GameInvites"; delete from "Users";' >/dev/null

echo "Setup: DM, Robin (Amber), Severin (Rhogar, Zecke)"
curl -s -o /dev/null -c $DM "$B/auth/dev-login?discordId=111&handle=thedm"
for h in robin severin; do curl -s -o /dev/null -b $DM "${J[@]}" -d "{\"discordHandle\":\"$h\"}" $B/games/$G/access/invites; done
curl -s -o /dev/null -c $RO "$B/auth/dev-login?discordId=222&handle=robin"
curl -s -o /dev/null -c $SE "$B/auth/dev-login?discordId=333&handle=severin"
AMBER=$(curl -s -b $RO "${J[@]}" -d '{"name":"Amber","class":"Rogue","level":1,"hpMax":10,"proficiencyBonus":2}' $B/games/$G/characters | jget 'd["id"]')
RHOGAR=$(curl -s -b $SE "${J[@]}" -d '{"name":"Rhogar","class":"Paladin","level":1,"hpMax":12,"proficiencyBonus":2}' $B/games/$G/characters | jget 'd["id"]')
ZECKE=$(curl -s -b $SE "${J[@]}" -d '{"name":"Zecke","class":"Rogue","level":1,"hpMax":11,"proficiencyBonus":2}' $B/games/$G/characters | jget 'd["id"]')
check "three characters created" 3 $(sql 'select count(*) from "Characters"')

printf '%%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%%%EOF\n' > $S/doc.pdf
python3 -c "import base64;open('$S/map.png','wb').write(base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='))"
MAP=$(curl -s -b $DM -F Name=Harbour -F Type=Map -F File=@$S/map.png $B/games/$G/documents | jget 'd["id"]')
BOOK=$(curl -s -b $DM -F Name=Letter -F Type=Book -F File=@$S/doc.pdf $B/games/$G/documents | jget 'd["id"]')
SHOP=$(curl -s -b $DM "${J[@]}" -d '{"name":"Smithy","description":""}' $B/games/$G/shops | jget 'd["id"]')
check "map, document and shop created" "3" "$(sql 'select (select count(*) from "Documents") + (select count(*) from "Shops")')"

SHARES='len(d["shares"])'
for kind in documents:$MAP documents:$BOOK shops:$SHOP; do
  T=${kind%%:*}; ID=${kind#*:}; U=$B/games/$G/$T/$ID
  echo "$T $ID"
  check "player can't share with everyone" 403 $(code -b $RO -X PUT "${J[@]}" -d '{}' $U/shares)
  check "player can't unshare all" 403 $(code -b $RO -X DELETE $U/shares)
  # Amber already has it, hidden and locked — share-all must show it again and keep the lock.
  curl -s -o /dev/null -b $DM -X PUT "${J[@]}" -d '{"hidden":true,"locked":true}' $U/shares/$AMBER
  check "DM: share with everyone" 204 $(code -b $DM -X PUT "${J[@]}" -d '{}' $U/shares)
  check "every character has it" 3 "$(curl -s -b $DM $U | jget "$SHARES")"
  check "hidden share shown again, lock kept" "False True" "$(curl -s -b $DM $U | jget '" ".join(str(x) for s in d["shares"] if s["characterId"]=="'$AMBER'" for x in (s["hidden"], s["locked"]))')"
  check "share with everyone twice adds no duplicates" "204 3" "$(code -b $DM -X PUT "${J[@]}" -d '{}' $U/shares) $(curl -s -b $DM $U | jget "$SHARES")"
  check "Severin sees it for both characters" 2 "$(curl -s -b $SE $U | jget "$SHARES")"
  check "DM: unshare all" 204 $(code -b $DM -X DELETE $U/shares)
  check "no shares left" 0 "$(curl -s -b $DM $U | jget "$SHARES")"
  check "player no longer sees it" 404 $(code -b $RO $U)
done

echo "Unknown ids"
check "share-all on unknown document → 404" 404 $(code -b $DM -X PUT "${J[@]}" -d '{}' $B/games/$G/documents/00000000-0000-0000-0000-0000000000aa/shares)
check "unshare-all on unknown shop → 404" 404 $(code -b $DM -X DELETE $B/games/$G/shops/00000000-0000-0000-0000-0000000000aa/shares)

echo "Documents list per type for players"
curl -s -o /dev/null -b $DM -X PUT "${J[@]}" -d '{}' $B/games/$G/documents/$BOOK/shares
check "Robin's list has the document, not the map" "Book" "$(curl -s -b $RO $B/games/$G/documents | jget '",".join(x["type"] for x in d)')"
check "document file served to Robin" 200 $(code -b $RO "$H$(curl -s -b $RO $B/games/$G/documents/$BOOK | jget 'd["fileUrl"]')")

echo; echo "passed $pass, failed $fail"; [ $fail -eq 0 ]
