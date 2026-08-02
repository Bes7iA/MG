import { CONEXIONES_TABLERO } from './constants.js';
import { gameState } from './state.js';

export const esNodo = (id) => id.startsWith('nodo-');
export const esCastillo = (id) => id.startsWith('castillo-');
export const dueñoDeCastillo = (id) => (id === 'castillo-p1' ? 1 : 2);
export const sonConectados = (a, b) => (CONEXIONES_TABLERO[a] || []).includes(b);

export function liberarCasilla(maquina) {
    if (esNodo(maquina.ubicacion)) {
        gameState.tablero[maquina.ubicacion].ocupante = null;
    }
}

export function buscarRetiroDisponible(maquina) {
    if (!esNodo(maquina.ubicacion)) return null;
    const vecinos = CONEXIONES_TABLERO[maquina.ubicacion] || [];
    return vecinos.find((v) => esNodo(v) && gameState.tablero[v].dueno === maquina.jugador && !gameState.tablero[v].ocupante) || null;
}