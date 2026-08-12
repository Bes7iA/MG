import { $, rivalDe, log } from './utils.js';
import { RECURSOS, EMOJI, NOMBRE, COSTOS, NODOS_TABLERO, CONEXIONES_TABLERO } from './constants.js';
import {
    gameState, maquinaSeleccionadaId, modoAccion,
    crearMaquina, crearMazoTerrenos,
    recalcularProduccion, contarTerrenos, contarExtractores, contarMaquinasEnCastillo,
    buscarMaquina, iniciarNuevoEstado, setSeleccion, setModoAccion,
    tienePago, pagar, costoTexto
} from './state.js';
import { esCastillo, dueñoDeCastillo, sonConectados, liberarCasilla } from './board.js';
import { rollD4, roll2D4, resolverCombate, destruirMaquina } from './combat.js';
import { preguntar, elegirRecurso } from './ui-modal.js';
import { renderTodo, mostrarPantallaFin } from './render.js';

function nombreColor(numJ) {
    return numJ === 1
        ? '<span class="color-rojo">Jugador Rojo</span>'
        : '<span class="color-azul">Jugador Azul</span>';
}

async function moverConPosibleFlecha(maquina, numJ, jugador, origenEsCastillo) {
    let recursoUsado = null;
    let gratisPorFlecha = false;
    if (!origenEsCastillo) {
        if (gameState.flags.flechaDisponible && !maquina.movimientoGratisUsado) {
            gratisPorFlecha = true;
            maquina.movimientoGratisUsado = true;
        } else {
            recursoUsado = await elegirRecurso(numJ, 'Mover', 'Elige con qué recurso pagas el movimiento (1).');
            if (!recursoUsado) return { cancelado: true };
            jugador.recursos[recursoUsado] -= 1;
        }
    }
    const motivo = origenEsCastillo
        ? ' (salida del castillo, gratis)'
        : gratisPorFlecha
            ? ' (⏫ movimiento gratis por Flecha)'
            : ` (pagó 1 ${NOMBRE[recursoUsado]})`;
    return { cancelado: false, motivo };
}

async function mostrarAvisoTurnoConquista(numJ) {
    await preguntar(
        `${numJ === 1 ? '🔴' : '🔵'} Elige tu terreno inicial`,
        `${nombreColor(numJ)} debe elegir una casilla conectada a su castillo para reclamarla como su terreno inicial.`,
        [{ label: 'Continuar', value: true, destacado: true }],
        true
    );
}

async function finalizarConquistaInicial() {
    const primerJugador = Math.random() < 0.5 ? 1 : 2;
    gameState.primerJugador = primerJugador;

    await preguntar(
        '🪙 Lanzamiento de moneda',
        `Ambos jugadores reclamaron su terreno inicial. Se ha lanzado una moneda para decidir quién comienza el juego.<br><br>${nombreColor(primerJugador)} ha ganado y puede iniciar la partida ahora.`,
        [{ label: 'Continuar', value: true, destacado: true }],
        true
    );

    gameState.fase = 'juego';
    gameState.turnoActual = primerJugador;
    log(`⚔️ ¡Conquista inicial completada! Comienza la partida. Turno de Jugador ${primerJugador}.`);
    renderTodo();
    await iniciarTurno();
}

async function mostrarAvisoDado(numJ, resultado) {
    if (resultado === 'martillo') {
        const eleccion = await preguntar(
            '🔨 Bonus de turno: Martillo',
            `${nombreColor(numJ)} — ¿cómo quieres usar tu bonificación este turno?`,
            [
                { label: '🛠️ Construir de inmediato', value: 'construir', destacado: true },
                { label: '❤️ Reparar máquina', value: 'reparar' }
            ],
            false
        );

        if (eleccion === 'reparar') {
            await activarReparacionMartillo(numJ);
        }
        return;
    }

    const info = {
        rayo: { emoji: '⚡', nombre: 'Rayo', desc: '+1 de cada recurso del que tengas al menos un terreno conquistado.' },
        flecha: { emoji: '⏫', nombre: 'Flecha', desc: 'Tus máquinas pueden moverse 1 casilla gratis este turno (conquistar sigue costando).' }
    }[resultado];

    await preguntar(
        `${info.emoji} Bonus de turno: ${info.nombre}`,
        `${nombreColor(numJ)} — ${info.desc}`,
        [{ label: 'Continuar', value: true, destacado: true }],
        false
    );
}

