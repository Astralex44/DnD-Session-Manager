#!/bin/bash
# v0.11 checks: shop location, shop categories + weight, purchase → inventory (with stacking),
# timers aimed at characters, clearing your own dice rolls, upload size limit.
# WARNING: wipes users, members, invites, characters, shops, currencies, timers and dice rolls in the LOCAL dev
# database (docker container "dnd-postgres"), like ownership-matrix.sh. Local only.
# Needs the API running in Development with Auth__DmDiscordId=111 (see README.md).
# Usage: shop-timer-dice-matrix.sh [scratch dir for cookie jars]
S=${1:-$(mktemp -d)}; H=${DND_TEST_API:-http://localhost:5001}; B=$H/api; G=00000000-0000-0000-0000-000000000001
DM=$S/c_dm.jar; RO=$S/c_ro.jar; SE=$S/c_se.jar; rm -f $DM $RO $SE
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then pass=$((pass+1)); printf "  ok   %-62s %s\n" "$1" "$3"; else fail=$((fail+1)); printf "  FAIL %-62s want %s got %s\n" "$1" "$2" "$3"; fi; }
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
J=(-H 'Content-Type: application/json')
sql() { docker exec dnd-postgres psql -U postgres -d ${DND_TEST_DB:-dndsessionmanager} -tAc "$1"; }
jget() { python3 -c "import sys,json;d=json.load(sys.stdin);print($1)"; }

sql 'delete from "DiceRolls"; delete from "GameTimers"; delete from "Notes"; delete from "DocumentShares"; delete from "Documents"; delete from "Purchases"; delete from "ShopShares"; delete from "ShopItemPrices"; delete from "ShopItems"; delete from "Shops"; delete from "CharacterCurrencies"; delete from "CurrencyDenominations"; update "Characters" set "ActiveLevelSheetId"=null; delete from "Characters"; delete from "GameMembers"; delete from "GameInvites"; delete from "Users";' >/dev/null

echo "Setup: DM, Robin (Amber), Severin (Rhogar)"
curl -s -o /dev/null -c $DM "$B/auth/dev-login?discordId=111&handle=thedm"
for h in robin severin; do curl -s -o /dev/null -b $DM "${J[@]}" -d "{\"discordHandle\":\"$h\"}" $B/games/$G/access/invites; done
curl -s -o /dev/null -c $RO "$B/auth/dev-login?discordId=222&handle=robin"
curl -s -o /dev/null -c $SE "$B/auth/dev-login?discordId=333&handle=severin"
AMBER=$(curl -s -b $RO "${J[@]}" -d '{"name":"Amber","class":"Rogue","level":1,"hpMax":10,"proficiencyBonus":2}' $B/games/$G/characters | jget 'd["id"]')
RHOGAR=$(curl -s -b $SE "${J[@]}" -d '{"name":"Rhogar","class":"Paladin","level":1,"hpMax":12,"proficiencyBonus":2}' $B/games/$G/characters | jget 'd["id"]')
check "both characters created" 2 $(sql 'select count(*) from "Characters" where "OwnerUserId" is not null')

echo "Shop items: category + weight"
DEN=$(curl -s -b $DM "${J[@]}" -d '{"name":"Gold","abbreviation":"gp","color":"#d4af37","value":1}' $B/games/$G/currency-denominations | jget 'd["id"]')
SHOP=$(curl -s -b $DM "${J[@]}" -d '{"name":"Smithy","description":""}' $B/games/$G/shops | jget 'd["id"]')
ROPE='{"name":"Rope (50 ft)","description":"Hempen.","category":"adventuring GEAR","weight":10,"saleMode":"SharedStock","stockQuantity":5,"prices":[{"denominationId":"'$DEN'","amount":1}]}'
ITEM=$(curl -s -b $DM "${J[@]}" -d "$ROPE" $B/games/$G/shops/$SHOP/items | jget 'd["id"]')
check "category normalised to the list's spelling" "Adventuring gear 10.0" "$(curl -s -b $DM $B/games/$G/shops/$SHOP | jget 'd["items"][0]["category"]+" "+str(float(d["items"][0]["weight"]))')"
check "unknown category refused" 400 $(code -b $DM "${J[@]}" -d '{"name":"X","category":"Snacks","saleMode":"SharedStock","prices":[{"denominationId":"'$DEN'","amount":1}]}' $B/games/$G/shops/$SHOP/items)
check "category missing → Miscellaneous" "Miscellaneous" "$(curl -s -b $DM "${J[@]}" -d '{"name":"Trinket","saleMode":"SharedStock","prices":[{"denominationId":"'$DEN'","amount":1}]}' $B/games/$G/shops/$SHOP/items | jget 'd["category"]')"
check "edit keeps category + weight" "Tools 2.5" "$(curl -s -b $DM -X PUT "${J[@]}" -d '{"name":"Rope (50 ft)","description":"Hempen.","category":"Tools","weight":2.5,"saleMode":"SharedStock","stockQuantity":5,"prices":[{"denominationId":"'$DEN'","amount":1}]}' $B/games/$G/shops/$SHOP/items/$ITEM | jget 'd["category"]+" "+str(float(d["weight"]))')"
curl -s -o /dev/null -b $DM -X PUT "${J[@]}" -d "$ROPE" $B/games/$G/shops/$SHOP/items/$ITEM

