// ==========================================
// MÁQUINAS DE GUERRA - MOTOR DEL JUEGO
// ==========================================

// ---------- CONSTANTES ----------
const RECURSOS = ['madera', 'carbon', 'hierro'];
const EMOJI = { madera: '🪵', carbon: '⬛', hierro: '⚙️' };
const NOMBRE = { madera: 'Madera', carbon: 'Carbón', hierro: 'Hierro' };

const NODOS_TABLERO = Array.from({ length: 29 }, (_, i) => `nodo-${i + 1}`);

const CONEXIONES_TABLERO = {
    'castillo-p1': ['nodo-1', 'nodo-13', 'nodo-22'],
    'castillo-p2': ['nodo-8', 'nodo-17', 'nodo-29'],

    'nodo-1':  ['castillo-p1', 'nodo-2', 'nodo-13'],
    'nodo-2':  ['nodo-1', 'nodo-3', 'nodo-9'],
    'nodo-3':  ['nodo-2', 'nodo-9'],
    'nodo-4':  ['nodo-9', 'nodo-11'],
    'nodo-5':  ['nodo-10', 'nodo-12'],
    'nodo-6':  ['nodo-7', 'nodo-12'],
    'nodo-7':  ['nodo-6', 'nodo-8', 'nodo-12'],
    'nodo-8':  ['castillo-p2', 'nodo-7', 'nodo-17'],

    'nodo-9':  ['nodo-2', 'nodo-3', 'nodo-13', 'nodo-14', 'nodo-4', 'nodo-10'],
    'nodo-10': ['nodo-14', 'nodo-15', 'nodo-9', 'nodo-5'],
    'nodo-11': ['nodo-4', 'nodo-15', 'nodo-16', 'nodo-12'],
    'nodo-12': ['nodo-6', 'nodo-7', 'nodo-16', 'nodo-17', 'nodo-11', 'nodo-5'],

    'nodo-13': ['castillo-p1', 'nodo-9', 'nodo-18', 'nodo-22', 'nodo-1'],
    'nodo-14': ['nodo-9', 'nodo-10', 'nodo-15', 'nodo-18', 'nodo-19'],
    'nodo-15': ['nodo-10', 'nodo-11', 'nodo-14', 'nodo-16', 'nodo-19', 'nodo-20'],
    'nodo-16': ['nodo-11', 'nodo-12', 'nodo-15', 'nodo-20', 'nodo-21'],
    'nodo-17': ['castillo-p2', 'nodo-12', 'nodo-21', 'nodo-8', 'nodo-29'],

    'nodo-18': ['nodo-13', 'nodo-14', 'nodo-19', 'nodo-23', 'nodo-24', 'nodo-25'],
    'nodo-19': ['nodo-14', 'nodo-15', 'nodo-18', 'nodo-26'],
    'nodo-20': ['nodo-15', 'nodo-16', 'nodo-25', 'nodo-21'],
    'nodo-21': ['nodo-16', 'nodo-17', 'nodo-20', 'nodo-26', 'nodo-27', 'nodo-28'],

    'nodo-22': ['castillo-p1', 'nodo-13', 'nodo-23'],
    'nodo-23': ['nodo-22', 'nodo-18', 'nodo-24'],
    'nodo-24': ['nodo-23', 'nodo-18'],
    'nodo-25': ['nodo-18', 'nodo-20'],
    'nodo-26': ['nodo-19', 'nodo-21'],
    'nodo-27': ['nodo-21', 'nodo-28'],
    'nodo-28': ['nodo-21', 'nodo-27', 'nodo-29'],
    'nodo-29': ['castillo-p2', 'nodo-17', 'nodo-28']
};

// Posiciones (%) usadas SOLO para calcular los centros de las líneas de conexión del SVG.
// Deben coincidir con las reglas de estilos.css.
const POSICIONES = {
    'castillo-p1': { top: 27, left: 3.5, w: 10.5, h: 30 },
    'castillo-p2': { top: 27, left: 86, w: 10.5, h: 30 },
    'nodo-1': { top: 8.5, left: 8.5, w: 6.6, h: 11.6 }, 'nodo-2': { top: 8.5, left: 19, w: 6.6, h: 11.6 },
    'nodo-3': { top: 8.5, left: 29.5, w: 6.6, h: 11.6 }, 'nodo-4': { top: 8.5, left: 39, w: 6.6, h: 11.6 },
    'nodo-5': { top: 8.5, left: 55, w: 6.6, h: 11.6 }, 'nodo-6': { top: 8.5, left: 65.5, w: 6.6, h: 11.6 },
    'nodo-7': { top: 8.5, left: 75, w: 6.6, h: 11.6 }, 'nodo-8': { top: 8.5, left: 85.5, w: 6.6, h: 11.6 },
    'nodo-9': { top: 26, left: 28, w: 6.6, h: 11.6 }, 'nodo-10': { top: 26, left: 41, w: 6.6, h: 11.6 },
    'nodo-11': { top: 26, left: 52.5, w: 6.6, h: 11.6 }, 'nodo-12': { top: 26, left: 65, w: 6.6, h: 11.6 },
    'nodo-13': { top: 44, left: 20.5, w: 6.6, h: 11.6 }, 'nodo-14': { top: 44, left: 35.5, w: 6.6, h: 11.6 },
    'nodo-15': { top: 44, left: 46.5, w: 6.6, h: 11.6 }, 'nodo-16': { top: 44, left: 57, w: 6.6, h: 11.6 },
    'nodo-17': { top: 44, left: 72, w: 6.6, h: 11.6 },
    'nodo-18': { top: 61.5, left: 28, w: 6.6, h: 11.6 }, 'nodo-19': { top: 61.5, left: 41, w: 6.6, h: 11.6 },
    'nodo-20': { top: 61.5, left: 52.5, w: 6.6, h: 11.6 }, 'nodo-21': { top: 61.5, left: 65, w: 6.6, h: 11.6 },
    'nodo-22': { top: 79, left: 8.5, w: 6.6, h: 11.6 }, 'nodo-23': { top: 79, left: 19, w: 6.6, h: 11.6 },
    'nodo-24': { top: 79, left: 29.5, w: 6.6, h: 11.6 }, 'nodo-25': { top: 79, left: 39, w: 6.6, h: 11.6 },
    'nodo-26': { top: 79, left: 55, w: 6.6, h: 11.6 }, 'nodo-27': { top: 79, left: 65.5, w: 6.6, h: 11.6 },
    'nodo-28': { top: 79, left: 75, w: 6.6, h: 11.6 }, 'nodo-29': { top: 79, left: 85.5, w: 6.6, h: 11.6 }
};

const COSTOS = {
    maquina: { madera: 3, hierro: 3 },
    extractor: { madera: 2, carbon: 2 },
    canon: { madera: 4, carbon: 4, hierro: 4 },
    mejoraMaquina: { madera: 1, hierro: 1 },
    mejoraCastillo: { hierro: 4 },
    conquistaNueva: { carbon: 1 },
    conquistaEnemigaBase: 2,
    conquistaEnemigaExtractor: 3
};

// Mismas rutas que en el proyecto original: si existen en assets/, se usan tal cual.
// Si una imagen no carga, cada elemento cae automáticamente en el diseño con emoji.
const IMAGENES = {
    reverso: 'assets/cartas/reverso.png',
    madera: 'assets/cartas/madera.png',
    carbon: 'assets/cartas/carbon.png',
    hierro: 'assets/cartas/hierro.png',
    mgRojo: 'assets/cartas/MG_Rojo.png',
    mgAzul: 'assets/cartas/MG_Azul.png'
};