function hayMaquinasReparables(numJ) {
    return gameState.jugadores[numJ].maquinas.some((m) => m.hp < m.hpMax);
}

async function activarReparacionMartillo(numJ) {
    if (!hayMaquinasReparables(numJ)) {
        gameState.flags.martilloDisponible = false;
        await preguntar(
            '❤️ Sin máquinas disponibles',
            'No hay máquinas disponibles para recibir reparación. Has desperdiciado tu bonificación de este turno.',
            [{ label: 'Continuar', value: true, destacado: true }],
            false
        );
        return;
    }

    await preguntar(
        '❤️ Reparar máquina',
        'Haz clic sobre la máquina de guerra que deseas reparar (resaltada en verde).',
        [{ label: 'Entendido', value: true, destacado: true }],
        false
    );

    setModoAccion('reparar');
    renderTodo();
}

export function repararMaquina(maquina) {
    maquina.hp = Math.min(maquina.hpMax, maquina.hp + 1);
    gameState.flags.martilloDisponible = false;
    setModoAccion(null);
    log(`❤️ Se reparó 1 HP a la máquina #${maquina.id} de Jugador ${maquina.jugador} (HP: ${maquina.hp}/${maquina.hpMax}).`);
    renderTodo();
}

export async function iniciarPartida() {
    $('pantalla-inicio').classList.add('oculta');
    $('pantalla-fin').classList.add('oculta');
    $('pantalla-juego').classList.remove('oculta');
    $('log-contenido').innerHTML = '';

    iniciarNuevoEstado();

    const mazo = crearMazoTerrenos();
    NODOS_TABLERO.forEach((id, i) => {
        gameState.tablero[id] = { tipo: mazo[i], revelado: false, dueno: null, extractor: false, ocupante: null };
    });
    const sobrante = mazo[29];
    gameState.jugadores[1].recursos[sobrante] += 1;
    gameState.jugadores[2].recursos[sobrante] += 1;
    log(`🎁 Carta sobrante: ${NOMBRE[sobrante]}. +1 ${NOMBRE[sobrante]} para ambos jugadores.`);

    renderTodo();

    await preguntar(
        '🎲 Tablero preparado',
        `El tablero está listo para comenzar. En esta partida, ambos jugadores reciben +1 de ${NOMBRE[sobrante]} extra para empezar.`,
        [{ label: 'Continuar', value: true, destacado: true }],
        true
    );

    gameState.fase = 'conquistaInicial';
    gameState.conquistaInicial = { orden: [1, 2], indice: 0 };
    log('Comienza la Conquista Inicial. Turno de Jugador 1.');
    renderTodo();

    await mostrarAvisoTurnoConquista(1);
}

export async function clicConquistaInicial(nodoId) {
    const numJ = gameState.conquistaInicial.orden[gameState.conquistaInicial.indice];
    const castilloId = `castillo-p${numJ}`;
    if (!sonConectados(castilloId, nodoId)) {
        log(`❌ Jugador ${numJ}: esa casilla no está conectada a tu castillo.`);
        return;
    }
    const casilla = gameState.tablero[nodoId];

    const confirmado = await preguntar(
        'Confirmar terreno inicial',
        `¿Reclamas ${nodoId} como tu terreno inicial? Esta decisión es permanente y no se puede cambiar.`,
        [
            { label: 'Confirmar', value: true, destacado: true },
            { label: 'Elegir otra casilla', value: false }
        ],
        false
    );
    if (!confirmado) return;

    casilla.revelado = true;
    casilla.dueno = numJ;
    gameState.jugadores[numJ].turnosSinConquista = 0;
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
    renderTodo();

    if (gameState.conquistaInicial.indice >= gameState.conquistaInicial.orden.length) {
        await finalizarConquistaInicial();
    } else {
        const siguienteJ = gameState.conquistaInicial.orden[gameState.conquistaInicial.indice];
        await mostrarAvisoTurnoConquista(siguienteJ);
    }
}

