#!/usr/bin/env bash
# e2e HTTP del plan semanal (el home de la app). Verifica contra la API real que la semana
# funcione día a día: 7 días siempre completos, un outfit por día, días independientes entre
# sí y entre semanas, confirmar/liberar acotados al día, validaciones y el caso huérfano.
#
# Sólo golpea endpoints públicos — nunca toca la DB directo (violaría las capas).
#
# Uso (ver docs/08-INSTALLATION-GUIDE.md para levantar el stack):
#   docker compose -f compose.dev.yaml up -d postgres
#   npx prisma migrate deploy && npm run seed && npm run start:dev
#   ./e2e/weekly-plan.e2e.sh                       # contra http://localhost:3000/api
#   API_URL=http://localhost:3010/api ./e2e/weekly-plan.e2e.sh
#
# Idempotente: libera sus días antes de empezar. Deja prendas/outfits con prefijo "e2e ".
API="${API_URL:-http://localhost:3000/api}"
PASS=0; FAIL=0
j() { python3 -c "import sys,json;d=json.load(sys.stdin);print(eval('d'+'$1'))" 2>/dev/null; }
req() { # método path [body] -> imprime "STATUS<TAB>BODY"
  local m=$1 p=$2 b=${3:-}
  if [ -n "$b" ]; then
    curl -s -o /tmp/e2e.body -w '%{http_code}' -X "$m" "$API$p" -H 'Content-Type: application/json' -d "$b"
  else
    curl -s -o /tmp/e2e.body -w '%{http_code}' -X "$m" "$API$p"
  fi
  printf '\t'; cat /tmp/e2e.body
}
check() { # descripción esperado obtenido
  if [ "$2" = "$3" ]; then PASS=$((PASS+1)); printf '  ✅ %-62s %s\n' "$1" "$3"
  else FAIL=$((FAIL+1)); printf '  ❌ %-62s esperado=%s obtenido=%s\n' "$1" "$2" "$3"; fi
}
body() { cat /tmp/e2e.body; }
# cuántos días de una WeekPlanView tienen algo planeado
planned_count() { python3 -c 'import sys,json;print(len([x for x in json.load(sys.stdin)["days"] if x["plannedOutfit"]]))'; }
# el outfit (o el planeado) del día N de una WeekPlanView; "None" si está libre
day_field() { python3 -c "import sys,json;d=json.load(sys.stdin)['days'][$1]['$2'];print(d['id'] if d and '$3'=='id' else (d['$3'] if d else None))"; }
status() { echo "$1" | cut -f1; }

# Semana de referencia fija (lunes 2026-08-17 → domingo 2026-08-23).
MON=2026-08-17; TUE=2026-08-18; WED=2026-08-19; SUN=2026-08-23

echo "== 0. Preparación: días limpios + 2 prendas + 2 outfits =="
# Libera los días que usa el guión: sin esto, una corrida previa dejaría días planeados y las
# cuentas de "cuántos días tiene la semana" arrancarían torcidas. El 404 de un día ya libre
# es el resultado esperado, así que se descarta.
for d in $MON $TUE $WED $SUN 2026-08-24; do
  curl -s -o /dev/null -X DELETE "$API/planning/$d"
done
CAT=$(curl -s "$API/clothes/categories" | python3 -c 'import sys,json;print(json.load(sys.stdin)[0]["id"])')
COL=$(curl -s "$API/clothes/colors"     | python3 -c 'import sys,json;print(json.load(sys.stdin)[0]["id"])')
mk_item() { curl -s -X POST "$API/clothes" -H 'Content-Type: application/json' \
  -d "{\"name\":\"$1\",\"categoryId\":\"$CAT\",\"colorId\":\"$COL\"}" \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["id"])'; }
I1=$(mk_item "e2e prenda A"); I2=$(mk_item "e2e prenda B")
mk_outfit() { curl -s -X POST "$API/outfits" -H 'Content-Type: application/json' \
  -d "{\"name\":\"$1\",\"outfitItems\":[{\"clothingItemId\":\"$I1\",\"order\":1},{\"clothingItemId\":\"$I2\",\"order\":2}]}" \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["id"])'; }
O1=$(mk_outfit "e2e Look Lunes"); O2=$(mk_outfit "e2e Look Martes")
echo "  prendas=$I1,$I2  outfits=$O1,$O2"

echo
echo "== 1. GET /planning/week devuelve 7 días completos =="
R=$(req GET "/planning/week?start=$WED"); check "status" 200 "$(status "$R")"
check "weekStart normalizado al lunes" "$MON" "$(body | j '[\"weekStart\"]')"
check "weekEnd = domingo"              "$SUN" "$(body | j '[\"weekEnd\"]')"
check "7 días"                         "7"    "$(body | j '[\"days\"].__len__()')"
check "todos libres al inicio"         "0"    "$(body | planned_count)"

echo
echo "== 2. POST /planning planea un outfit por día =="
R=$(req POST "/planning" "{\"outfitId\":\"$O1\",\"day\":\"$MON\"}"); check "lunes → 201" 201 "$(status "$R")"
check "devuelve el día pedido" "$MON" "$(body | j '[\"date\"]')"
check "hidrata el outfit"      "$O1"  "$(body | j '[\"outfit\"][\"id\"]')"
check "trae las prendas"       "2"    "$(body | j '[\"items\"].__len__()')"
R=$(req POST "/planning" "{\"outfitId\":\"$O2\",\"day\":\"$WED\"}"); check "miércoles → 201" 201 "$(status "$R")"

