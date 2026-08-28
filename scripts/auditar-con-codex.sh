#!/usr/bin/env bash
# Audita un juego de la colección con Codex (OpenAI), en el mismo formato que
# usan las auditorías de Claude. Pensado para contrastar dos opiniones.
#
#   scripts/auditar-con-codex.sh naval
#   scripts/auditar-con-codex.sh                # audita todos
#
# REQUISITOS
#   1. Codex instalado:  npm i -g @openai/codex
#   2. Credencial:       export OPENAI_API_KEY=...   (o `codex login`)
#   3. Salida a internet hacia api.openai.com.
#      En las sesiones remotas de Claude Code la red va por un proxy con lista
#      blanca: si api.openai.com no está permitido, el túnel falla con 403 y
#      Codex se queda colgado. Eso se cambia en la configuración del entorno,
#      no aquí.
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
JUEGOS=("$@")
if [ ${#JUEGOS[@]} -eq 0 ]; then
  mapfile -t JUEGOS < <(ls "$RAIZ/juegos")
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "No encuentro codex. Instálalo con:  npm i -g @openai/codex" >&2
  exit 1
fi

# Comprobación rápida de salida a internet antes de arrancar nada
if ! curl -sS -o /dev/null --max-time 10 https://api.openai.com/ 2>/dev/null; then
  echo "No hay salida hacia api.openai.com desde esta máquina." >&2
  echo "Si estás en una sesión remota de Claude Code, permite ese dominio en la" >&2
  echo "política de red del entorno; si no, revisa tu conexión o proxy." >&2
  exit 2
fi

SALIDA="$RAIZ/.auditorias"
mkdir -p "$SALIDA"

for juego in "${JUEGOS[@]}"; do
  ruta="juegos/$juego/index.html"
  [ -f "$RAIZ/$ruta" ] || { echo "· $juego: no existe, lo salto"; continue; }
  echo "── Auditando $juego ──────────────────────────────"
  codex exec --skip-git-repo-check --cd "$RAIZ" "$(cat <<PROMPT
Eres auditor de diseño de juego. Lee $ruta (juego de pasatiempos en español,
vanilla JS sin build) y audítalo con dureza. No cambies ningún archivo.

Contesta en español y en este formato:
- VEREDICTO: SÓLIDO / FLOJO / RELLENO / ROTO
- Qué hace bien
- Los 3 problemas más graves, ordenados, con la línea de código donde están
- Si el generador promete algo (solución única, resoluble sin adivinar,
  siempre ganable), di si el código de verdad lo garantiza
- Si la dificultad cambia algo real o es decorado
- Si la marca/récord mide habilidad o suerte
- Qué harías para arreglarlo

Sé escéptico: es mejor señalar un problema real que aprobar por cortesía.
PROMPT
)" 2>&1 | tee "$SALIDA/$juego.md"
  echo
done

echo "Auditorías guardadas en $SALIDA/"