echo "Shop location"
check "location saved, trimmed" "Waterdeep, Dock Ward" "$(curl -s -b $DM "${J[@]}" -d '{"name":"Harbour Smith","description":"","location":"  Waterdeep, Dock Ward "}' $B/games/$G/shops | jget 'd["location"]')"
check "location editable" "Neverwinter" "$(curl -s -b $DM -X PUT "${J[@]}" -d '{"name":"Smithy","description":"","location":"Neverwinter"}' $B/games/$G/shops/$SHOP | jget 'd["location"]')"
check "no location → empty" "" "$(curl -s -b $DM "${J[@]}" -d '{"name":"Peddler","description":""}' $B/games/$G/shops | jget 'd["location"]')"
check "location over 100 chars refused" 400 $(code -b $DM "${J[@]}" -d '{"name":"X","description":"","location":"'$(printf 'a%.0s' $(seq 1 101))'"}' $B/games/$G/shops)

echo "Purchase → inventory"
curl -s -o /dev/null -b $DM -X PUT "${J[@]}" -d '{"hidden":false,"locked":false}' $B/games/$G/shops/$SHOP/shares/$AMBER
curl -s -o /dev/null -b $RO -X PUT "${J[@]}" -d '{"quantity":10}' $B/games/$G/characters/$AMBER/currency/$DEN
BUY() { code -b $1 "${J[@]}" -d '{"characterId":"'$AMBER'","quantity":'$2'}' $B/games/$G/shops/$SHOP/items/$ITEM/purchases; }
check "Robin buys 2 rope" 200 $(BUY $RO 2)
INV='" | ".join("/".join([i["name"], str(i["quantity"]), i["category"], str(float(i["weight"])), i["description"]]) for i in d["items"])'
check "rope in Amber's inventory with all fields" "Rope (50 ft)/2/Adventuring gear/10.0/Hempen." "$(curl -s -b $RO $B/games/$G/characters/$AMBER | jget "$INV")"
check "DM sells 1 more → stacks on the same row" "Rope (50 ft)/3/Adventuring gear/10.0/Hempen." "$(BUY $DM 1 >/dev/null; curl -s -b $RO $B/games/$G/characters/$AMBER | jget "$INV")"
sql "update \"CharacterItems\" set \"Name\"='rope (50 FT)'" >/dev/null; BUY $RO 1 >/dev/null
check "stack matches name case-insensitively" "1 4" "$(curl -s -b $RO $B/games/$G/characters/$AMBER | jget 'str(len(d["items"]))+" "+str(d["items"][0]["quantity"])')"
check "coins and stock still debited (6 gp, 1 left)" "6 1" "$(curl -s -b $RO $B/games/$G/characters/$AMBER/currency | jget '[w["quantity"] for w in d if w["denominationId"]=="'$DEN'"][0]') $(curl -s -b $DM $B/games/$G/shops/$SHOP | jget '[i for i in d["items"] if i["id"]=="'$ITEM'"][0]["stockQuantity"]')"
check "failed purchase adds nothing" "400 1 4" "$(BUY $RO 5) $(curl -s -b $RO $B/games/$G/characters/$AMBER | jget 'str(len(d["items"]))+" "+str(d["items"][0]["quantity"])')"