// ---------- ESTADO ----------
let gameState = null;
let maquinaSeleccionadaId = null; // {jugador, id}
let modoAccion = null; // null | 'extractor' | 'disparo'
let siguienteIdMaquina = 1;

function crearJugador(numero) {
    return {
        numero,
        recursos: { madera: 1, carbon: 1, hierro: 1 },
        produccion: { madera: 0, carbon: 0, hierro: 0 },
        castillo: { hp: 20, hpMax: 20, mejoras: 0, limiteMG: 3, canon: false, canonListo: false, canonDisparoUsado: false },
        maquinas: [],
        accionesTurno: { mgConstruida: false, extractorConstruido: false }
    };
}

function crearEstadoInicial() {
    return {
        fase: 'lobby', // lobby | moneda | conquistaInicial | juego | finPartida
        turnoActual: null,
        primerJugador: null,
        numeroRonda: 1,
        ganador: null,
        dado: { resultado: null },
        flags: { flechaDisponible: false, martilloDisponible: false },
        jugadores: { 1: crearJugador(1), 2: crearJugador(2) },
        tablero: {},
        conquistaInicial: { orden: [], indice: 0 }
    };
}

// ---------- UTILIDADES ----------
const $ = (id) => document.getElementById(id);
const rivalDe = (n) => (n === 1 ? 2 : 1);
const esNodo = (id) => id.startsWith('nodo-');
const esCastillo = (id) => id.startsWith('castillo-');
const dueñoDeCastillo = (id) => (id === 'castillo-p1' ? 1 : 2);
const rollD4 = () => 1 + Math.floor(Math.random() * 4);
const roll2D4 = () => rollD4() + rollD4();
const sonConectados = (a, b) => (CONEXIONES_TABLERO[a] || []).includes(b);

function log(mensaje) {
    const cont = $('log-contenido');
    const div = document.createElement('div');
    div.textContent = mensaje;
    cont.appendChild(div);
    cont.scrollTop = cont.scrollHeight;
    while (cont.children.length > 60) cont.removeChild(cont.firstChild);
}

// ---------- MODAL (basado en Promesas) ----------
function abrirModal(titulo, descripcion, opciones) {
    return new Promise((resolve) => {
        $('modal-titulo').textContent = titulo;
        $('modal-descripcion').textContent = descripcion || '';
        const cont = $('modal-botones');
        cont.innerHTML = '';
        opciones.forEach((op) => {
            const btn = document.createElement('button');
            btn.textContent = op.label;
            if (op.destacado) btn.classList.add('opcion-destacada');
            btn.disabled = !!op.disabled;
            btn.addEventListener('click', () => {
                $('modal-overlay').classList.add('oculta');
                resolve(op.value);
            });
            cont.appendChild(btn);
        });
        $('modal-overlay').classList.remove('oculta');
    });
}

function preguntar(titulo, descripcion, opciones) {
    return abrirModal(titulo, descripcion, opciones);
}

async function elegirRecurso(numJ, titulo, descripcion, permitirCancelar = true) {
    const recursos = gameState.jugadores[numJ].recursos;
    const opciones = RECURSOS.filter((r) => recursos[r] > 0).map((r) => ({
        label: `${EMOJI[r]} ${NOMBRE[r]} (tienes ${recursos[r]})`,
        value: r
    }));
    if (opciones.length === 0) return null;
    if (permitirCancelar) opciones.push({ label: 'Cancelar', value: null });
    return preguntar(titulo, descripcion, opciones);
}

// ==========================================
// PREPARACIÓN DE PARTIDA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    $('btnIniciar').addEventListener('click', iniciarPartida);
    $('btnReiniciar').addEventListener('click', () => {
        $('pantalla-fin').classList.add('oculta');
        iniciarPartida();
    });

    $('btnConstruirMG').addEventListener('click', () => construirMaquina(gameState.turnoActual));
    $('btnConstruirExtractor').addEventListener('click', activarModoExtractor);
    $('btnConstruirCanon').addEventListener('click', () => construirCanon(gameState.turnoActual));
    $('btnMejorarCastillo').addEventListener('click', () => mejorarCastillo(gameState.turnoActual));
    $('btnComerciar').addEventListener('click', () => comerciar(gameState.turnoActual));
    $('btnCancelarModo').addEventListener('click', cancelarModo);
    $('btnFinTurno').addEventListener('click', finalizarTurno);

    $('btnMejorarMaquina').addEventListener('click', () => mejorarMaquinaSeleccionada());
    $('btnAtacarCastillo').addEventListener('click', () => atacarCastilloConSeleccionada());
    $('btnDispararCanon').addEventListener('click', activarModoDisparo);
    $('btnDeseleccionar').addEventListener('click', () => { seleccionarMaquina(null); renderTodo(); });

    NODOS_TABLERO.forEach((id) => {
        const el = $(id);
        if (el) el.addEventListener('click', () => clicNodo(id));
    });
    $('castillo-p1').addEventListener('click', () => clicCastillo('castillo-p1'));
    $('castillo-p2').addEventListener('click', () => clicCastillo('castillo-p2'));
    [1, 2].forEach((numCastillo) => {
        [1, 2].forEach((slot) => {
            const el = $(`castillo-p${numCastillo}-slot${slot}`);
            if (el) el.addEventListener('click', (e) => { e.stopPropagation(); clicSlotCastillo(numCastillo, slot); });
        });
    });

    dibujarConexionesSVG();
});

function dibujarConexionesSVG() {
    const svg = $('conexiones-svg');
    const yaDibujadas = new Set();
    const centro = (id) => {
        const p = POSICIONES[id];
        return { x: p.left + p.w / 2, y: p.top + p.h / 2 };
    };
    Object.entries(CONEXIONES_TABLERO).forEach(([origen, vecinos]) => {
        vecinos.forEach((destino) => {
            const clave = [origen, destino].sort().join('|');
            if (yaDibujadas.has(clave)) return;
            yaDibujadas.add(clave);
            const a = centro(origen);
            const b = centro(destino);
            const linea = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            linea.setAttribute('x1', a.x); linea.setAttribute('y1', a.y);
            linea.setAttribute('x2', b.x); linea.setAttribute('y2', b.y);
            svg.appendChild(linea);
        });
    });
}

function crearMazoTerrenos() {
    let mazo = [];
    RECURSOS.forEach((r) => { for (let i = 0; i < 10; i++) mazo.push(r); });
    for (let i = mazo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
    }
    return mazo;
}

async function iniciarPartida() {
    $('pantalla-inicio').classList.add('oculta');
    $('pantalla-fin').classList.add('oculta');
    $('pantalla-juego').classList.remove('oculta');
    $('log-contenido').innerHTML = '';

    gameState = crearEstadoInicial();
    maquinaSeleccionadaId = null;
    modoAccion = null;
    siguienteIdMaquina = 1;

    const mazo = crearMazoTerrenos();
    NODOS_TABLERO.forEach((id, i) => {
        gameState.tablero[id] = { tipo: mazo[i], revelado: false, dueno: null, extractor: false, ocupante: null };
    });
    const sobrante = mazo[29];
    gameState.jugadores[1].recursos[sobrante] += 1;
    gameState.jugadores[2].recursos[sobrante] += 1;
    log(`🎁 Carta sobrante: ${NOMBRE[sobrante]}. +1 ${NOMBRE[sobrante]} para ambos jugadores.`);

    renderTodo();

    const primerJugador = Math.random() < 0.5 ? 1 : 2;
    gameState.primerJugador = primerJugador;
    await preguntar('🪙 Lanzamiento de moneda',
        `¡${primerJugador === 1 ? 'Jugador 1 (Rojo)' : 'Jugador 2 (Azul)'} gana el lanzamiento y comienza la partida!`,
        [{ label: 'Continuar', value: true, destacado: true }]);

    gameState.fase = 'conquistaInicial';
    gameState.conquistaInicial = { orden: [primerJugador, rivalDe(primerJugador)], indice: 0 };
    log(`Comienza la Conquista Inicial. Turno de Jugador ${primerJugador}.`);
    renderTodo();
}