export async function iniciarTurno() {
    const numJ = gameState.turnoActual;
    const jugador = gameState.jugadores[numJ];

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

    const tieneTerreno = Object.values(gameState.tablero).some((c) => c.dueno === numJ);
    if (!tieneTerreno) {
        if (jugador.turnosSinConquista >= 3) {
            gameState.fase = 'finPartida';
            gameState.ganador = rivalDe(numJ);
            log(`💀 Jugador ${numJ} lleva 3 turnos sin territorio propio. Jugador ${gameState.ganador} gana la partida.`);
            renderTodo();
            await preguntar(
                '💀 Derrota por falta de territorio',
                `Jugador ${numJ} lleva 3 turnos consecutivos sin lograr conquistar ni una casilla. ¡${nombreColor(gameState.ganador)} gana la partida!`,
                [{ label: 'Continuar', value: true, destacado: true }],
                true
            );
            mostrarPantallaFin();
            return;
        }
        jugador.turnosSinConquista += 1;
        const turnosRestantes = 3 - jugador.turnosSinConquista;
        log(`⚠️ Jugador ${numJ} no tiene territorio propio (turno ${jugador.turnosSinConquista}/3 sin conquistar).`);
        await preguntar(
            '⚠️ Sin territorio',
            `${nombreColor(numJ)} no tiene ningún terreno conquistado. Si no logra conquistar al menos una casilla, perderá la partida en ${turnosRestantes} ${turnosRestantes === 1 ? 'turno' : 'turnos'} más.`,
            [{ label: 'Entendido', value: true, destacado: true }],
            true
        );
    } else {
        jugador.turnosSinConquista = 0;
    }

    recalcularProduccion(numJ);
    if (gameState.primeraProduccionHecha) {
        RECURSOS.forEach((r) => { jugador.recursos[r] += jugador.produccion[r]; });
    } else {
        gameState.primeraProduccionHecha = true;
        log(`ℹ️ Jugador ${numJ} no recibe producción de terrenos en el primer turno de la partida.`);
    }

    const opciones = ['rayo', 'flecha', 'martillo'];
    const resultado = opciones[Math.floor(Math.random() * 3)];
    gameState.dado.resultado = resultado;

    if (resultado === 'rayo') {
        let ganados = [];
        RECURSOS.forEach((r) => {
            if (contarTerrenos(numJ, r) > 0) { jugador.recursos[r] += 1; ganados.push(NOMBRE[r]); }
        });
        log(`⚡ Rayo: +1 de ${ganados.length ? ganados.join(', ') : 'nada (sin terreno conquistado)'}.`);
    } else if (resultado === 'flecha') {
        gameState.flags.flechaDisponible = true;
        log('⏫ Flecha: tus máquinas pueden moverse 1 casilla gratis este turno (conquistar sigue costando).');
    } else if (resultado === 'martillo') {
        gameState.flags.martilloDisponible = true;
        log('🔨 Martillo: lo que construyas este turno se activa de inmediato, o puedes usarlo para curar 1 HP a una máquina aliada.');
    }

    renderTodo();
    await mostrarAvisoDado(numJ, resultado);
}

