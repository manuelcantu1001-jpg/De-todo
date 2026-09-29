# ReParte · Prompts para generar las ilustraciones

Genera cada ícono por separado, en formato cuadrado 1:1. Usa el mismo prompt base en todos y cambia solo la escena. Si el generador acepta imagen de referencia de estilo, sube la tira de íconos de referencia y el primer ícono que te guste.

## Prompt base (va en todos)

```
Minimalist hand-drawn line illustration for an app icon. Thin uniform black ink line, slightly irregular like a felt-tip pen, open strokes, elegant realistic human hands with slender articulated fingers and a small shirt cuff at the wrist. Hands have no fill (only outline). Simple geometric objects in solid off-white (#FBF9F4) with no outline. Flat solid background color {COLOR}, rounded square tile. One single concept, centered, lots of empty space, the hand enters from the edge of the frame. No shadows, no gradients, no texture, no text, no numbers, no currency symbols, no logos.
Scene: {ESCENA}
```

Negativo (si el generador lo permite):

```
text, letters, numbers, shading, gradient, 3d, cartoon, glove, thick lines, extra fingers, deformed hands, realistic skin, photo, busy background, multiple concepts
```

## Escenas

| # | Ícono | {COLOR} | {ESCENA} |
|---|---|---|---|
| 1 | Crear evento | terracotta #DC6D4E | a hand planting a small white flag on a thin ground line |
| 2 | Compartir el link | dusty pink #E8C9CB | two hands from opposite sides, each pinching a small white dot, the dots joined by a thin black thread |
| 3 | Entrar con tu nombre | sage green #AFCDC1 | an index finger touching a white dot at the center of a thin black circle |
| 4 | Capturar gasto | sand beige #DFB18B | a finger pointing at an empty line on a white paper receipt with a zigzag bottom edge |
| 5 | Repartir entre todos | plum #B9627F | a hand holding a large white circle above three small outlined circles in a row |
| 6 | Reparto personalizado | slate blue #6395C6 | a finger adjusting one of three slider knobs on a white card |
| 7 | Peso y dólar | olive #7F8E5D | two white coins with two curved black arrows between them, one hand holding the left coin |
| 8 | Recibo por partidas | coral #E79B96 | a finger ticking one checkbox on a white list with three rows |
| 9 | Cerrar el evento | warm off-white #EDEBE3 | a perfectly level seesaw with one circle on each end resting on a white triangle, a fingertip steadying the bar |
| 10 | Quién le paga a quién | sand beige #DFB18B | two white squares connected by a thin wavy thread, a hand pinching the middle of the thread |
| 11 | Copiar CLABE | dusty pink #E8C9CB | a small fanned stack of white sheets, a finger tapping the front sheet |
| 12 | Recordatorio | lavender #C6C1DF | a hand gently holding a white hourglass with a few black sand grains |
| 13 | Resumen para compartir | sage green #AFCDC1 | an open palm holding a white card with three lines, a thin arrow curving up and away |
| 14 | Respaldo y sin conexión | terracotta #DC6D4E | an open palm facing up holding a white cloud with a small black keyhole |
| 15 | Privacidad | plum #B9627F | an open palm holding a white shield with a small black triangle of three connected nodes |

## Para que se vean como un set

- Genera primero el 3 o el 14 (los más sencillos). Cuando uno te guste, úsalo como referencia de estilo para los demás.
- Descarta cualquier resultado con dedos de más, sombras o texto.
- Pídelos en al menos 1024 × 1024 px, en PNG.
- Guárdalos en `design/ilustraciones/` con el número y el nombre, por ejemplo `03-entrar.png`.