// ==========================================
// FASE DE CONQUISTA INICIAL
// ==========================================
async function clicConquistaInicial(nodoId) {
    const numJ = gameState.conquistaInicial.orden[gameState.conquistaInicial.indice];
    const castilloId = `castillo-p${numJ}`;
    if (!sonConectados(castilloId, nodoId)) {
        log(`❌ Jugador ${numJ}: esa casilla no está conectada a tu castillo.`);
        return;
    }
    const casilla = gameState.tablero[nodoId];
    casilla.revelado = true;
    casilla.dueno = numJ;
    log(`✅ Jugador ${numJ} reclama ${nodoId} (${NOMBRE[casilla.tipo]}).`);

    const inicioMG = await preguntar('Máquina de guerra inicial',
        '¿Dónde quieres que comience tu primera máquina de guerra?',
        [
            { label: '🏰 En el castillo', value: 'castillo' },
            { label: `📍 En el terreno recién reclamado (${nodoId})`, value: 'terreno' }
        ]);

    const ubicacion = inicioMG === 'castillo' ? castilloId : nodoId;
    const maquina = crearMaquina(numJ, ubicacion, true);
    gameState.jugadores[numJ].maquinas.push(maquina);
    if (ubicacion === nodoId) casilla.ocupante = { jugador: numJ, maquinaId: maquina.id };

    gameState.conquistaInicial.indice += 1;
    if (gameState.conquistaInicial.indice >= gameState.conquistaInicial.orden.length) {
        gameState.fase = 'juego';
        gameState.turnoActual = gameState.primerJugador;
        log('⚔️ ¡Conquista inicial completada! Comienza la partida.');
        renderTodo();
        await iniciarTurno();
    } else {
        renderTodo();
    }
}

function crearMaquina(jugador, ubicacion, disponibleYa) {
    return {
        id: siguienteIdMaquina++,
        jugador,
        hp: 5, hpMax: 5, dano: 1, mejoras: 0,
        ubicacion,
        puedeMoverse: !!disponibleYa,
        nueva: !disponibleYa,
        accionRealizada: false
    };
}

// ==========================================
// CICLO DE TURNO
// ==========================================
async function iniciarTurno() {
    const numJ = gameState.turnoActual;
    const jugador = gameState.jugadores[numJ];

    // Máquinas construidas el turno anterior ya pueden actuar.
    // Nota: forzamos puedeMoverse=true incondicionalmente (salvo la excepción de abajo) para
    // que nunca quede una máquina "pegada" por un estado inconsistente de una partida anterior.
    jugador.maquinas.forEach((m) => {
        m.nueva = false;
        m.puedeMoverse = true;
        m.accionRealizada = false;
    });
    jugador.castillo.canonDisparoUsado = false;
    if (jugador.castillo.canon && !jugador.castillo.canonListo) jugador.castillo.canonListo = true;
    jugador.accionesTurno = { mgConstruida: false, extractorConstruido: false };
    gameState.flags = { flechaDisponible: false, martilloDisponible: false };
    jugador.maquinas.forEach((m) => { m.movimientoGratisUsado = false; });

    // Producción
    recalcularProduccion(numJ);
    RECURSOS.forEach((r) => { jugador.recursos[r] += jugador.produccion[r]; });

    // Dado automático
    const opciones = ['rayo', 'flecha', 'martillo'];
    const resultado = opciones[Math.floor(Math.random() * 3)];
    gameState.dado.resultado = resultado;

    if (resultado === 'rayo') {
        let ganados = [];
        RECURSOS.forEach((r) => {
            if (contarTerrenos(numJ, r) > 0) { jugador.recursos[r] += 1; ganados.push(NOMBRE[r]); }
        });
        log(`🌩️ Rayo: +1 de ${ganados.length ? ganados.join(', ') : 'nada (sin terreno conquistado)'}.`);
    } else if (resultado === 'flecha') {
        gameState.flags.flechaDisponible = true;
        log('🏹 Flecha: tus máquinas pueden moverse 1 casilla gratis este turno (conquistar sigue costando).');
    } else if (resultado === 'martillo') {
        gameState.flags.martilloDisponible = true;
        log('🔨 Martillo: lo que construyas este turno se activa de inmediato, o puedes usarlo para curar 1 HP a una máquina aliada.');
    }

    renderTodo();
}

function recalcularProduccion(numJ) {
    const jugador = gameState.jugadores[numJ];
    RECURSOS.forEach((r) => {
        let total = 0;
        Object.values(gameState.tablero).forEach((casilla) => {
            if (casilla.dueno === numJ && casilla.tipo === r) total += 1;
            if (casilla.dueno === numJ && casilla.extractor && casilla.tipo === r) total += 1;
        });
        jugador.produccion[r] = total;
    });
}

function contarTerrenos(numJ, tipo) {
    return Object.values(gameState.tablero).filter((c) => c.dueno === numJ && c.tipo === tipo).length;
}
function contarExtractores(numJ) {
    return Object.values(gameState.tablero).filter((c) => c.dueno === numJ && c.extractor).length;
}
function contarMaquinasEnCastillo(numJ) {
    return gameState.jugadores[numJ].maquinas.filter((m) => m.ubicacion === `castillo-p${numJ}`).length;
}

async function finalizarTurno() {
    if (!gameState || gameState.fase !== 'juego') return;
    if (maquinaSeleccionadaId) seleccionarMaquina(null);
    cancelarModo();

    const anterior = gameState.turnoActual;
    gameState.turnoActual = rivalDe(anterior);
    if (gameState.turnoActual === gameState.primerJugador) gameState.numeroRonda += 1;
    log(`— Fin del turno de Jugador ${anterior} —`);
    renderTodo();
    await iniciarTurno();
}

// ==========================================
// CONSTRUCCIÓN
// ==========================================
function tienePago(numJ, costo) {
    const r = gameState.jugadores[numJ].recursos;
    return Object.entries(costo).every(([k, v]) => r[k] >= v);
}
function pagar(numJ, costo) {
    const r = gameState.jugadores[numJ].recursos;
    Object.entries(costo).forEach(([k, v]) => { r[k] -= v; });
}
function costoTexto(costo) {
    return Object.entries(costo).map(([k, v]) => `${v}${EMOJI[k]}`).join(' ');
}

async function usarMartilloSiHay(callbackInstantaneo, mensajeInstantaneo) {
    if (gameState.flags.martilloDisponible) {
        gameState.flags.martilloDisponible = false;
        callbackInstantaneo();
        log(`🔨 ${mensajeInstantaneo}`);
        return true;
    }
    return false;
}