export async function finalizarTurno() {
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

export async function usarMartilloSiHay(callbackInstantaneo, mensajeInstantaneo) {
    if (gameState.flags.martilloDisponible) {
        gameState.flags.martilloDisponible = false;
        callbackInstantaneo();
        log(`🔨 ${mensajeInstantaneo}`);
        return true;
    }
    return false;
}

export async function construirMaquina(numJ) {
    if (gameState.fase !== 'juego' || gameState.turnoActual !== numJ) return;
    const jugador = gameState.jugadores[numJ];
    if (jugador.accionesTurno.mgConstruida) { log('🛑 Ya construiste una máquina de guerra este turno.'); return; }
    if (contarMaquinasEnCastillo(numJ) >= 2) { log('🛑 El castillo ya tiene 2 máquinas esperando. Muévelas antes de construir otra.'); return; }
    if (jugador.maquinas.length >= jugador.castillo.limiteMG) {
        log(`🛑 Ya tienes el máximo de ${jugador.castillo.limiteMG} máquinas permitidas.`);
        await preguntar(
            '🛑 Límite de ejército alcanzado',
            `Ya tienes el máximo de ${jugador.castillo.limiteMG} máquinas de guerra permitidas con tu nivel de castillo actual. Mejora tu castillo para aumentar este límite.`,
            [{ label: 'Entendido', value: true, destacado: true }],
            false
        );
        return;
    }
    if (!tienePago(numJ, COSTOS.maquina)) { log(`❌ Recursos insuficientes (necesitas ${costoTexto(COSTOS.maquina)}).`); return; }

    pagar(numJ, COSTOS.maquina);
    const maquina = crearMaquina(numJ, `castillo-p${numJ}`, false);
    jugador.maquinas.push(maquina);
    jugador.accionesTurno.mgConstruida = true;

    await usarMartilloSiHay(() => { maquina.puedeMoverse = true; maquina.nueva = false; }, 'la nueva máquina puede moverse este mismo turno.');

    log(`🛠️ Jugador ${numJ} construyó una máquina de guerra.`);
    renderTodo();
}

export function activarModoExtractor() {
    if (gameState.fase !== 'juego') return;
    const numJ = gameState.turnoActual;
    const jugador = gameState.jugadores[numJ];
    if (jugador.accionesTurno.extractorConstruido) { log('🛑 Ya construiste un extractor este turno.'); return; }
    if (contarExtractores(numJ) >= 3) { log('🛑 Ya tienes el máximo de 3 extractores.'); return; }
    if (!tienePago(numJ, COSTOS.extractor)) { log(`❌ Recursos insuficientes (necesitas ${costoTexto(COSTOS.extractor)}).`); return; }
    seleccionarMaquina(null);
    setModoAccion(modoAccion === 'extractor' ? null : 'extractor');
    renderTodo();
}

export async function intentarConstruirExtractor(nodoId) {
    const numJ = gameState.turnoActual;
    const jugador = gameState.jugadores[numJ];
    const casilla = gameState.tablero[nodoId];
    if (casilla.dueno !== numJ) { log('❌ Solo puedes construir un extractor sobre terreno propio.'); return; }
    if (casilla.extractor) { log('❌ Esa casilla ya tiene un extractor.'); return; }
    if (!tienePago(numJ, COSTOS.extractor)) { log(`❌ Recursos insuficientes (necesitas ${costoTexto(COSTOS.extractor)}).`); return; }

    const confirmado = await preguntar(
        '⛏️ Construir Extractor',
        `Construirás un extractor de ${NOMBRE[casilla.tipo]}. Solo puedes tener 3 como máximo. Este extractor aumentará el ${NOMBRE[casilla.tipo]} que recibes al inicio de cada turno mientras controles este terreno.`,
        [
            { label: 'Construir', value: true, destacado: true },
            { label: 'Cancelar', value: false }
        ],
        false
    );
    if (!confirmado) { setModoAccion(null); renderTodo(); return; }

    pagar(numJ, COSTOS.extractor);
    casilla.extractor = true;
    jugador.accionesTurno.extractorConstruido = true;
    setModoAccion(null);

    await usarMartilloSiHay(() => { jugador.recursos[casilla.tipo] += 1; }, `el extractor produce +1 ${NOMBRE[casilla.tipo]} de inmediato.`);

    log(`⛏️ Jugador ${numJ} construyó un extractor de ${NOMBRE[casilla.tipo]} en ${nodoId}.`);
    renderTodo();
}

export async function construirCanon(numJ) {
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

export async function mejorarCastillo(numJ) {
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

export async function comerciar(numJ) {
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

export function cancelarModo() {
    setModoAccion(null);
    renderTodo();
}

export function seleccionarMaquina(id) {
    setSeleccion(id);
    setModoAccion(null);
}

export async function intentarMover(maquina, destinoId) {
    const numJ = maquina.jugador;
    if (gameState.turnoActual !== numJ) return;
    if (maquina.accionRealizada) { log('🛑 Esa máquina ya actuó este turno.'); return; }
    if (!maquina.puedeMoverse) { log('🛑 Esa máquina fue construida este turno y se moverá en el próximo.'); return; }
    if (!sonConectados(maquina.ubicacion, destinoId)) { log('❌ Casilla no conectada.'); return; }
    if (esCastillo(destinoId) && dueñoDeCastillo(destinoId) !== numJ) { log('❌ No puedes entrar al castillo enemigo.'); return; }

    const jugador = gameState.jugadores[numJ];
    const origenEsCastillo = esCastillo(maquina.ubicacion);

    if (esCastillo(destinoId)) {
        if (contarMaquinasEnCastillo(numJ) >= 2) { log('🛑 El castillo ya tiene 2 máquinas dentro.'); return; }
        liberarCasilla(maquina);
        maquina.ubicacion = destinoId;
        log(`🏰 Jugador ${numJ} devuelve una máquina a su castillo.`);
        renderTodo();
        return;
    }

    const destino = gameState.tablero[destinoId];

    if (destino.ocupante && destino.ocupante.jugador !== numJ) {
        await intentarCombateOEntrada(maquina, destinoId);
        return;
    }
    if (destino.ocupante && destino.ocupante.jugador === numJ) { log('❌ Esa casilla ya está ocupada por otra de tus máquinas.'); return; }

    if (!destino.revelado) {
        if (jugador.recursos.carbon < COSTOS.conquistaNueva.carbon) {
            log('❌ Necesitas 1 de Carbón para conquistar terreno nuevo.');
            await preguntar(
                '❌ Recursos insuficientes',
                'No tienes el carbón necesario para moverte a este espacio y conquistarlo.',
                [{ label: 'Entendido', value: true, destacado: true }],
                false
            );
            return;
        }
        jugador.recursos.carbon -= COSTOS.conquistaNueva.carbon;
        destino.revelado = true;
        destino.dueno = numJ;
        jugador.turnosSinConquista = 0;
        liberarCasilla(maquina);
        maquina.ubicacion = destinoId;
        destino.ocupante = { jugador: numJ, maquinaId: maquina.id };
        maquina.accionRealizada = true;
        log(`🎉 Jugador ${numJ} conquistó terreno nuevo de ${NOMBRE[destino.tipo]} en ${destinoId}.`);
        renderTodo();
        return;
    }

    if (destino.dueno === numJ) {
        const resultado = await moverConPosibleFlecha(maquina, numJ, jugador, origenEsCastillo);
        if (resultado.cancelado) return;
        liberarCasilla(maquina);
        maquina.ubicacion = destinoId;
        destino.ocupante = { jugador: numJ, maquinaId: maquina.id };
        log(`🚶 Jugador ${numJ} mueve una máquina a ${destinoId}${resultado.motivo}.`);
        renderTodo();
        return;
    }

    const costoConquista = destino.extractor ? COSTOS.conquistaEnemigaExtractor : COSTOS.conquistaEnemigaBase;
    const opciones = [
        { label: origenEsCastillo ? '🚶 Solo pasar (gratis, sales del castillo)' : '🚶 Solo pasar (1 recurso a elección)', value: 'pasar' },
        { label: `⚔️ Conquistar (${costoConquista}⬛)`, value: 'conquistar', disabled: jugador.recursos.carbon < costoConquista },
        { label: 'Cancelar', value: null }
    ];
    const accion = await preguntar('Terreno enemigo', `${destinoId} pertenece al Jugador ${destino.dueno}${destino.extractor ? ' (tiene un extractor)' : ''}. ¿Qué haces?`, opciones);
    if (!accion) return;

    if (accion === 'pasar') {
        const resultado = await moverConPosibleFlecha(maquina, numJ, jugador, origenEsCastillo);
        if (resultado.cancelado) return;
        liberarCasilla(maquina);
        maquina.ubicacion = destinoId;
        destino.ocupante = { jugador: numJ, maquinaId: maquina.id };
        log(`🚶 Jugador ${numJ} pasa por ${destinoId} sin conquistar${resultado.motivo}.`);
        renderTodo();
        return;
    }

    if (accion === 'conquistar') {
        jugador.recursos.carbon -= costoConquista;
        const rival = gameState.jugadores[destino.dueno];
        destino.dueno = numJ;
        jugador.turnosSinConquista = 0;
        liberarCasilla(maquina);
        maquina.ubicacion = destinoId;
        destino.ocupante = { jugador: numJ, maquinaId: maquina.id };
        maquina.accionRealizada = true;
        log(`⚔️ Jugador ${numJ} conquistó ${destinoId} (antes de Jugador ${rival.numero}).`);
        renderTodo();
    }
}

export async function intentarCombateOEntrada(atacante, destinoId) {
    const destino = gameState.tablero[destinoId];
    const rivalNum = destino.ocupante.jugador;
    const defensor = buscarMaquina(rivalNum, destino.ocupante.maquinaId);
    if (!defensor) { destino.ocupante = null; await intentarMover(atacante, destinoId); return; }

    await preguntar('⚔️ ¡Combate!', `Tu máquina ataca a la máquina del Jugador ${rivalNum} en ${destinoId}.`, [{ label: 'Atacar', value: true, destacado: true }]);

    const resultado = await resolverCombate(atacante, defensor, true);
    atacante.accionRealizada = true;

    if (resultado === 'atacanteGana' || resultado === 'defensorRetira') {
        const dueño = destino.dueno;
        if (dueño !== null && dueño !== atacante.jugador) {
            const costoConquista = destino.extractor ? COSTOS.conquistaEnemigaExtractor : COSTOS.conquistaEnemigaBase;
            const jugador = gameState.jugadores[atacante.jugador];
            const opciones = [
                { label: '🚶 Solo ocupar (sin conquistar)', value: 'pasar' },
                { label: `🏳️ Conquistar terreno (${costoConquista}⬛)`, value: 'conquistar', disabled: jugador.recursos.carbon < costoConquista },
            ];
            const tituloModal = resultado === 'atacanteGana' ? 'Máquina destruida' : 'Enemigo repelido';
            const accion = await preguntar(tituloModal, `Ganaste el combate en ${destinoId}. ¿Conquistas también el terreno?`, opciones);
            if (accion === 'conquistar') {
                jugador.recursos.carbon -= costoConquista;
                destino.dueno = atacante.jugador;
                jugador.turnosSinConquista = 0;
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

export async function iniciarAtaqueCastillo(atacante, numJ) {
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

    atacante.accionRealizada = true;

    if (objetivoMaquina) {
        const resultado = await resolverCombate(atacante, objetivoMaquina, false);
        if (resultado === 'atacanteGana') log(`⚔️ Jugador ${numJ} destruyó una máquina que defendía el castillo enemigo.`);
        else log(`⚔️ La máquina de Jugador ${numJ} fue destruida defendiendo el castillo del Jugador ${rivalNum}.`);
    } else {
        const dmg = atacante.dano + rollD4();
        rival.castillo.hp = Math.max(0, rival.castillo.hp - dmg);
        log(`💥 Jugador ${numJ} ataca el castillo enemigo por ${dmg} de daño (HP restante: ${rival.castillo.hp}/${rival.castillo.hpMax}).`);
        await preguntar('💥 ¡Impacto al castillo!', `Hiciste ${dmg} de daño al castillo enemigo. HP restante: ${rival.castillo.hp}/${rival.castillo.hpMax}.`, [{ label: 'Continuar', value: true, destacado: true }], false);
    }

    renderTodo();
    await revisarFinDePartida();
}

export async function revisarFinDePartida() {
    for (const n of [1, 2]) {
        if (gameState.jugadores[n].castillo.hp <= 0) {
            gameState.fase = 'finPartida';
            gameState.ganador = rivalDe(n);
            mostrarPantallaFin();
            return;
        }
    }
}

export async function mejorarMaquinaSeleccionada() {
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

export async function atacarCastilloConSeleccionada() {
    const numJ = gameState.turnoActual;
    const maquina = buscarMaquina(numJ, maquinaSeleccionadaId);
    if (!maquina) return;
    await iniciarAtaqueCastillo(maquina, numJ);
}

export async function activarModoDisparo() {
    const numJ = gameState.turnoActual;
    const jugador = gameState.jugadores[numJ];
    if (!jugador.castillo.canon || !jugador.castillo.canonListo) { log('🛑 No tienes un cañón listo.'); return; }
    if (jugador.castillo.canonDisparoUsado) { log('🛑 Ya usaste el cañón este turno.'); return; }

    if (modoAccion === 'disparo') {
        setModoAccion(null);
        renderTodo();
        return;
    }

    const hayObjetivos = (CONEXIONES_TABLERO[`castillo-p${numJ}`] || []).some((v) => {
        const c = gameState.tablero[v];
        return c && c.ocupante && c.ocupante.jugador !== numJ;
    });

    if (!hayObjetivos) {
        await preguntar(
            '💣 Sin objetivos',
            'No hay objetivos alcanzables con el cañón en este momento.',
            [{ label: 'Entendido', value: true, destacado: true }],
            false
        );
        return;
    }

    setModoAccion('disparo');
    renderTodo();
}

export async function intentarDispararCanon(nodoId) {
    const numJ = gameState.turnoActual;
    const jugador = gameState.jugadores[numJ];
    const castilloId = `castillo-p${numJ}`;
    if (!sonConectados(castilloId, nodoId)) { log('❌ El cañón solo alcanza casillas conectadas a tu castillo.'); return; }
    const destino = gameState.tablero[nodoId];
    if (!destino.ocupante || destino.ocupante.jugador === numJ) { log('❌ No hay una máquina enemiga en esa casilla.'); return; }

    const objetivo = buscarMaquina(destino.ocupante.jugador, destino.ocupante.maquinaId);
    if (!objetivo) return;

    const confirmado = await preguntar(
        '💣 Disparar cañón',
        `¿Atacarás a esta máquina de guerra con el cañón (2d4 de daño)?`,
        [
            { label: 'Disparar', value: true, destacado: true },
            { label: 'Cancelar', value: false }
        ],
        false
    );
    if (!confirmado) { setModoAccion(null); renderTodo(); return; }

    jugador.castillo.canonDisparoUsado = true;
    setModoAccion(null);
    const dmg = roll2D4();
    objetivo.hp -= dmg;
    log(`💣 Jugador ${numJ} dispara el cañón: ${dmg} de daño a la máquina en ${nodoId}.`);
    renderTodo();
    await preguntar('💣 ¡Impacto de cañón!', `El cañón hizo ${dmg} de daño. HP restante del objetivo: ${Math.max(objetivo.hp, 0)}.`, [{ label: 'Continuar', value: true, destacado: true }], false);
    if (objetivo.hp <= 0) destruirMaquina(objetivo);
    renderTodo();
}