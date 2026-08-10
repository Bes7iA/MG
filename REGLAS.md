# Reglas del juego — Máquinas de Guerra

Maquinas de Guerra es un juego en donde 2 jugadores se enfrentan para conquistar territorio, obtener recursos y destruir 
el castillo oponente.
Crea y envía a tus Maquinas de Guerra para reclamar territorio y sus recursos,
y utilizalos para mejorarlas, crear mas y mejorar tu castillo.

Las tácticas y estrategias de expansion y ataque definirán al ganador.

## 1. Recursos y producción

- Hay tres recursos: 🌲madera, 🌑carbón y ⚙hierro.
- Al iniciar la partida, cada jugador recibe 1 de cada recurso, más +1
  adicional del recurso de la carta de terreno que sobró del mazo (esa
  carta se revela y beneficia a ambos jugadores por igual).
- Producción por turno: al inicio de cada uno de sus turnos, un jugador
  recibe automáticamente +1 del recurso correspondiente por cada terreno
  conquistado de ese tipo, más +1 adicional por cada extractor construido
  sobre terreno de ese tipo.
- **Excepción:** el jugador que gana el lanzamiento de moneda y comienza
  la partida NO recibe producción de terrenos en su primerísimo turno
  (para compensar la ventaja de jugar primero). Esto solo aplica una vez,
  al inicio de la partida — todos los turnos siguientes, de ambos
  jugadores, reciben producción normalmente.
- Extractor:
    - Cuesta 2 madera + 2 carbón.
    - Se construye sobre un terreno propio ya conquistado; es inmóvil.
    - Produce +1 del recurso correspondiente al tipo de ese terreno.
    - Máximo 3 extractores por jugador, 1 construcción por turno.
    - Requiere confirmación antes de construirse.
    - Si el terreno donde está el extractor es conquistado por el rival,
      el extractor cambia de dueño junto con el terreno.
- Comerciar: en cualquier momento del turno, un jugador puede pagar 4
  unidades de un mismo recurso para obtener 1 de otro recurso a su
  elección. Sin límite por turno.

## 2. Tablero y conquista

- El tablero tiene 29 casillas de terreno. Se baraja un mazo de 30 cartas
  (10 de cada recurso), se coloca una boca abajo en cada casilla, y la
  carta sobrante se revela al inicio.
- Reclamo inicial: antes del primer turno, cada jugador reclama gratis
  una casilla conectada a su castillo. El orden es fijo: siempre comienza
  el Jugador Rojo, luego el Jugador Azul (no depende de la moneda).
  Cada reclamo requiere confirmación antes de aplicarse.
- Solo puede haber una máquina de guerra por casilla, incluso entre
  aliadas.
- Costos de movimiento (por cada paso a una casilla conectada):
    - Entrar o salir del propio castillo: siempre gratis.
    - Moverse a una casilla sin revelar: conquista obligatoria e inmediata,
      cuesta 1 carbón fijo. Si no hay carbón suficiente, se avisa al
      jugador y el movimiento no se realiza.
    - Pasar por una casilla ya revelada (propia o enemiga) sin
      conquistarla: cuesta 1 recurso a elección (gratis si sale/entra del
      castillo en ese mismo paso).
    - Conquistar una casilla enemiga ya revelada: cuesta 2 carbón, o 3
      carbón si esa casilla tiene un extractor.
- Conquistar una casilla (nueva o enemiga) inmoviliza a esa máquina por
  el resto del turno.

## 3. Máquinas de guerra

- Estadísticas base al construirse: 5 HP y 1 de daño.
- Costo de construcción: 3 madera y 3 hierro.
- Se construyen en el propio castillo; máximo 2 máquinas esperando dentro
  a la vez, y solo se puede construir 1 máquina por turno.
- Una máquina recién construida no puede moverse hasta el siguiente turno
  de su dueño (salvo que el dado saque Martillo y se elija activarla de
  inmediato).
- Mejoras: cuestan 1 madera y 1 hierro cada una; +1 HP y +1 de daño por
  mejora. Máximo 3 mejoras por máquina.
- **Límite total de ejército:** un jugador no puede tener más máquinas de
  guerra (en cualquier ubicación) que el límite indicado por su castillo
  (`limiteMG`: 3 por defecto, 4 al mejorar el castillo a nivel 2/5, 5 al
  llegar a nivel 5/5). El botón de construir máquina se deshabilita al
  alcanzar el límite.