async function construirMaquina(numJ) {
    if (gameState.fase !== 'juego' || gameState.turnoActual !== numJ) return;
    const jugador = gameState.jugadores[numJ];
    if (jugador.accionesTurno.mgConstruida) { log('🛑 Ya construiste una máquina de guerra este turno.'); return; }
    if (contarMaquinasEnCastillo(numJ) >= 2) { log('🛑 El castillo ya tiene 2 máquinas esperando. Muévelas antes de construir otra.'); return; }
    if (!tienePago(numJ, COSTOS.maquina)) { log(`❌ Recursos insuficientes (necesitas ${costoTexto(COSTOS.maquina)}).`); return; }

    pagar(numJ, COSTOS.maquina);
    const maquina = crearMaquina(numJ, `castillo-p${numJ}`, false);
    jugador.maquinas.push(maquina);
    jugador.accionesTurno.mgConstruida = true;

    await usarMartilloSiHay(() => { maquina.puedeMoverse = true; maquina.nueva = false; }, 'la nueva máquina puede moverse este mismo turno.');

    log(`🛠️ Jugador ${numJ} construyó una máquina de guerra.`);
    renderTodo();
}

function activarModoExtractor() {
    if (gameState.fase !== 'juego') return;
    const numJ = gameState.turnoActual;
    const jugador = gameState.jugadores[numJ];
    if (jugador.accionesTurno.extractorConstruido) { log('🛑 Ya construiste un extractor este turno.'); return; }
    if (contarExtractores(numJ) >= 3) { log('🛑 Ya tienes el máximo de 3 extractores.'); return; }
    if (!tienePago(numJ, COSTOS.extractor)) { log(`❌ Recursos insuficientes (necesitas ${costoTexto(COSTOS.extractor)}).`); return; }
    modoAccion = modoAccion === 'extractor' ? null : 'extractor';
    seleccionarMaquina(null);
    renderTodo();
}

async function intentarConstruirExtractor(nodoId) {
    const numJ = gameState.turnoActual;
    const jugador = gameState.jugadores[numJ];
    const casilla = gameState.tablero[nodoId];
    if (casilla.dueno !== numJ) { log('❌ Solo puedes construir un extractor sobre terreno propio.'); return; }
    if (casilla.extractor) { log('❌ Esa casilla ya tiene un extractor.'); return; }
    if (!tienePago(numJ, COSTOS.extractor)) { log(`❌ Recursos insuficientes (necesitas ${costoTexto(COSTOS.extractor)}).`); return; }

    pagar(numJ, COSTOS.extractor);
    casilla.extractor = true;
    jugador.accionesTurno.extractorConstruido = true;
    modoAccion = null;

    await usarMartilloSiHay(() => { jugador.recursos[casilla.tipo] += 1; }, `el extractor produce +1 ${NOMBRE[casilla.tipo]} de inmediato.`);

    log(`⛏️ Jugador ${numJ} construyó un extractor de ${NOMBRE[casilla.tipo]} en ${nodoId}.`);
    renderTodo();
}

async function construirCanon(numJ) {
    if (gameState.fase !== 'juego' || gameState.turnoActual !== numJ) return;
    const jugador = gameState.jugadores[numJ];
    if (jugador.castillo.canon) { log('🛑 Ya tienes un cañón construido.'); return; }
    if (!tienePago(numJ, COSTOS.canon)) { log(`❌ Recursos insuficientes (necesitas ${costoTexto(COSTOS.canon)}).`); return; }

    pagar(numJ, COSTOS.canon);
    jugador.castillo.canon = true;
    jugador.castillo.canonListo = false;
    jugador.castillo.canonDisparoUsado = false;

    await usarMartilloSiHay(() => { jugador.castillo.canonListo = true; }, 'el cañón queda listo para disparar de inmediato.');

    log(`💣 Jugador ${numJ} construyó un cañón en su castillo.`);
    renderTodo();
}

async function mejorarCastillo(numJ) {
    if (gameState.fase !== 'juego' || gameState.turnoActual !== numJ) return;
    const jugador = gameState.jugadores[numJ];
    if (jugador.castillo.mejoras >= 5) { log('🛑 El castillo ya está al máximo de mejoras (5).'); return; }
    if (!tienePago(numJ, COSTOS.mejoraCastillo)) { log(`❌ Recursos insuficientes (necesitas ${costoTexto(COSTOS.mejoraCastillo)}).`); return; }

    pagar(numJ, COSTOS.mejoraCastillo);
    jugador.castillo.mejoras += 1;
    jugador.castillo.hpMax += 2;
    jugador.castillo.hp += 2;
    if (jugador.castillo.mejoras === 2) jugador.castillo.limiteMG = 4;
    if (jugador.castillo.mejoras === 5) jugador.castillo.limiteMG = 5;

    log(`🏰 Jugador ${numJ} mejoró su castillo (mejora ${jugador.castillo.mejoras}/5). +2 HP máx.`);
    renderTodo();
}

async function comerciar(numJ) {
    if (gameState.fase !== 'juego' || gameState.turnoActual !== numJ) return;
    const origen = await elegirRecurso(numJ, '🔄 Comerciar', 'Elige qué recurso quieres ENTREGAR (se gastan 4).');
    if (!origen) return;
    if (gameState.jugadores[numJ].recursos[origen] < 4) { log(`❌ No tienes 4 de ${NOMBRE[origen]}.`); return; }

    const opcionesDestino = RECURSOS.filter((r) => r !== origen).map((r) => ({ label: `${EMOJI[r]} ${NOMBRE[r]}`, value: r }));
    opcionesDestino.push({ label: 'Cancelar', value: null });
    const destino = await preguntar('🔄 Comerciar', `Entregas 4 ${NOMBRE[origen]}. ¿Qué recurso quieres RECIBIR (+1)?`, opcionesDestino);
    if (!destino) return;

    gameState.jugadores[numJ].recursos[origen] -= 4;
    gameState.jugadores[numJ].recursos[destino] += 1;
    log(`🔄 Jugador ${numJ} cambió 4 ${NOMBRE[origen]} por 1 ${NOMBRE[destino]}.`);
    renderTodo();
}

function cancelarModo() {
    modoAccion = null;
    renderTodo();
}

// ==========================================
// SELECCIÓN DE MÁQUINA Y MOVIMIENTO
// ==========================================
function buscarMaquina(numJ, id) {
    return gameState.jugadores[numJ].maquinas.find((m) => m.id === id);
}

function seleccionarMaquina(id) {
    maquinaSeleccionadaId = id;
    modoAccion = null;
}

function clicSeleccionarMaquina(numJ, id) {
    if (gameState.fase !== 'juego' || gameState.turnoActual !== numJ) return;
    seleccionarMaquina(maquinaSeleccionadaId === id ? null : id);
    renderTodo();
}

async function clicNodo(nodoId) {
    if (!gameState) return;
    if (gameState.fase === 'conquistaInicial') { await clicConquistaInicial(nodoId); return; }
    if (gameState.fase !== 'juego') return;

    if (modoAccion === 'extractor') { await intentarConstruirExtractor(nodoId); return; }
    if (modoAccion === 'disparo') { await intentarDispararCanon(nodoId); return; }

    const numJ = gameState.turnoActual;
    const casilla = gameState.tablero[nodoId];

    // Clic directo sobre el ícono de una máquina PROPIA: seleccionarla (o deseleccionar si ya lo estaba)
    if (casilla.ocupante && casilla.ocupante.jugador === numJ) {
        clicSeleccionarMaquina(numJ, casilla.ocupante.maquinaId);
        return;
    }

    if (!maquinaSeleccionadaId) return;
    const maquina = buscarMaquina(numJ, maquinaSeleccionadaId);
    if (!maquina) return;
    await intentarMover(maquina, nodoId);
}

