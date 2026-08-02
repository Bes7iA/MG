import { $, rivalDe, log } from './utils.js';
import { RECURSOS, EMOJI, NOMBRE, COSTOS, NODOS_TABLERO } from './constants.js';
import {
    gameState, maquinaSeleccionadaId, modoAccion,
    crearEstadoInicial, crearMaquina, crearMazoTerrenos,
    recalcularProduccion, contarTerrenos, contarExtractores, contarMaquinasEnCastillo,
    buscarMaquina, iniciarNuevoEstado, setSeleccion, setModoAccion,
    tienePago, pagar, costoTexto
} from './state.js';
import { esNodo, esCastillo, dueñoDeCastillo, sonConectados, liberarCasilla } from './board.js';
import { rollD4, roll2D4, resolverCombate, destruirMaquina } from './combat.js';
import { preguntar, elegirRecurso } from './ui-modal.js';
import { renderTodo, mostrarPantallaFin } from './render.js';

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

export async function clicConquistaInicial(nodoId) {
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

    recalcularProduccion(numJ);
    RECURSOS.forEach((r) => { jugador.recursos[r] += jugador.produccion[r]; });

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
    setModoAccion(modoAccion === 'extractor' ? null : 'extractor');
    seleccionarMaquina(null);
    renderTodo();
}

export async function intentarConstruirExtractor(nodoId) {
    const numJ = gameState.turnoActual;
    const jugador = gameState.jugadores[numJ];
    const casilla = gameState.tablero[nodoId];
    if (casilla.dueno !== numJ) { log('❌ Solo puedes construir un extractor sobre terreno propio.'); return; }
    if (casilla.extractor) { log('❌ Esa casilla ya tiene un extractor.'); return; }
    if (!tienePago(numJ, COSTOS.extractor)) { log(`❌ Recursos insuficientes (necesitas ${costoTexto(COSTOS.extractor)}).`); return; }

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

export async function intentarCombateOEntrada(atacante, destinoId) {
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

export function activarModoDisparo() {
    const numJ = gameState.turnoActual;
    const jugador = gameState.jugadores[numJ];
    if (!jugador.castillo.canon || !jugador.castillo.canonListo) { log('🛑 No tienes un cañón listo.'); return; }
    if (jugador.castillo.canonDisparoUsado) { log('🛑 Ya usaste el cañón este turno.'); return; }
    setModoAccion(modoAccion === 'disparo' ? null : 'disparo');
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

    jugador.castillo.canonDisparoUsado = true;
    setModoAccion(null);
    const dmg = roll2D4();
    objetivo.hp -= dmg;
    log(`💣 Jugador ${numJ} dispara el cañón: ${dmg} de daño a la máquina en ${nodoId}.`);
    if (objetivo.hp <= 0) destruirMaquina(objetivo);
    renderTodo();
}