echo "Timers aimed at characters"
check "player can't start a timer" 403 $(code -b $RO "${J[@]}" -d '{"label":"x","durationSeconds":60}' $B/games/$G/timers)
check "DM: timer for everyone" 200 $(code -b $DM "${J[@]}" -d '{"label":"Ritual","durationSeconds":600}' $B/games/$G/timers)
POISON='{"label":"Poison","durationSeconds":60,"characterIds":["'$AMBER'"]}'
check "DM: timer for Amber only" "Amber" "$(curl -s -b $DM "${J[@]}" -d "$POISON" $B/games/$G/timers | jget '",".join(t["name"] for t in d["targets"])')"
check "DM: timer for both" 200 $(code -b $DM "${J[@]}" -d '{"label":"Bless","durationSeconds":60,"characterIds":["'$AMBER'","'$RHOGAR'"]}' $B/games/$G/timers)
check "DM: unknown character refused" 400 $(code -b $DM "${J[@]}" -d '{"label":"x","durationSeconds":60,"characterIds":["99999999-9999-9999-9999-999999999999"]}' $B/games/$G/timers)
check "DM sees all 3" "Ritual,Poison,Bless" "$(curl -s -b $DM $B/games/$G/timers | jget '",".join(t["label"] for t in d)')"
check "Robin sees all 3 (one is his)" "Ritual,Poison,Bless" "$(curl -s -b $RO $B/games/$G/timers | jget '",".join(t["label"] for t in d)')"
check "Severin doesn't see Amber's timer" "Ritual,Bless" "$(curl -s -b $SE $B/games/$G/timers | jget '",".join(t["label"] for t in d)')"
check "deleting a character drops its targets" 0 "$(curl -s -o /dev/null -b $SE -X DELETE $B/games/$G/characters/$RHOGAR; sql "select count(*) from \"GameTimerTargets\" where \"CharacterId\"='$RHOGAR'")"

echo "Dice: clear own history"
for i in 1 2 3; do curl -s -o /dev/null -b $RO "${J[@]}" -d '{"sides":20,"count":1,"modifier":0}' $B/games/$G/dice/roll; done
curl -s -o /dev/null -b $SE "${J[@]}" -d '{"sides":6,"count":1,"modifier":0}' $B/games/$G/dice/roll
ROLL=$(curl -s -b $RO $B/games/$G/dice | jget 'd[0]["id"]')
SEROLL=$(curl -s -b $SE $B/games/$G/dice | jget 'd[0]["id"]')
check "Robin can't delete Severin's roll" 404 $(code -b $RO -X DELETE $B/games/$G/dice/$SEROLL)
check "DM can't delete Severin's roll either" 404 $(code -b $DM -X DELETE $B/games/$G/dice/$SEROLL)
check "Robin deletes one of his" 204 $(code -b $RO -X DELETE $B/games/$G/dice/$ROLL)
check "Robin has 2 left" 2 $(curl -s -b $RO $B/games/$G/dice | jget 'len(d)')
check "Robin clears all" 204 $(code -b $RO -X DELETE $B/games/$G/dice)
check "Robin has none, Severin still has his" "0 1" "$(curl -s -b $RO $B/games/$G/dice | jget 'len(d)') $(curl -s -b $SE $B/games/$G/dice | jget 'len(d)')"

echo "Upload limit (100 MB)"
BIG=$S/big.pdf; [ -f $BIG ] || { printf '%%PDF-1.4\n' > $BIG; dd if=/dev/zero bs=1048576 count=50 2>/dev/null >> $BIG; }
check "DM uploads a 50 MB PDF (was over the old ~28.6 MB)" 201 $(code -b $DM -F Name=Big -F Type=Book -F "File=@$BIG;type=application/pdf" $B/games/$G/documents)
HUGE=$S/huge.pdf; [ -f $HUGE ] || { printf '%%PDF-1.4\n' > $HUGE; dd if=/dev/zero bs=1048576 count=102 2>/dev/null >> $HUGE; }
# Kestrel stops reading at the limit; [ApiController] turns the failed form read into a 400 naming it.
check "102 MB PDF refused" "400 True" "$(curl -s -w ' %{http_code}' -b $DM -F Name=Huge -F Type=Book -F "File=@$HUGE;type=application/pdf" $B/games/$G/documents | python3 -c "import sys;t=sys.stdin.read();print(t[-3:], 'Request body too large' in t)")"
check "only the 50 MB one stored" 1 $(sql 'select count(*) from "Documents"')
curl -s -o /dev/null -b $DM -X DELETE $B/games/$G/documents/$(curl -s -b $DM $B/games/$G/documents | jget 'd[0]["id"]')

echo "passed $pass, failed $fail"
