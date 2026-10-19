#!/bin/bash
# Ownership matrix: DM + two players (Robin, Severin) on pre-login data.
# WARNING: wipes users, members, invites, characters, notes, maps, shops, quotes, sessions and currencies in the LOCAL dev database
# (docker container "dnd-postgres") to start from a known state. Local only —
# it talks to ${DND_TEST_API:-http://localhost:5001} and never to production.
# Needs the API running in Development with Auth__DmDiscordId=111 (see README.md).
# Usage: ownership-matrix.sh [scratch dir for cookie jars]
S=${1:-$(mktemp -d)}; H=${DND_TEST_API:-http://localhost:5001}; B=$H/api; G=00000000-0000-0000-0000-000000000001
DM=$S/b_dm.jar; RO=$S/b_ro.jar; SE=$S/b_se.jar; rm -f $DM $RO $SE
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then pass=$((pass+1)); printf "  ok   %-62s %s\n" "$1" "$3"; else fail=$((fail+1)); printf "  FAIL %-62s want %s got %s\n" "$1" "$2" "$3"; fi; }
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
J=(-H 'Content-Type: application/json')
sql() { docker exec dnd-postgres psql -U postgres -d ${DND_TEST_DB:-dndsessionmanager} -tAc "$1"; }
jget() { python3 -c "import sys,json;d=json.load(sys.stdin);print($1)"; }

sql 'delete from "Notes"; delete from "Purchases"; delete from "ShopShares"; delete from "ShopItemPrices"; delete from "ShopItems"; delete from "Shops"; delete from "DocumentShares"; delete from "Documents"; delete from "Quotes"; delete from "Sessions"; delete from "CharacterCurrencies"; delete from "CurrencyDenominations"; update "Characters" set "ActiveLevelSheetId"=null; delete from "Characters"; delete from "GameMembers"; delete from "GameInvites"; delete from "Users";' >/dev/null

echo "Setup: pre-login data (2 unowned characters, 4 legacy note buckets)"
curl -s -o /dev/null -c $DM "$B/auth/dev-login?discordId=111&handle=thedm"
AMBER=$(curl -s -b $DM "${J[@]}" -d '{"name":"Amber","class":"Rogue","playerName":"Robin","level":1,"hpMax":10,"proficiencyBonus":2}' $B/games/$G/characters | jget 'd["id"]')
RHOGAR=$(curl -s -b $DM "${J[@]}" -d '{"name":"Rhogar","class":"Paladin","playerName":"Severin","level":1,"hpMax":12,"proficiencyBonus":2}' $B/games/$G/characters | jget 'd["id"]')
sql 'update "Characters" set "OwnerUserId"=null; delete from "GameMembers"; delete from "Users";' >/dev/null
for b in DM Robin Severin Amber; do
  sql "insert into \"Notes\" (\"Id\",\"GameId\",\"OwnerName\",\"Title\",\"Text\",\"CreatedAt\",\"UpdatedAt\") values (gen_random_uuid(),'$G','$b','legacy $b','x',now(),now())" >/dev/null
done
check "characters exist, unowned" "2" $(sql 'select count(*) from "Characters" where "OwnerUserId" is null')
check "AccessLocks table dropped" "0" $(sql "select count(*) from information_schema.tables where table_name='AccessLocks'")

echo "Logins + DM picks up 'DM' notes"
rm -f $DM; check "DM login" 200 $(code -c $DM "$B/auth/dev-login?discordId=111&handle=thedm")
check "'DM' bucket adopted by DM" "1" $(sql "select count(*) from \"Notes\" n join \"Users\" u on u.\"Id\"=n.\"OwnerUserId\" where n.\"OwnerName\"='DM' and u.\"DiscordId\"='111'")
for h in robin severin; do curl -s -o /dev/null -b $DM "${J[@]}" -d "{\"discordHandle\":\"$h\"}" $B/games/$G/access/invites; done
check "Robin login" 200 $(code -c $RO "$B/auth/dev-login?discordId=222&handle=robin")
check "Severin login" 200 $(code -c $SE "$B/auth/dev-login?discordId=333&handle=severin")
ROID=$(sql "select \"Id\" from \"Users\" where \"DiscordId\"='222'"); SEID=$(sql "select \"Id\" from \"Users\" where \"DiscordId\"='333'")