async function clicCastillo(castilloId) {
    if (!gameState || gameState.fase !== 'juego') return;
    const numJ = gameState.turnoActual;
    const dueño = dueñoDeCastillo(castilloId);

    if (modoAccion === 'disparo') { log('❌ El cañón solo puede apuntar a casillas de terreno.'); return; }
    if (!maquinaSeleccionadaId) return;

    const maquina = buscarMaquina(numJ, maquinaSeleccionadaId);
    if (!maquina) return;

    if (dueño === numJ) {
        if (maquina.ubicacion === castilloId) return; // ya está ahí (el clic vino de su propio slot)
        await intentarMover(maquina, castilloId);
    } else {
        if (maquina.accionRealizada) { log('🛑 Esa máquina ya actuó este turno.'); return; }
        if (!sonConectados(maquina.ubicacion, castilloId)) { log('❌ Tu máquina no está en una casilla conectada a ese castillo.'); return; }
        await iniciarAtaqueCastillo(maquina, numJ);
    }
}

// Clic directo sobre el ícono de una máquina dentro de un slot del castillo: seleccionarla.
function clicSlotCastillo(numCastillo, indiceSlot) {
    if (!gameState || gameState.fase !== 'juego') return;
    const numJ = gameState.turnoActual;
    if (numCastillo !== numJ) return; // no se pueden seleccionar máquinas del castillo rival
    const dentro = gameState.jugadores[numJ].maquinas.filter((m) => m.ubicacion === `castillo-p${numJ}`);
    const maquina = dentro[indiceSlot - 1];
    if (!maquina) return;
    clicSeleccionarMaquina(numJ, maquina.id);
}

async function intentarMover(maquina, destinoId) {
    const numJ = maquina.jugador;
    if (gameState.turnoActual !== numJ) return;
    if (maquina.accionRealizada) { log('🛑 Esa máquina ya actuó este turno.'); return; }
    if (!maquina.puedeMoverse) { log('🛑 Esa máquina fue construida este turno y se moverá en el próximo.'); return; }
    if (!sonConectados(maquina.ubicacion, destinoId)) { log('❌ Casilla no conectada.'); return; }
    if (esCastillo(destinoId) && dueñoDeCastillo(destinoId) !== numJ) { log('❌ No puedes entrar al castillo enemigo.'); return; }

    const jugador = gameState.jugadores[numJ];
    const origenEsCastillo = esCastillo(maquina.ubicacion);

    // Entrar al propio castillo: siempre gratis
    if (esCastillo(destinoId)) {
        if (contarMaquinasEnCastillo(numJ) >= 2) { log('🛑 El castillo ya tiene 2 máquinas dentro.'); return; }
        liberarCasilla(maquina);
        maquina.ubicacion = destinoId;
        log(`🏰 Jugador ${numJ} devuelve una máquina a su castillo.`);
        renderTodo();
        return;
    }

    const destino = gameState.tablero[destinoId];

    // Combate si hay una máquina enemiga en el destino
    if (destino.ocupante && destino.ocupante.jugador !== numJ) {
        await intentarCombateOEntrada(maquina, destinoId);
        return;
    }
    // Bloqueado por máquina propia
    if (destino.ocupante && destino.ocupante.jugador === numJ) { log('❌ Esa casilla ya está ocupada por otra de tus máquinas.'); return; }

    // Terreno sin revelar: conquista obligatoria, 1 carbón (aplica salga o no del castillo)
    if (!destino.revelado) {
        if (jugador.recursos.carbon < COSTOS.conquistaNueva.carbon) { log('❌ Necesitas 1 de Carbón para conquistar terreno nuevo.'); return; }
        jugador.recursos.carbon -= COSTOS.conquistaNueva.carbon;
        destino.revelado = true;
        destino.dueno = numJ;
        liberarCasilla(maquina);
        maquina.ubicacion = destinoId;
        destino.ocupante = { jugador: numJ, maquinaId: maquina.id };
        maquina.accionRealizada = true;
        log(`🎉 Jugador ${numJ} conquistó terreno nuevo de ${NOMBRE[destino.tipo]} en ${destinoId}.`);
        renderTodo();
        return;
    }

    // Terreno revelado propio: solo pasar (gratis si sale del castillo)
    if (destino.dueno === numJ) {
        let recursoUsado = null;
        if (!origenEsCastillo) {
            recursoUsado = await elegirRecurso(numJ, 'Mover', 'Elige con qué recurso pagas el movimiento (1).');
            if (!recursoUsado) return;
            jugador.recursos[recursoUsado] -= 1;
        }
        liberarCasilla(maquina);
        maquina.ubicacion = destinoId;
        destino.ocupante = { jugador: numJ, maquinaId: maquina.id };
        log(`🚶 Jugador ${numJ} mueve una máquina a ${destinoId}${origenEsCastillo ? ' (salida del castillo, gratis)' : ` (pagó 1 ${NOMBRE[recursoUsado]})`}.`);
        renderTodo();
        return;
    }

    // Terreno revelado enemigo: pasar o conquistar
    const costoConquista = destino.extractor ? COSTOS.conquistaEnemigaExtractor : COSTOS.conquistaEnemigaBase;
    const opciones = [
        { label: origenEsCastillo ? '🚶 Solo pasar (gratis, sales del castillo)' : '🚶 Solo pasar (1 recurso a elección)', value: 'pasar' },
        { label: `⚔️ Conquistar (${costoConquista}⬛)`, value: 'conquistar', disabled: jugador.recursos.carbon < costoConquista },
        { label: 'Cancelar', value: null }
    ];
    const accion = await preguntar('Terreno enemigo', `${destinoId} pertenece al Jugador ${destino.dueno}${destino.extractor ? ' (tiene un extractor)' : ''}. ¿Qué haces?`, opciones);
    if (!accion) return;

    if (accion === 'pasar') {
        let recursoUsado = null;
        if (!origenEsCastillo) {
            recursoUsado = await elegirRecurso(numJ, 'Mover', 'Elige con qué recurso pagas el movimiento (1).');
            if (!recursoUsado) return;
            jugador.recursos[recursoUsado] -= 1;
        }
        liberarCasilla(maquina);
        maquina.ubicacion = destinoId;
        destino.ocupante = { jugador: numJ, maquinaId: maquina.id };
        log(`🚶 Jugador ${numJ} pasa por ${destinoId} sin conquistar${origenEsCastillo ? ' (salida del castillo, gratis)' : ` (pagó 1 ${NOMBRE[recursoUsado]})`}.`);
        renderTodo();
        return;
    }

    if (accion === 'conquistar') {
        jugador.recursos.carbon -= costoConquista;
        const rival = gameState.jugadores[destino.dueno];
        destino.dueno = numJ;
        liberarCasilla(maquina);
        maquina.ubicacion = destinoId;
        destino.ocupante = { jugador: numJ, maquinaId: maquina.id };
        maquina.accionRealizada = true;
        log(`⚔️ Jugador ${numJ} conquistó ${destinoId} (antes de Jugador ${rival.numero}).`);
        renderTodo();
    }
}

function liberarCasilla(maquina) {
    if (esNodo(maquina.ubicacion)) {
        gameState.tablero[maquina.ubicacion].ocupante = null;
    }
}

