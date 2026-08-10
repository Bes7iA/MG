# Arquitectura del proyecto — Máquinas de Guerra

Este documento describe cómo está organizado el código del juego, para facilitar
que futuras sesiones de trabajo (propias o de otros colaboradores) entiendan
rápido dónde vive cada cosa.

## Descripción general

Máquinas de Guerra es un juego de estrategia por turnos para 2 jugadores,
construido con JavaScript vanilla (ES6 Modules), HTML y CSS — sin frameworks
ni herramientas de build. Se ejecuta directamente en el navegador.

## Cómo correr el proyecto

Abrir `index.html` con un servidor local (por ejemplo, con la extensión
"Live Server" de WebStorm o similar). No funciona abriendo el archivo
directamente con doble clic (protocolo `file://`), porque los módulos ES6
requieren ser servidos por HTTP.

## Mapa de módulos

| Archivo | Responsabilidad |
|---|---|
| `constants.js` | Datos fijos del juego: recursos, costos, posiciones del tablero, conexiones entre casillas, rutas de imágenes. |
| `utils.js` | Utilidades genéricas sin relación al dominio del juego: selector de DOM (`$`), `rivalDe`, `log`. |
| `state.js` | El estado completo del juego (`gameState`) y su creación. Incluye "funciones mensajeras" (`setModoAccion`, `setSeleccion`, `iniciarNuevoEstado`) para reasignar variables exportadas desde otros módulos. También aloja utilidades de recursos (`tienePago`, `pagar`, `costoTexto`) para evitar dependencias circulares con `render.js`. |
| `board.js` | Reglas del tablero: conexiones entre casillas, dueño de un castillo, liberar/buscar retiro de casillas. |
| `combat.js` | Dados y resolución de combate entre máquinas de guerra. |
| `ui-modal.js` | Sistema de modal genérico basado en Promesas (`abrirModal`, `preguntar`, `elegirRecurso`), con soporte de retraso obligatorio para mensajes importantes. |
| `render.js` | Todo el renderizado en pantalla: paneles de jugador, tablero, botones, posicionamiento de casillas. |
| `actions.js` | Las acciones de juego: construir, mover, atacar, comerciar, turnos, fases. Es el módulo más grande y el que más orquesta entre los demás. |
| `events.js` | Registro de listeners de clic y es el punto de entrada de la aplicación (`document.addEventListener('DOMContentLoaded', ...)`). |

No existe un `app.js`: `index.html` carga `events.js` directamente como
punto de entrada (`<script type="module" src="events.js">`).

## Jerarquía de dependencias

Para evitar dependencias circulares, los módulos siguen este orden
(un módulo de un nivel no debería importar de un nivel superior):

Nivel 1 (sin dependencias internas):
constants.js, utils.js

Nivel 2:
state.js → usa constants.js
board.js → usa constants.js, state.js

Nivel 3:
combat.js → usa state.js, board.js, utils.js

Nivel 4:
actions.js → usa state.js, board.js, combat.js, utils.js, ui-modal.js, render.js
render.js → usa state.js, constants.js, utils.js

Nivel 5:
ui-modal.js → usa utils.js, state.js, constants.js
events.js → usa actions.js, render.js, state.js

Nivel 6:
(punto de entrada: events.js se carga directo desde index.html)

## Decisiones de diseño relevantes

### Cómo se comparte el estado entre módulos

`gameState`, `modoAccion` y `maquinaSeleccionadaId` se exportan como
`export let` desde `state.js`. Cualquier módulo puede **leerlos**
directamente vía `import`. Para **reasignarlos**, es obligatorio usar
las funciones mensajeras (`setModoAccion`, `setSeleccion`,
`iniciarNuevoEstado`) definidas en `state.js` — un módulo externo no
puede hacer `modoAccion = 'algo'` directamente, JavaScript no lo permite
entre módulos distintos.

**Cuidado con el orden de llamadas**: si una función llama a
`setModoAccion(...)` y luego a otra función que también reasigna
`modoAccion` (como `seleccionarMaquina`, que siempre lo pone en `null`),
la segunda llamada sobreescribe a la primera. Esto causó un bug real
donde `activarModoExtractor` se autocancelaba (ver historial de commits).
Al agregar nuevas acciones con modos especiales, poner `setModoAccion(...)`
siempre como el último paso antes de `renderTodo()`.

### Sistema de modal con retraso

`preguntar(titulo, descripcion, opciones, conRetraso)` acepta un cuarto
parámetro opcional. Cuando es `true`, los botones nacen deshabilitados
mostrando una cuenta regresiva de 3 segundos antes de poder pulsarse.
Se usa para mensajes de hito importante (inicio de partida, fin de
conquista inicial, bono de dado tipo Martillo con elección) — no para
decisiones tácticas del flujo normal de juego (mover, comerciar, combate).

### Posiciones del tablero

`POSICIONES` en `constants.js` es la única fuente de verdad para la
ubicación y tamaño de cada casilla y castillo. Se aplican dinámicamente
al DOM mediante `aplicarPosicionesTablero()` en `render.js`, llamada una
vez al iniciar la aplicación. `estilos.css` no contiene coordenadas fijas
de nodos — solo estilos de apariencia (colores, bordes, animaciones).

## Reglas del juego

El detalle completo de mecánicas (recursos, combate, turnos, dado
especial, etc.) está documentado en [`REGLAS.md`](./REGLAS.md).