echo "Before assignment"
check "Robin sees 0 characters" 0 $(curl -s -b $RO $B/games/$G/characters | jget 'len(d)')
check "Robin can't open unowned Amber" 403 $(code -b $RO $B/games/$G/characters/$AMBER)
check "DM sees both, owner null" "2 None" "$(curl -s -b $DM $B/games/$G/characters | jget 'str(len(d))+" "+str(d[0]["ownerUserId"])')"
check "Robin sees no legacy notes yet" 0 $(curl -s -b $RO $B/games/$G/notes | jget 'len(d)')
check "player can't assign owners" 403 $(code -b $RO -X PUT "${J[@]}" -d "{\"userId\":\"$ROID\"}" $B/games/$G/characters/$AMBER/owner)
check "can't assign to a non-member" 404 $(code -b $DM -X PUT "${J[@]}" -d '{"userId":"99999999-9999-9999-9999-999999999999"}' $B/games/$G/characters/$AMBER/owner)

echo "DM assigns Amber→Robin, Rhogar→Severin"
check "assign Amber" "robin" "$(curl -s -b $DM -X PUT "${J[@]}" -d "{\"userId\":\"$ROID\"}" $B/games/$G/characters/$AMBER/owner | jget 'd["ownerUsername"]')"
check "assign Rhogar" 200 $(code -b $DM -X PUT "${J[@]}" -d "{\"userId\":\"$SEID\"}" $B/games/$G/characters/$RHOGAR/owner)
check "'Robin' notes → Robin" "legacy Robin" "$(curl -s -b $RO $B/games/$G/notes | jget 'd[0]["title"]')"
check "'Severin' notes → Severin" "legacy Severin" "$(curl -s -b $SE $B/games/$G/notes | jget 'd[0]["title"]')"
check "'Amber' notes → DM's notebook on Amber" "legacy Amber" "$(curl -s -b $DM "$B/games/$G/notes?aboutCharacterId=$AMBER" | jget 'd[0]["title"]')"
check "DM's own notebook = 'DM' bucket only" "1 legacy DM" "$(curl -s -b $DM $B/games/$G/notes | jget 'str(len(d))+" "+d[0]["title"]')"
check "no notes left unclaimed" 0 $(sql 'select count(*) from "Notes" where "OwnerUserId" is null')

echo "Characters"
check "Robin sees only Amber" "1 Amber" "$(curl -s -b $RO $B/games/$G/characters | jget 'str(len(d))+" "+d[0]["name"]')"
check "Robin opens Amber" 200 $(code -b $RO $B/games/$G/characters/$AMBER)
check "Robin opens Rhogar" 403 $(code -b $RO $B/games/$G/characters/$RHOGAR)
check "Robin PDF of Rhogar" 403 $(code -b $RO $B/games/$G/characters/$RHOGAR/pdf)
SKILL=$(curl -s -b $RO $B/games/$G/characters/$AMBER | jget 'd["skills"][0]["id"]')
check "Robin edits Amber skill" 200 $(code -b $RO -X PATCH "${J[@]}" -d '{"proficient":true}' $B/games/$G/characters/$AMBER/skills/$SKILL)
check "Severin edits Amber skill" 403 $(code -b $SE -X PATCH "${J[@]}" -d '{"proficient":true}' $B/games/$G/characters/$AMBER/skills/$SKILL)
check "Severin deletes Amber" 403 $(code -b $SE -X DELETE $B/games/$G/characters/$AMBER)
check "DM reads Amber" 200 $(code -b $DM $B/games/$G/characters/$AMBER)
check "DM edits Amber skill (owner only)" 403 $(code -b $DM -X PATCH "${J[@]}" -d '{"proficient":false}' $B/games/$G/characters/$AMBER/skills/$SKILL)
DETAIL=$(curl -s -b $DM $B/games/$G/characters/$AMBER | python3 -c 'import sys,json;d=json.load(sys.stdin);d["strength"]=16;print(json.dumps(d))')
LS=$(curl -s -b $DM $B/games/$G/characters/$AMBER | jget 'd["activeLevelSheetId"]')
check "DM levels Amber up" 403 $(code -b $DM "${J[@]}" -d '{"level":2,"hpToAdd":5,"proficiencyBonus":2,"makeActive":true}' $B/games/$G/characters/$AMBER/level-sheets)
check "DM sets Amber's spell slots" 403 $(code -b $DM -X PUT "${J[@]}" -d '{"level":1,"total":2,"expended":0}' $B/games/$G/characters/$AMBER/level-sheets/$LS/spell-slots)
check "DM edits Amber's attributes (no DM exception since 2026-10-19)" 403 $(code -b $DM -X PATCH "${J[@]}" -d "$DETAIL" $B/games/$G/characters/$AMBER)
check "DM deletes Amber (owner only)" 403 $(code -b $DM -X DELETE $B/games/$G/characters/$AMBER)
check "Robin reads Rhogar's wallet" 403 $(code -b $RO $B/games/$G/characters/$RHOGAR/currency)
NEWC=$(curl -s -b $RO "${J[@]}" -d '{"name":"Robins Alt","class":"Bard","level":1,"hpMax":8,"proficiencyBonus":2}' $B/games/$G/characters | jget 'd["ownerUserId"]')
check "character Robin creates is Robin's" "$ROID" "$NEWC"