async function intentarCombateOEntrada(atacante, destinoId) {
    const destino = gameState.tablero[destinoId];
    const rivalNum = destino.ocupante.jugador;
    const defensor = buscarMaquina(rivalNum, destino.ocupante.maquinaId);
    if (!defensor) { destino.ocupante = null; await intentarMover(atacante, destinoId); return; }

    await preguntar('⚔️ ¡Combate!', `Tu máquina ataca a la máquina del Jugador ${rivalNum} en ${destinoId}.`, [{ label: 'Atacar', value: true, destacado: true }]);

    const resultado = await resolverCombate(atacante, defensor, true);
    atacante.accionRealizada = true;

    if (resultado === 'atacanteGana') {
        const dueño = destino.dueno;
        if (dueño !== null && dueño !== atacante.jugador) {
            const costoConquista = destino.extractor ? COSTOS.conquistaEnemigaExtractor : COSTOS.conquistaEnemigaBase;
            const jugador = gameState.jugadores[atacante.jugador];
            const opciones = [
                { label: '🚶 Solo ocupar (sin conquistar)', value: 'pasar' },
                { label: `🏳️ Conquistar terreno (${costoConquista}⬛)`, value: 'conquistar', disabled: jugador.recursos.carbon < costoConquista },
            ];
            const accion = await preguntar('Máquina destruida', `Venciste al enemigo en ${destinoId}. ¿Conquistas también el terreno?`, opciones);
            if (accion === 'conquistar') {
                jugador.recursos.carbon -= costoConquista;
                destino.dueno = atacante.jugador;
                log(`🏳️ Jugador ${atacante.jugador} conquista ${destinoId} tras la batalla.`);
            }
        }
        liberarCasilla(atacante);
        atacante.ubicacion = destinoId;
        destino.ocupante = { jugador: atacante.jugador, maquinaId: atacante.id };
    }
    renderTodo();
    await revisarFinDePartida();
}

// Combate genérico. permiteRetiro=true para combate en campo abierto.
async function resolverCombate(atacante, defensor, permiteRetiro) {
    const dmg1 = atacante.dano + rollD4();
    defensor.hp -= dmg1;
    log(`💥 Máquina de Jugador ${atacante.jugador} hace ${dmg1} de daño a máquina de Jugador ${defensor.jugador} (HP restante: ${Math.max(defensor.hp, 0)}).`);
    if (defensor.hp <= 0) { destruirMaquina(defensor); return 'atacanteGana'; }

    if (permiteRetiro) {
        const retiro = buscarRetiroDisponible(defensor);
        if (retiro) {
            liberarCasilla(defensor);
            defensor.ubicacion = retiro;
            gameState.tablero[retiro].ocupante = { jugador: defensor.jugador, maquinaId: defensor.id };
            log(`🏃 La máquina de Jugador ${defensor.jugador} sobrevive y se retira a ${retiro}.`);
            return 'defensorRetira';
        }
    }

    // Combate a muerte alternado, comienza el defensor
    let turno = 'defensor';
    while (true) {
        if (turno === 'defensor') {
            const dmg = defensor.dano + rollD4();
            atacante.hp -= dmg;
            log(`💥 Máquina de Jugador ${defensor.jugador} contraataca con ${dmg} de daño (HP restante atacante: ${Math.max(atacante.hp, 0)}).`);
            if (atacante.hp <= 0) { destruirMaquina(atacante); return 'defensorGana'; }
            turno = 'atacante';
        } else {
            const dmg = atacante.dano + rollD4();
            defensor.hp -= dmg;
            log(`💥 Máquina de Jugador ${atacante.jugador} hace ${dmg} de daño (HP restante defensor: ${Math.max(defensor.hp, 0)}).`);
            if (defensor.hp <= 0) { destruirMaquina(defensor); return 'atacanteGana'; }
            turno = 'defensor';
        }
    }
}

function buscarRetiroDisponible(maquina) {
    if (!esNodo(maquina.ubicacion)) return null;
    const vecinos = CONEXIONES_TABLERO[maquina.ubicacion] || [];
    return vecinos.find((v) => esNodo(v) && gameState.tablero[v].dueno === maquina.jugador && !gameState.tablero[v].ocupante) || null;
}

function destruirMaquina(maquina) {
    liberarCasilla(maquina);
    const jugador = gameState.jugadores[maquina.jugador];
    jugador.maquinas = jugador.maquinas.filter((m) => m.id !== maquina.id);
    log(`💀 Se destruyó una máquina de guerra de Jugador ${maquina.jugador}.`);
}

// ==========================================
// ATAQUE AL CASTILLO ENEMIGO
// ==========================================
async function iniciarAtaqueCastillo(atacante, numJ) {
    const rivalNum = rivalDe(numJ);
    const castilloId = `castillo-p${rivalNum}`;
    const rival = gameState.jugadores[rivalNum];
    const dentro = rival.maquinas.filter((m) => m.ubicacion === castilloId);

    let objetivoMaquina = null;
    if (dentro.length > 0) {
        if (dentro.length === 1) {
            objetivoMaquina = dentro[0];
        } else {
            const id = await preguntar('⚔️ Atacar castillo', 'Hay más de una máquina defendiendo. ¿A cuál atacas?',
                dentro.map((m) => ({ label: `Máquina #${m.id} (HP ${m.hp}, Daño ${m.dano})`, value: m.id })));
            objetivoMaquina = dentro.find((m) => m.id === id);
            if (!objetivoMaquina) return;
        }
    } else {
        const ok = await preguntar('⚔️ Atacar castillo', `El castillo del Jugador ${rivalNum} no tiene máquinas defendiendo. ¿Atacas el castillo directamente? (HP ${rival.castillo.hp}/${rival.castillo.hpMax})`,
            [{ label: 'Atacar castillo', value: true, destacado: true }, { label: 'Cancelar', value: false }]);
        if (!ok) return;
    }

    // Defensa con cañón (si el rival tiene uno listo y sin usar este ciclo)
    if (rival.castillo.canon && rival.castillo.canonListo && !rival.castillo.canonDisparoUsado) {
        const disparar = await preguntar('💣 Defensa con cañón',
            `Jugador ${rivalNum}: tienes un cañón listo. ¿Disparas en defensa a la máquina atacante (2d4 de daño)?`,
            [{ label: 'Disparar', value: true, destacado: true }, { label: 'No disparar', value: false }]);
        if (disparar) {
            rival.castillo.canonDisparoUsado = true;
            const dmg = roll2D4();
            atacante.hp -= dmg;
            log(`💣 El cañón de Jugador ${rivalNum} hace ${dmg} de daño a la máquina atacante.`);
            if (atacante.hp <= 0) {
                destruirMaquina(atacante);
                log('☠️ La máquina atacante fue destruida por el cañón antes de poder atacar.');
                renderTodo();
                return;
            }
        }
    }

    atacante.accionRealizada = true;

    if (objetivoMaquina) {
        const resultado = await resolverCombate(atacante, objetivoMaquina, false);
        if (resultado === 'atacanteGana') log(`⚔️ Jugador ${numJ} destruyó una máquina que defendía el castillo enemigo.`);
        else log(`⚔️ La máquina de Jugador ${numJ} fue destruida defendiendo el castillo del Jugador ${rivalNum}.`);
    } else {
        const dmg = atacante.dano + rollD4();
        rival.castillo.hp = Math.max(0, rival.castillo.hp - dmg);
        log(`💥 Jugador ${numJ} ataca el castillo enemigo por ${dmg} de daño (HP restante: ${rival.castillo.hp}/${rival.castillo.hpMax}).`);
    }

    renderTodo();
    await revisarFinDePartida();
}

