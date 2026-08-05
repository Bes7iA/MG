import { RECURSOS, EMOJI } from './constants.js';

export let gameState = null;
export let maquinaSeleccionadaId = null;
export let modoAccion = null;
export let siguienteIdMaquina = 1;

export function crearJugador(numero) {
    return {
        numero,
        recursos: { madera: 1, carbon: 1, hierro: 1 },
        produccion: { madera: 0, carbon: 0, hierro: 0 },
        castillo: { hp: 20, hpMax: 20, mejoras: 0, limiteMG: 3, canon: false, canonListo: false, canonDisparoUsado: false },
        maquinas: [],
        accionesTurno: { mgConstruida: false, extractorConstruido: false }
    };
}

export function crearEstadoInicial() {
    return {
        fase: 'lobby',
        turnoActual: null,
        primerJugador: null,
        numeroRonda: 1,
        ganador: null,
        dado: { resultado: null },
        flags: { flechaDisponible: false, martilloDisponible: false },
        jugadores: { 1: crearJugador(1), 2: crearJugador(2) },
        tablero: {},
        conquistaInicial: { orden: [], indice: 0 },
        primeraProduccionHecha: false
    };
}

export function crearMaquina(jugador, ubicacion, disponibleYa) {
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

export function crearMazoTerrenos() {
    let mazo = [];
    RECURSOS.forEach((r) => { for (let i = 0; i < 10; i++) mazo.push(r); });
    for (let i = mazo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
    }
    return mazo;
}

export function recalcularProduccion(numJ) {
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

export function contarTerrenos(numJ, tipo) {
    return Object.values(gameState.tablero).filter((c) => c.dueno === numJ && c.tipo === tipo).length;
}

export function contarExtractores(numJ) {
    return Object.values(gameState.tablero).filter((c) => c.dueno === numJ && c.extractor).length;
}

export function contarMaquinasEnCastillo(numJ) {
    return gameState.jugadores[numJ].maquinas.filter((m) => m.ubicacion === `castillo-p${numJ}`).length;
}

export function buscarMaquina(numJ, id) {
    return gameState.jugadores[numJ].maquinas.find((m) => m.id === id);
}

export function iniciarNuevoEstado() {
    gameState = crearEstadoInicial();
    maquinaSeleccionadaId = null;
    modoAccion = null;
    siguienteIdMaquina = 1;
}

export function setSeleccion(id) {
    maquinaSeleccionadaId = id;
}

export function setModoAccion(modo) {
    modoAccion = modo;
}

export function tienePago(numJ, costo) {
    const r = gameState.jugadores[numJ].recursos;
    return Object.entries(costo).every(([k, v]) => r[k] >= v);
}

export function pagar(numJ, costo) {
    const r = gameState.jugadores[numJ].recursos;
    Object.entries(costo).forEach(([k, v]) => { r[k] -= v; });
}

export function costoTexto(costo) {
    return Object.entries(costo).map(([k, v]) => `${v}${EMOJI[k]}`).join(' ');
}