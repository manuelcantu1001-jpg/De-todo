# Encadena · El juego de las terminaciones

Juego de palabras en español: la primera palabra fija una **terminación** (o un **inicio**)
y, por turnos, cada quien dice una palabra nueva que encaje. Con «Faustino» y 3 letras,
todo debe acabar en **‑ino**: camino, destino, adivino…

Es una app web sin dependencias: abre [`index.html`](index.html) en el navegador y juega.

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
- **Tres temas visuales** heredados de la exploración de diseño: *Limpio*, *Fieltro* (mesa de juego) y *Cálido*. Se cambian desde la pantalla inicial y se recuerdan.

## Estructura

```
index.html   La app completa (HTML + CSS + JS vanilla, sin build ni frameworks)
dicc-es.js   Diccionario: ~32.000 palabras del español ordenadas por frecuencia
design/      Prototipo original (canvas de diseño con las 3 direcciones visuales, en React)
```

## Validación de palabras

1. **Diccionario local** (`dicc-es.js`): si la palabra está, es válida al instante.
   La comparación ignora tildes y mayúsculas pero distingue la ñ.
2. **Juez rival** (modo 1 vs 1): lo que no esté en el diccionario lo decide el otro jugador.
3. **Árbitro IA** (opcional): si el entorno expone `window.claude.complete`
   (p. ej. dentro de un artifact de Claude), se consulta a la IA para palabras dudosas
   y como respaldo del rival app.

El diccionario deriva de [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords)
(OpenSubtitles 2018, licencia CC-BY-SA-4.0), filtrado a palabras de 3–15 letras sin ruido.

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
