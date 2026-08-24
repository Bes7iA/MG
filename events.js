import { $, log } from './utils.js';
import { NODOS_TABLERO } from './constants.js';
import { gameState, maquinaSeleccionadaId, modoAccion, buscarMaquina } from './state.js';
import { dueñoDeCastillo, sonConectados } from './board.js';
import { renderTodo, dibujarConexionesSVG, aplicarPosicionesTablero } from './render.js';
import {
    iniciarPartida, clicConquistaInicial, construirMaquina, activarModoExtractor,
    intentarConstruirExtractor, construirCanon, mejorarCastillo, comerciar, cancelarModo,
    seleccionarMaquina, intentarMover, iniciarAtaqueCastillo, mejorarMaquinaSeleccionada,
    atacarCastilloConSeleccionada, activarModoDisparo, intentarDispararCanon, finalizarTurno,
    repararMaquina
} from './actions.js';
import { abrirReglas, cerrarReglas } from './reglas.js';


function clicSeleccionarMaquina(numJ, id) {
    if (gameState.fase !== 'juego' || gameState.turnoActual !== numJ) return;
    seleccionarMaquina(maquinaSeleccionadaId === id ? null : id);
    renderTodo();
}

async function clicNodo(nodoId) {
    if (!gameState) return;
    if (gameState.fase === 'conquistaInicial') { await clicConquistaInicial(nodoId); return; }
    if (gameState.fase !== 'juego') return;
    if (modoAccion === 'reparar') {
        const numJ = gameState.turnoActual;
        const casilla = gameState.tablero[nodoId];
        if (casilla.ocupante && casilla.ocupante.jugador === numJ) {
            const maquina = buscarMaquina(numJ, casilla.ocupante.maquinaId);
            if (maquina && maquina.hp < maquina.hpMax) repararMaquina(maquina);
        }
        return;
    }
    if (modoAccion === 'extractor') { await intentarConstruirExtractor(nodoId); return; }
    if (modoAccion === 'disparo') { await intentarDispararCanon(nodoId); return; }

    const numJ = gameState.turnoActual;
    const casilla = gameState.tablero[nodoId];

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
        if (maquina.ubicacion === castilloId) return;
        await intentarMover(maquina, castilloId);
    } else {
        if (maquina.accionRealizada) { log('🛑 Esa máquina ya actuó este turno.'); return; }
        if (!sonConectados(maquina.ubicacion, castilloId)) { log('❌ Tu máquina no está en una casilla conectada a ese castillo.'); return; }
        await iniciarAtaqueCastillo(maquina, numJ);
    }
}

function clicSlotCastillo(numCastillo, indiceSlot) {
    if (!gameState || gameState.fase !== 'juego') return;
    const numJ = gameState.turnoActual;
    if (numCastillo !== numJ) return;
    const dentro = gameState.jugadores[numJ].maquinas.filter((m) => m.ubicacion === `castillo-p${numJ}`);
    const maquina = dentro[indiceSlot - 1];
    if (!maquina) return;
    clicSeleccionarMaquina(numJ, maquina.id);
}

function inicializarEventos() {
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

    $('btnReglas').addEventListener('click', abrirReglas);
    $('btnCerrarReglas').addEventListener('click', cerrarReglas);

    $('btnMejorarMaquina').addEventListener('click', () => mejorarMaquinaSeleccionada());
    $('btnAtacarCastillo').addEventListener('click', () => atacarCastilloConSeleccionada());

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
    [1, 2].forEach((numCastillo) => {
        const elCanon = $(`castillo-p${numCastillo}-canon`);
        if (elCanon) {
            elCanon.addEventListener('click', (e) => {
                e.stopPropagation();
                if (gameState.turnoActual !== numCastillo) return;
                activarModoDisparo();
            });
        }
    });
    [1, 2].forEach((numJ) => {
        const lista = $(`p${numJ}-maquinas`);
        if (lista) {
            lista.addEventListener('click', (e) => {
                if (modoAccion !== 'reparar') return;
                const tarjeta = e.target.closest('.tarjeta-maquina');
                if (!tarjeta || !tarjeta.classList.contains('reparable')) return;
                const id = Number(tarjeta.dataset.maquinaId);
                const jug = Number(tarjeta.dataset.jugador);
                const maquina = buscarMaquina(jug, id);
                if (maquina) repararMaquina(maquina);
            });
        }
    });

    aplicarPosicionesTablero();
    dibujarConexionesSVG();
}

document.addEventListener('DOMContentLoaded', inicializarEventos);