echo "Notes privacy"
RNOTE=$(curl -s -b $RO $B/games/$G/notes | jget 'd[0]["id"]')
check "Severin edits Robin's note" 404 $(code -b $SE -X PUT "${J[@]}" -d '{"title":"x","text":"y"}' $B/games/$G/notes/$RNOTE)
check "DM edits Robin's note" 404 $(code -b $DM -X PUT "${J[@]}" -d '{"title":"x","text":"y"}' $B/games/$G/notes/$RNOTE)
check "Robin deletes Severin's note" 404 $(code -b $RO -X DELETE $B/games/$G/notes/$(curl -s -b $SE $B/games/$G/notes | jget 'd[0]["id"]'))
check "Robin opens DM-notebook on Amber" 403 $(code -b $RO "$B/games/$G/notes?aboutCharacterId=$AMBER")
check "Robin writes a new note" 200 $(code -b $RO "${J[@]}" -d '{"title":"new","text":"t"}' $B/games/$G/notes)

echo "Maps: filtering, Hide/Lock, handing on"
printf '%%PDF-1.4\n%%%%EOF\n' > $S/b.pdf
DOC1=$(curl -s -b $DM -F name=Room1 -F type=Map -F "file=@$S/b.pdf;type=application/pdf" $B/games/$G/documents | jget 'd["id"]')
DOC2=$(curl -s -b $DM -F name=Room2 -F type=Map -F "file=@$S/b.pdf;type=application/pdf" $B/games/$G/documents | jget 'd["id"]')
FILE1=$(curl -s -b $DM $B/games/$G/documents/$DOC1 | jget 'd["fileUrl"]')
check "DM shares Room1 with Amber" 200 $(code -b $DM -X PUT "${J[@]}" -d '{"hidden":false,"locked":false}' $B/games/$G/documents/$DOC1/shares/$AMBER)
check "DM sees 2 maps" 2 $(curl -s -b $DM $B/games/$G/documents | jget 'len(d)')
check "Robin sees only Room1, only Amber's share" "1 1" "$(curl -s -b $RO $B/games/$G/documents | jget 'str(len(d))+" "+str(len(d[0]["shares"]))')"
check "Severin sees 0 maps" 0 $(curl -s -b $SE $B/games/$G/documents | jget 'len(d)')
check "Severin GET Room1 directly" 404 $(code -b $SE $B/games/$G/documents/$DOC1)
check "Robin downloads Room1 file" 200 $(code -b $RO $H$FILE1)
check "Severin downloads Room1 file" 403 $(code -b $SE $H$FILE1)
check "Robin hides his copy" "True" "$(curl -s -b $RO -X PUT "${J[@]}" -d '{"hidden":true,"locked":false}' $B/games/$G/documents/$DOC1/shares/$AMBER | jget 'd["hidden"]')"
check "Robin shares unheld Room2 to himself" 403 $(code -b $RO -X PUT "${J[@]}" -d '{"hidden":false,"locked":false}' $B/games/$G/documents/$DOC2/shares/$AMBER)
check "Robin hands Room1 to Rhogar (forced visible)" "False" "$(curl -s -b $RO -X PUT "${J[@]}" -d '{"hidden":true,"locked":true}' $B/games/$G/documents/$DOC1/shares/$RHOGAR | jget 'd["hidden"]')"
check "Severin now sees Room1" 1 $(curl -s -b $SE $B/games/$G/documents | jget 'len(d)')
check "Robin changes Rhogar's share again" 403 $(code -b $RO -X PUT "${J[@]}" -d '{"hidden":true,"locked":false}' $B/games/$G/documents/$DOC1/shares/$RHOGAR)
check "Robin unshares (DM only)" 403 $(code -b $RO -X DELETE $B/games/$G/documents/$DOC1/shares/$AMBER)
check "DM unshares Rhogar" 204 $(code -b $DM -X DELETE $B/games/$G/documents/$DOC1/shares/$RHOGAR)