async function revisarFinDePartida() {
    for (const n of [1, 2]) {
        if (gameState.jugadores[n].castillo.hp <= 0) {
            gameState.fase = 'finPartida';
            gameState.ganador = rivalDe(n);
            mostrarPantallaFin();
            return;
        }
    }
}

function mostrarPantallaFin() {
    $('fin-titulo').textContent = `¡Jugador ${gameState.ganador} gana la partida! 🏆`;
    $('pantalla-juego').classList.add('oculta');
    $('pantalla-fin').classList.remove('oculta');
}

// ==========================================
// PANEL DE MÁQUINA SELECCIONADA (mejorar / atacar / cañón)
// ==========================================
async function mejorarMaquinaSeleccionada() {
    const numJ = gameState.turnoActual;
    const maquina = buscarMaquina(numJ, maquinaSeleccionadaId);
    if (!maquina) return;
    if (maquina.mejoras >= 3) { log('🛑 Esa máquina ya tiene el máximo de 3 mejoras.'); return; }
    if (!tienePago(numJ, COSTOS.mejoraMaquina)) { log(`❌ Recursos insuficientes (necesitas ${costoTexto(COSTOS.mejoraMaquina)}).`); return; }
    pagar(numJ, COSTOS.mejoraMaquina);
    maquina.mejoras += 1;
    maquina.hpMax += 1; maquina.hp += 1; maquina.dano += 1;
    log(`⬆️ Jugador ${numJ} mejoró una máquina (mejora ${maquina.mejoras}/3): HP ${maquina.hpMax}, Daño ${maquina.dano}.`);
    renderTodo();
}

async function atacarCastilloConSeleccionada() {
    const numJ = gameState.turnoActual;
    const maquina = buscarMaquina(numJ, maquinaSeleccionadaId);
    if (!maquina) return;
    await iniciarAtaqueCastillo(maquina, numJ);
}

function activarModoDisparo() {
    const numJ = gameState.turnoActual;
    const jugador = gameState.jugadores[numJ];
    if (!jugador.castillo.canon || !jugador.castillo.canonListo) { log('🛑 No tienes un cañón listo.'); return; }
    if (jugador.castillo.canonDisparoUsado) { log('🛑 Ya usaste el cañón este turno.'); return; }
    modoAccion = modoAccion === 'disparo' ? null : 'disparo';
    renderTodo();
}

async function intentarDispararCanon(nodoId) {
    const numJ = gameState.turnoActual;
    const jugador = gameState.jugadores[numJ];
    const castilloId = `castillo-p${numJ}`;
    if (!sonConectados(castilloId, nodoId)) { log('❌ El cañón solo alcanza casillas conectadas a tu castillo.'); return; }
    const destino = gameState.tablero[nodoId];
    if (!destino.ocupante || destino.ocupante.jugador === numJ) { log('❌ No hay una máquina enemiga en esa casilla.'); return; }

    const objetivo = buscarMaquina(destino.ocupante.jugador, destino.ocupante.maquinaId);
    if (!objetivo) return;

    jugador.castillo.canonDisparoUsado = true;
    modoAccion = null;
    const dmg = roll2D4();
    objetivo.hp -= dmg;
    log(`💣 Jugador ${numJ} dispara el cañón: ${dmg} de daño a la máquina en ${nodoId}.`);
    if (objetivo.hp <= 0) destruirMaquina(objetivo);
    renderTodo();
}

// ==========================================
// RENDERIZADO
// ==========================================
function renderTodo() {
    if (!gameState) return;
    recalcularProduccion(1);
    recalcularProduccion(2);
    renderTurno();
    renderPanel(1);
    renderPanel(2);
    renderTablero();
    renderBotonesInferiores();
}

function renderTurno() {
    const numJ = gameState.turnoActual;
    const box = $('indicadorTurno');
    if (gameState.fase === 'conquistaInicial') {
        const actual = gameState.conquistaInicial.orden[gameState.conquistaInicial.indice];
        box.textContent = `Conquista Inicial — Jugador ${actual}`;
        box.classList.toggle('turno-p2', actual === 2);
    } else if (numJ) {
        box.textContent = `Turno de Jugador ${numJ} (${numJ === 1 ? 'Rojo' : 'Azul'})`;
        box.classList.toggle('turno-p2', numJ === 2);
    }
    $('indicadorRonda').textContent = `Ronda ${gameState.numeroRonda}`;
    const iconos = { rayo: '🌩️ Rayo', flecha: '🏹 Flecha', martillo: '🔨 Martillo' };
    $('indicadorDado').textContent = gameState.dado.resultado ? `🎲 ${iconos[gameState.dado.resultado]}` : '🎲 —';

    document.getElementById('tablero-contenedor').classList.toggle('turno-p2', numJ === 2);
}

function renderPanel(numJ) {
    const jugador = gameState.jugadores[numJ];
    const recCont = $(`p${numJ}-recursos`);
    recCont.innerHTML = RECURSOS.map((r) => `
    <div class="fila-recurso">
      <span>${EMOJI[r]} ${NOMBRE[r]}: <strong>${jugador.recursos[r]}</strong></span>
      <span class="prod">(+${jugador.produccion[r]}/turno)</span>
    </div>`).join('');

    const c = jugador.castillo;
    $(`p${numJ}-info-castillo`).innerHTML = `
    <div><strong>🏰 Castillo</strong> — mejoras ${c.mejoras}/5 — límite MG: ${c.limiteMG}</div>
    <div>${c.canon ? `💣 Cañón ${c.canonListo ? 'listo' : '(disponible el próximo turno)'} ${c.canonDisparoUsado ? '· usado este ciclo' : ''}` : 'Sin cañón'}</div>`;

    const listaEl = $(`p${numJ}-maquinas`);
    const esTurnoDeEste = gameState.fase === 'juego' && gameState.turnoActual === numJ;
    listaEl.innerHTML = '';
    jugador.maquinas.forEach((m) => {
        const div = document.createElement('div');
        const inactiva = !esTurnoDeEste || m.accionRealizada || !m.puedeMoverse;
        div.className = `tarjeta-maquina ${maquinaSeleccionadaId === m.id ? 'seleccionada' : ''} ${inactiva ? 'inactiva' : ''}`;
        const ubicTxt = esCastillo(m.ubicacion) ? 'En el castillo' : m.ubicacion;
        let estado = '';
        if (esTurnoDeEste) {
            if (maquinaSeleccionadaId === m.id) estado = '👉 seleccionada';
            else if (!m.puedeMoverse) estado = 'recién construida';
            else if (m.accionRealizada) estado = 'ya actuó';
        }
        div.innerHTML = `
      <div class="fila-top"><span>⚔️ Máquina #${m.id}</span><span>${ubicTxt}</span></div>
      <div>HP ${m.hp}/${m.hpMax} · Daño ${m.dano} · Mejoras ${m.mejoras}/3</div>
      <div class="mini-hp-bar"><div class="relleno" style="width:${Math.max(0, (m.hp / m.hpMax) * 100)}%"></div></div>
      ${estado ? `<div class="estado-maquina">${estado}</div>` : ''}`;
        listaEl.appendChild(div);
    });

    $(`p${numJ}-castillo-hpbar`).style.width = `${Math.max(0, (c.hp / c.hpMax) * 100)}%`;
    $(`p${numJ}-castillo-hptexto`).textContent = `${c.hp}/${c.hpMax}`;

    for (let slot = 1; slot <= 2; slot++) {
        const el = $(`castillo-p${numJ}-slot${slot}`);
        const maquinasEnCastillo = jugador.maquinas.filter((m) => m.ubicacion === `castillo-p${numJ}`);
        const m = maquinasEnCastillo[slot - 1];
        el.innerHTML = m ? fichaMgHTML(m, numJ) : '';
        const activa = m && maquinaSeleccionadaId === m.id && esTurnoDeEste && !m.accionRealizada && m.puedeMoverse;
        el.classList.toggle('slot-seleccionado', !!activa);
    }
}