## 4. Bonos por turno

 Al inicio de cada turno se tira un dado con 3 posibles resultados, los 
  que añaden un bono extra para ese turno en particular

- **Flecha:** cada máquina de guerra puede omitir el costo de
  recurso de su movimiento (no de conquista) **una vez por turno, por
  máquina**. Esto se consume la primera vez que la máquina necesitaría
  pagar un recurso para moverse — los movimientos gratis dentro/fuera
  del castillo no cuentan para este límite.
- **Rayo:** +1 a cada tipo de recurso del que el jugador tenga al
  menos un terreno conquistado.
- **Martillo:** el jugador elige entre dos efectos:
  - Construir de inmediato: lo que se construya este turno se activa
  sin esperar al siguiente turno.
  - Reparar: cura 1 HP a una máquina aliada con HP incompleto,
  seleccionándola con clic (se resalta en verde en tablero y
  panel). Si no hay ninguna máquina reparable, se avisa y el bono
  se pierde.

## 5. Combate

- El combate se activa automáticamente al mover una máquina hacia una
  casilla ocupada por una máquina enemiga, con confirmación previa.
- Daño de una máquina al atacar = su daño base + 1d4 (dado de 4 caras).
- Cada golpe muestra un aviso al jugador indicando el daño exacto y el
  HP restante del objetivo.
- Si la máquina defensora sobrevive al golpe:
    - Si tiene una casilla propia adyacente y desocupada, se retira
      automáticamente ahí y el combate termina. El atacante ocupa la
      casilla donde ocurrió el combate, con opción de conquistarla
      pagando el costo correspondiente (igual que si hubiera destruido
      al defensor).
    - Si no hay casilla de retiro disponible, el combate continúa
      alternando ataques (empezando por el defensor) hasta que una
      máquina sea destruida.
- Atacar el castillo enemigo: desde una casilla adyacente conectada al
  castillo rival (nunca se entra físicamente al castillo enemigo). Si
  hay máquinas defendiendo, deben destruirse primero (mismo cálculo de
  daño, sin retiro). Sin defensores, se golpea el HP del castillo
  directamente.
- **Cañón:**
    - Costo: 4 madera + 4 carbón + 4 hierro. Único por castillo.
    - Es completamente **ofensivo** — no tiene función de defensa. Solo
      puede dispararse durante el turno de su propio dueño.
    - Una vez por turno propio.
    - Solo contra máquinas enemigas en casillas directamente conectadas
      al propio castillo.
    - Se selecciona haciendo clic en su imagen dentro del castillo (igual
      que una máquina de guerra, pero inmóvil). Si no hay objetivos
      válidos, se avisa al jugador.
    - Daño: 2d4 (sin sumar daño base), con confirmación previa al disparo.
    - Queda disponible para disparar a partir del turno siguiente a su
      construcción (o de inmediato si el dado sacó Martillo ese turno).

## 6. Castillo

- HP inicial: 20.
- Mejorar cuesta 4 hierro; +2 HP (máximo y actual) por mejora. Máximo 5
  mejoras.
- Las mejoras también aumentan el límite de máquinas en juego (ver
  sección 3).
- Condición de victoria: si el HP del castillo enemigo llega a 0, la
  partida termina y gana el jugador que lo destruyó.

## 7. Turnos y fases

### Preparación (una sola vez)

1. Se prepara el tablero (mazo repartido boca abajo). Aviso al jugador
   indicando qué recurso extra reciben ambos jugadores esta partida.
2. Jugador Rojo reclama su terreno inicial (con aviso previo y
   confirmación), luego elige dónde ubicar su primera máquina.
3. Jugador Azul hace lo mismo.
4. Se lanza una moneda para decidir quién comienza la partida. Aviso
   combinado anunciando el resultado.
5. Comienza el juego con el ganador de la moneda.

### Cada turno, en orden

1. Producción: el jugador activo recibe los recursos generados por sus
   terrenos y extractores (excepto en el primerísimo turno de la
   partida, ver sección 1).
2. Dado de bonificación: Se avisa al jugador del resultado del dado de bono 
   que lo afectara este turno (ver sección 4)
3. Acciones libres: construir máquina (máx. 1/turno), construir
   extractor (máx. 1/turno), construir cañón (una vez en la partida),
   mejorar máquina, mejorar castillo, comerciar, mover/atacar con
   máquinas, atacar castillo enemigo, disparar cañón.
4. El jugador termina su turno manualmente.