echo
echo "== 3. Los días conviven (NO hay un solo activo global) =="
R=$(req GET "/planning/week?start=$MON")
PLANNED=$(body | planned_count)
check "2 días planeados en la semana" "2" "$PLANNED"
check "lunes conserva su outfit"  "$O1" "$(body | day_field 0 outfit id)"
check "miércoles con el suyo"     "$O2" "$(body | day_field 2 outfit id)"
check "martes sigue libre"        "None" "$(body | day_field 1 plannedOutfit status)"

echo
echo "== 4. Re-postear un día lo reemplaza SÓLO en ese día =="
R=$(req POST "/planning" "{\"outfitId\":\"$O2\",\"day\":\"$MON\"}"); check "status" 201 "$(status "$R")"
R=$(req GET "/planning/week?start=$MON")
check "lunes ahora apunta al outfit nuevo" "$O2" "$(body | day_field 0 outfit id)"
check "sigue habiendo 2 días planeados" "2" "$(body | planned_count)"
check "miércoles intacto" "$O2" "$(body | day_field 2 outfit id)"

echo
echo "== 5. PUT /planning/confirm confirma un solo día =="
R=$(req PUT "/planning/confirm" "{\"day\":\"$MON\"}"); check "status" 200 "$(status "$R")"
check "status=confirmed" "confirmed" "$(body | j '[\"status\"]')"
R=$(req GET "/planning/week?start=$MON")
check "lunes confirmado"          "confirmed" "$(body | day_field 0 plannedOutfit status)"
check "miércoles sigue planned"   "planned"   "$(body | day_field 2 plannedOutfit status)"

echo
echo "== 6. GET /planning?day= devuelve un día suelto =="
R=$(req GET "/planning?day=$WED"); check "status" 200 "$(status "$R")"
check "es el día pedido" "$WED" "$(body | j '[\"date\"]')"
R=$(req GET "/planning?day=$TUE")
check "día libre → plannedOutfit null" "None" "$(body | j '[\"plannedOutfit\"]')"
check "día libre → items vacíos"       "0"    "$(body | j '[\"items\"].__len__()')"

echo
echo "== 7. DELETE /planning/:day libera SÓLO ese día =="
R=$(req DELETE "/planning/$MON"); check "status" 200 "$(status "$R")"
R=$(req GET "/planning/week?start=$MON")
check "lunes liberado"      "None" "$(body | day_field 0 plannedOutfit status)"
check "miércoles intacto"   "$O2"  "$(body | day_field 2 outfit id)"
R=$(req DELETE "/planning/$MON"); check "borrar un día ya libre → 404" 404 "$(status "$R")"

echo
echo "== 8. Semanas distintas son independientes =="
NEXT_MON=2026-08-24
R=$(req POST "/planning" "{\"outfitId\":\"$O1\",\"day\":\"$NEXT_MON\"}"); check "planear la semana siguiente → 201" 201 "$(status "$R")"
R=$(req GET "/planning/week?start=$NEXT_MON")
check "weekStart de la semana siguiente" "$NEXT_MON" "$(body | j '[\"weekStart\"]')"
check "1 día planeado ahí" "1" "$(body | planned_count)"
R=$(req GET "/planning/week?start=$MON")
check "la semana anterior no cambió" "1" "$(body | planned_count)"

echo
echo "== 9. Validaciones =="
R=$(req POST "/planning" "{\"outfitId\":\"$O1\"}");                          check "POST sin day → 400"                400 "$(status "$R")"
R=$(req POST "/planning" "{\"outfitId\":\"$O1\",\"day\":\"19/08/2026\"}");   check "POST con formato inválido → 400"   400 "$(status "$R")"
R=$(req POST "/planning" "{\"outfitId\":\"$O1\",\"day\":\"2026-02-31\"}");   check "POST con fecha inexistente → 400"  400 "$(status "$R")"
R=$(req POST "/planning" "{\"outfitId\":\"11111111-2222-4333-8444-555555555555\",\"day\":\"$TUE\"}")
check "POST con outfit inexistente → 404" 404 "$(status "$R")"
R=$(req PUT "/planning/confirm" "{\"day\":\"$TUE\"}");                       check "confirmar un día libre → 404"      404 "$(status "$R")"
R=$(req GET "/planning/week?start=nope");                                     check "week con start inválido → 400"     400 "$(status "$R")"

echo
echo "== 10. Día huérfano: se archiva el outfit planeado =="
O3=$(mk_outfit "e2e Look a archivar")
req POST "/planning" "{\"outfitId\":\"$O3\",\"day\":\"$SUN\"}" >/dev/null
req DELETE "/outfits/$O3" >/dev/null
R=$(req GET "/planning?day=$SUN"); check "status" 200 "$(status "$R")"
check "queda el planeado" "p" "$(body | python3 -c 'import sys,json;print("p" if json.load(sys.stdin)["plannedOutfit"] else "none")')"
check "pero sin outfit (huérfano)" "None" "$(body | j '[\"outfit\"]')"

echo
echo "──────────────────────────────────────────────────────────"
echo "  PASS=$PASS  FAIL=$FAIL"
[ "$FAIL" -eq 0 ] && echo "  VEREDICTO: ✅ TODO VERDE" || echo "  VEREDICTO: ❌ HAY FALLOS"
exit $([ "$FAIL" -eq 0 ] && echo 0 || echo 1)