echo "Shops + purchases"
DEN=$(curl -s -b $DM "${J[@]}" -d '{"name":"Gold","abbreviation":"gp","color":"#d4af37","value":1}' $B/games/$G/currency-denominations | jget 'd["id"]')
SHOP=$(curl -s -b $DM "${J[@]}" -d '{"name":"Smithy","description":""}' $B/games/$G/shops | jget 'd["id"]')
ITEM=$(curl -s -b $DM "${J[@]}" -d "{\"name\":\"Dagger\",\"saleMode\":\"SharedStock\",\"stockQuantity\":5,\"prices\":[{\"denominationId\":\"$DEN\",\"amount\":2}]}" $B/games/$G/shops/$SHOP/items | jget 'd["id"]')
check "DM shares Smithy with Amber" 200 $(code -b $DM -X PUT "${J[@]}" -d '{"hidden":false,"locked":false}' $B/games/$G/shops/$SHOP/shares/$AMBER)
check "Robin sees Smithy" 1 $(curl -s -b $RO $B/games/$G/shops | jget 'len(d)')
check "Severin sees no shops" 0 $(curl -s -b $SE $B/games/$G/shops | jget 'len(d)')
check "Severin opens own share on unshared shop" 403 $(code -b $SE -X PUT "${J[@]}" -d '{"hidden":false,"locked":false}' $B/games/$G/shops/$SHOP/shares/$RHOGAR)
check "Robin fills his wallet" 200 $(code -b $RO -X PUT "${J[@]}" -d '{"quantity":10}' $B/games/$G/characters/$AMBER/currency/$DEN)
check "DM edits Amber's wallet (owner only)" 403 $(code -b $DM -X PUT "${J[@]}" -d '{"quantity":99}' $B/games/$G/characters/$AMBER/currency/$DEN)
check "Robin buys for Amber" 200 $(code -b $RO "${J[@]}" -d "{\"characterId\":\"$AMBER\",\"quantity\":1}" $B/games/$G/shops/$SHOP/items/$ITEM/purchases)
check "Robin buys for Rhogar" 403 $(code -b $RO "${J[@]}" -d "{\"characterId\":\"$RHOGAR\",\"quantity\":1}" $B/games/$G/shops/$SHOP/items/$ITEM/purchases)
check "Robin haggles his own price" 403 $(code -b $RO "${J[@]}" -d "{\"characterId\":\"$AMBER\",\"quantity\":1,\"overridePrices\":[{\"denominationId\":\"$DEN\",\"amount\":1}]}" $B/games/$G/shops/$SHOP/items/$ITEM/purchases)
check "Severin buys for Rhogar, shop not shared" 403 $(code -b $SE "${J[@]}" -d "{\"characterId\":\"$RHOGAR\",\"quantity\":1}" $B/games/$G/shops/$SHOP/items/$ITEM/purchases)
check "DM sells to Amber at haggled price" 200 $(code -b $DM "${J[@]}" -d "{\"characterId\":\"$AMBER\",\"quantity\":1,\"overridePrices\":[{\"denominationId\":\"$DEN\",\"amount\":1}]}" $B/games/$G/shops/$SHOP/items/$ITEM/purchases)
check "Amber paid 2 + 1 = 7 gp left" 7 $(curl -s -b $RO $B/games/$G/characters/$AMBER/currency | jget '[w["quantity"] for w in d if w["denominationId"]=="'$DEN'"][0]')

echo "Quotes + sessions"
Q1=$(curl -s -b $DM "${J[@]}" -d '{"text":"shared one"}' $B/games/$G/quotes | jget 'd["id"]')
curl -s -o /dev/null -b $DM "${J[@]}" -d '{"text":"hidden one"}' $B/games/$G/quotes
curl -s -o /dev/null -b $DM -X PATCH $B/games/$G/quotes/$Q1/toggle-shared
check "DM sees 2 quotes" 2 $(curl -s -b $DM $B/games/$G/quotes | jget 'len(d)')
check "Robin sees only the shared quote" "1 shared one" "$(curl -s -b $RO $B/games/$G/quotes | jget 'str(len(d))+" "+d[0]["text"]')"
curl -s -o /dev/null -b $DM "${J[@]}" -d '{"title":"The Undercroft","notes":"secret prep"}' $B/games/$G/sessions
check "DM sees prep notes" "secret prep" "$(curl -s -b $DM $B/games/$G/sessions | jget 'd[0]["notes"]')"
check "Robin sees title, notes stripped" "The Undercroft|" "$(curl -s -b $RO $B/games/$G/sessions | jget 'd[0]["title"]+"|"+d[0]["notes"]')"
check "Robin creates a session" 403 $(code -b $RO "${J[@]}" -d '{"title":"x"}' $B/games/$G/sessions)

echo; echo "passed $pass, failed $fail"