function fichaMgHTML(m, numJ) {
    const pct = Math.max(0, (m.hp / m.hpMax) * 100);
    const img = numJ === 1 ? IMAGENES.mgRojo : IMAGENES.mgAzul;
    return `<div class="ficha-mg mg-p${numJ}">
    <img src="${img}" class="img-mg" alt="Máquina de guerra" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
    <span class="icono-mg" style="display:none">${numJ === 1 ? '🔺' : '🔷'}</span>
    <div class="hp-mini"><div class="relleno" style="width:${pct}%"></div></div>
  </div>`;
}

function renderTablero() {
    $('castillo-p1').classList.remove('nodo-accesible', 'nodo-objetivo');
    $('castillo-p2').classList.remove('nodo-accesible', 'nodo-objetivo');

    NODOS_TABLERO.forEach((id) => {
        const casilla = gameState.tablero[id];
        const el = $(id);
        el.classList.remove('terreno-p1', 'terreno-p2', 'nodo-accesible', 'nodo-objetivo', 'nodo-mg-seleccionada');
        let html = '';
        if (!casilla.revelado) {
            html = `<div class="carta-terreno-wrap">
        <img src="${IMAGENES.reverso}" class="img-carta" alt="Oculto" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="carta-fallback oculta-carta" style="display:none">?</div>
      </div>`;
        } else {
            html = `<div class="carta-terreno-wrap">
        <img src="${IMAGENES[casilla.tipo]}" class="img-carta" alt="${NOMBRE[casilla.tipo]}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="carta-fallback terreno-${casilla.tipo}" style="display:none">
          <span>${EMOJI[casilla.tipo]}</span><span class="etiqueta">${NOMBRE[casilla.tipo]}</span>
        </div>
        ${casilla.extractor ? '<span class="icono-extractor">⛏️</span>' : ''}
      </div>`;
            el.classList.add(casilla.dueno === 1 ? 'terreno-p1' : 'terreno-p2');
        }
        if (casilla.ocupante) {
            html += fichaMgHTML({ hp: buscarMaquina(casilla.ocupante.jugador, casilla.ocupante.maquinaId)?.hp || 0, hpMax: buscarMaquina(casilla.ocupante.jugador, casilla.ocupante.maquinaId)?.hpMax || 1 }, casilla.ocupante.jugador);
        }
        el.innerHTML = html;
    });

    // Resaltar la casilla donde está la máquina actualmente seleccionada (mientras aún pueda actuar)
    if (gameState.fase === 'juego' && maquinaSeleccionadaId) {
        const numJ = gameState.turnoActual;
        const maquina = buscarMaquina(numJ, maquinaSeleccionadaId);
        if (maquina && !maquina.accionRealizada && maquina.puedeMoverse && esNodo(maquina.ubicacion)) {
            $(maquina.ubicacion)?.classList.add('nodo-mg-seleccionada');
        }
    }

    // Resaltar destinos válidos para la máquina seleccionada
    if (gameState.fase === 'juego' && maquinaSeleccionadaId) {
        const numJ = gameState.turnoActual;
        const maquina = buscarMaquina(numJ, maquinaSeleccionadaId);
        if (maquina && !maquina.accionRealizada && maquina.puedeMoverse) {
            const vecinos = CONEXIONES_TABLERO[maquina.ubicacion] || [];
            vecinos.forEach((v) => {
                if (esCastillo(v) && dueñoDeCastillo(v) !== numJ) return;
                const el = $(v);
                if (el) el.classList.add('nodo-accesible');
            });
        }
    }

    // Resaltar casillas conectadas al castillo propio en modo disparo
    if (modoAccion === 'disparo') {
        const numJ = gameState.turnoActual;
        (CONEXIONES_TABLERO[`castillo-p${numJ}`] || []).forEach((v) => {
            if (gameState.tablero[v]?.ocupante && gameState.tablero[v].ocupante.jugador !== numJ) $(v)?.classList.add('nodo-objetivo');
        });
    }

    // Resaltar terreno propio disponible en modo extractor
    if (modoAccion === 'extractor') {
        const numJ = gameState.turnoActual;
        NODOS_TABLERO.forEach((id) => {
            const c = gameState.tablero[id];
            if (c.dueno === numJ && !c.extractor) $(id).classList.add('nodo-accesible');
        });
    }
}

function renderBotonesInferiores() {
    const enJuego = gameState.fase === 'juego';
    const numJ = gameState.turnoActual;
    const jugador = enJuego ? gameState.jugadores[numJ] : null;

    $('btnConstruirMG').disabled = !enJuego || jugador.accionesTurno.mgConstruida || contarMaquinasEnCastillo(numJ) >= 2 || !tienePago(numJ, COSTOS.maquina);
    $('btnConstruirExtractor').disabled = !enJuego || jugador.accionesTurno.extractorConstruido || contarExtractores(numJ) >= 3 || !tienePago(numJ, COSTOS.extractor);
    $('btnConstruirCanon').disabled = !enJuego || jugador.castillo.canon || !tienePago(numJ, COSTOS.canon);
    $('btnMejorarCastillo').disabled = !enJuego || jugador.castillo.mejoras >= 5 || !tienePago(numJ, COSTOS.mejoraCastillo);
    $('btnComerciar').disabled = !enJuego;
    $('btnFinTurno').disabled = !enJuego;
    $('btnCancelarModo').classList.toggle('oculta', !modoAccion);

    const panelSel = $('panel-maquina-sel');
    const maquina = enJuego ? buscarMaquina(numJ, maquinaSeleccionadaId) : null;
    panelSel.classList.toggle('oculta', !maquina);
    if (maquina) {
        $('info-maquina-sel').textContent = `Máquina #${maquina.id} — HP ${maquina.hp}/${maquina.hpMax} · Daño ${maquina.dano}`;
        $('btnMejorarMaquina').disabled = maquina.mejoras >= 3 || !tienePago(numJ, COSTOS.mejoraMaquina);
        const puedeAtacarCastillo = !maquina.accionRealizada && sonConectados(maquina.ubicacion, `castillo-p${rivalDe(numJ)}`);
        $('btnAtacarCastillo').classList.toggle('oculta', !puedeAtacarCastillo);
        const puedeDisparar = jugador.castillo.canon && jugador.castillo.canonListo && !jugador.castillo.canonDisparoUsado;
        $('btnDispararCanon').classList.toggle('oculta', !puedeDisparar);
    } else if (enJuego) {
        const puedeDisparar = jugador.castillo.canon && jugador.castillo.canonListo && !jugador.castillo.canonDisparoUsado;
        $('btnDispararCanon').classList.toggle('oculta', !puedeDisparar);
        $('btnAtacarCastillo').classList.add('oculta');
    }
}