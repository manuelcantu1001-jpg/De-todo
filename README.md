# De-todo

El cajón: proyectos que no son del hospital y que no ameritan un repositorio cada uno.
**Una carpeta por proyecto**, y lo que se publica sale solo al hacer `git push` a `main`.

| Carpeta | Qué es | Dirección |
|---|---|---|
| [`sobremesa/`](sobremesa/) | **Sobremesa · Pasatiempos en español.** 61 juegos sin anuncios, sin conexión y con el mismo lenguaje de diseño. Se instala en el teléfono con «Añadir a pantalla de inicio». | <https://manuelcantu1001-jpg.github.io/De-todo/> |
| [`reparte/`](reparte/) | **ReParte.** Dividir gastos de grupo: entras por un link de WhatsApp, sin app ni cuenta, y al final dice quién le paga cuánto a quién. | `/reparte/` |
| [`tier-list/`](tier-list/) | Una **tier list** estilo TierMaker, en un solo archivo HTML. | `/tier-list/` |

## ⚠️ Sobremesa vive en la raíz del sitio, y ahí se queda

Los demás proyectos cuelgan de su carpeta (`/reparte/`, `/tier-list/`), pero **Sobremesa se
publica en la raíz**. No es una inconsistencia que haya que emparejar: la app **ya está
instalada en teléfonos** apuntando a la raíz, y su service worker registrado con ese alcance.
Cambiarla de dirección desinstala de hecho las que ya existen y rompe cualquier link
compartido.

Si algún día se quiere una portada en la raíz, la salida es publicarla en otra ruta
(`/inicio/`, por ejemplo), no mover Sobremesa.

## Agregar un proyecto nuevo

1. Una carpeta con su nombre, en la raíz de `main`.
2. Un renglón en la tabla de arriba.
3. Si se publica, un paso en [`.github/workflows/pages.yml`](.github/workflows/pages.yml)
   copiando **sólo sus archivos de app** a `_site/<nombre>/` — no el README, no `design/`,
   no las notas.

## Cómo se publica

`git push` a `main` → GitHub Actions arma `_site` y lo empuja a la rama `gh-pages`. No hay
que tocar `gh-pages` a mano nunca: se reescribe entera en cada publicación.

## Historia

Cada proyecto nació en su propia rama de sesión (`claude/…`) y ahí se quedó: los 61 juegos
vivían en una rama llamada `claude/juego-pulelo-idea-dyz035`, y la rama que abría por
omisión sólo traía la tier list — por eso no se encontraban. El 4-sep-2026 se juntaron en
`main`, cada uno en su carpeta y con su historial completo. Las ramas viejas siguen ahí por
si acaso.
