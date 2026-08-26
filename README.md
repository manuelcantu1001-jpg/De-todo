# Encadena · El juego de las terminaciones

Juego de palabras en español: la primera palabra fija una **terminación** (o un **inicio**)
y, por turnos, cada quien dice una palabra nueva que encaje. Con «Faustino» y 3 letras,
todo debe acabar en **‑ino**: camino, destino, adivino…

Es una app web sin dependencias: abre [`index.html`](index.html) en el navegador y juega.
Instalada como PWA (menú del navegador → «Añadir a pantalla de inicio») funciona a pantalla
completa y sin conexión.

## Cómo se juega

- La palabra inicial define las letras que cuentan (2 a 5, configurable).
- Valen conjugaciones, plurales, diminutivos y **nombres propios reales**.
- No se puede repetir palabra. Una palabra inválida cuesta una **vida**.
- Si te rindes, agotas tu tiempo o te quedas sin vidas, pierdes la ronda.

## Modos

| Modo | Descripción |
|---|---|
| **1 vs 1** | Pasa el teléfono. Si una palabra no está en el diccionario, el rival decide si la acepta (ideal para nombres propios). |
| **Vs. app** | La app juega contigo usando su diccionario. Tres dificultades: fácil (≈6.000 palabras), normal (≈16.000) y experta (todo el diccionario). |
| **Solo** | Encadena tantas palabras como puedas; se guarda tu mejor racha. |
| Online | Pendiente (idea a futuro). |

## Opciones

- **Encadenar por el final o por el inicio** (fau‑… en vez de …‑ino).
- **Vidas** (1–5) y **tiempo por turno** (5–60 s), ambos opcionales.

## Identidad visual

Una sola identidad, destilada de la exploración de diseño que vive en `design/`:
papel cálido, verde botella y terracota, con las letras de la terminación como
**fichas de juego**. Tipografía: [Fraunces](https://fonts.google.com/specimen/Fraunces)
para títulos y letras, [Onest](https://fonts.google.com/specimen/Onest) para la interfaz.

## Estructura

```
index.html            La app completa (HTML + CSS + JS vanilla, sin build ni frameworks)
dicc-es.js            Diccionario de frecuencias: ~32.000 palabras
lexico-es.txt.gz      Léxico de validación: ~635.000 formas del español (normalizadas)
manifest.webmanifest  Manifiesto PWA (instalable, pantalla completa)
sw.js                 Service worker: cache para jugar sin conexión
icons/                Iconos de la app
design/               Prototipo original (canvas de diseño con 3 direcciones visuales, en React)
```

## Validación de palabras

1. **Frecuentes** (`dicc-es.js`, ~32.000 palabras por frecuencia): válida al instante.
   Es también el vocabulario con el que juega la app y el que alimenta los contadores.
2. **Léxico completo** (`lexico-es.txt.gz`, ~635.000 formas con conjugaciones, plurales
   y femeninos): segunda comprobación para todo lo que no sea frecuente.
3. **Juez rival** (1 vs 1): lo que no aparezca en ninguno lo decide el otro jugador
   (así entran los nombres propios).
4. **Árbitro IA** (opcional): si el entorno expone `window.claude.complete`, se consulta
   a la IA antes de rechazar en Solo/Vs. app.

La comparación ignora tildes y mayúsculas pero distingue la ñ. Fuentes: frecuencias de
[hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords) (OpenSubtitles 2018,
CC-BY-SA-4.0) y léxico de [words/an-array-of-spanish-words](https://github.com/words/an-array-of-spanish-words)
(derivado del diccionario hunspell de LibreOffice), ambos filtrados a 3–15 letras.

## Desarrollo

No hay build: edita `index.html` y recarga. Para probar en local con el diccionario
(los navegadores bloquean `file://` en algunos casos):

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Ideas a futuro

- Modo online (ya reservado en la interfaz).
- Sonidos y más animaciones.
- Definiciones de las palabras jugadas al final de la ronda.
- Torneo al mejor de N rondas con historial.
