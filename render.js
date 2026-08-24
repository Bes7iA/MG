import { $ } from './utils.js';
import { RECURSOS, EMOJI, NOMBRE, NODOS_TABLERO, CONEXIONES_TABLERO, POSICIONES, COSTOS, IMAGENES } from './constants.js';
import { gameState, maquinaSeleccionadaId, modoAccion, buscarMaquina, contarMaquinasEnCastillo, contarExtractores, recalcularProduccion } from './state.js';
import { esNodo, esCastillo, dueñoDeCastillo, sonConectados } from './board.js';
import { rivalDe } from './utils.js';
import { tienePago } from './state.js';

export function renderTodo() {
    if (!gameState) return;
    recalcularProduccion(1);
    recalcularProduccion(2);
    renderTurno();
    renderPanel(1);
    renderPanel(2);
    renderTablero();
    renderBotonesInferiores();
}

export function renderTurno() {
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
    const iconos = { rayo: '⚡ Rayo', flecha: '⏫ Flecha', martillo: '🔨 Martillo' };
    $('indicadorDado').textContent = gameState.dado.resultado ? `🎲 ${iconos[gameState.dado.resultado]}` : '🎲 —';

    document.getElementById('tablero-contenedor').classList.toggle('turno-p2', numJ === 2);
}

export function renderPanel(numJ) {
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
        const esReparable = modoAccion === 'reparar' && m.hp < m.hpMax;
        div.className = `tarjeta-maquina ${maquinaSeleccionadaId === m.id ? 'seleccionada' : ''} ${inactiva ? 'inactiva' : ''} ${esReparable ? 'reparable' : ''}`;
        div.dataset.maquinaId = m.id;
        div.dataset.jugador = numJ;
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
    const elCanon = $(`castillo-p${numJ}-canon`);
    if (c.canon) {
        const img = numJ === 1 ? IMAGENES.canonRojo : IMAGENES.canonAzul;
        elCanon.innerHTML = `<img src="${img}" class="img-canon" alt="Cañón" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><span class="icono-canon-fallback" style="display:none">💣</span>`;
        const canonListo = c.canon && c.canonListo && !c.canonDisparoUsado;
        elCanon.classList.toggle('canon-listo', esTurnoDeEste && canonListo);
        elCanon.classList.toggle('canon-inactivo', !(esTurnoDeEste && canonListo));
        elCanon.classList.toggle('canon-seleccionado', modoAccion === 'disparo' && esTurnoDeEste);
    } else {
        elCanon.innerHTML = '';
        elCanon.classList.remove('canon-listo', 'canon-inactivo', 'canon-seleccionado');
    }
}

export function fichaMgHTML(m, numJ) {
    const pct = Math.max(0, (m.hp / m.hpMax) * 100);
    const img = numJ === 1 ? IMAGENES.mgRojo : IMAGENES.mgAzul;
    return `<div class="ficha-mg mg-p${numJ}">
    <img src="${img}" class="img-mg" alt="Máquina de guerra" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
    <span class="icono-mg" style="display:none">${numJ === 1 ? '🔺' : '🔷'}</span>
    <div class="hp-mini"><div class="relleno" style="width:${pct}%"></div></div>
  </div>`;
}

export function renderTablero() {
    $('castillo-p1').classList.remove('nodo-accesible', 'nodo-objetivo');
    $('castillo-p2').classList.remove('nodo-accesible', 'nodo-objetivo');

    NODOS_TABLERO.forEach((id) => {
        const casilla = gameState.tablero[id];
        const el = $(id);
        el.classList.remove('terreno-p1', 'terreno-p2', 'nodo-accesible', 'nodo-objetivo', 'nodo-mg-seleccionada', 'nodo-reparable');
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
        ${casilla.extractor ? `<img src="${casilla.dueno === 1 ? IMAGENES.extractorRojo : IMAGENES.extractorAzul}" class="icono-extractor" alt="Extractor" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><span class="icono-extractor-fallback" style="display:none">⛏️</span>` : ''}
      </div>`;
            el.classList.add(casilla.dueno === 1 ? 'terreno-p1' : 'terreno-p2');
        }
        if (casilla.ocupante) {
            html += fichaMgHTML({ hp: buscarMaquina(casilla.ocupante.jugador, casilla.ocupante.maquinaId)?.hp || 0, hpMax: buscarMaquina(casilla.ocupante.jugador, casilla.ocupante.maquinaId)?.hpMax || 1 }, casilla.ocupante.jugador);
        }
        el.innerHTML = html;
    });

    if (gameState.fase === 'juego' && maquinaSeleccionadaId) {
        const numJ = gameState.turnoActual;
        const maquina = buscarMaquina(numJ, maquinaSeleccionadaId);
        if (maquina && !maquina.accionRealizada && maquina.puedeMoverse && esNodo(maquina.ubicacion)) {
            $(maquina.ubicacion)?.classList.add('nodo-mg-seleccionada');
        }
    }

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

    if (modoAccion === 'disparo') {
        const numJ = gameState.turnoActual;
        (CONEXIONES_TABLERO[`castillo-p${numJ}`] || []).forEach((v) => {
            if (gameState.tablero[v]?.ocupante && gameState.tablero[v].ocupante.jugador !== numJ) $(v)?.classList.add('nodo-objetivo');
        });
    }

    if (modoAccion === 'extractor') {
        const numJ = gameState.turnoActual;
        NODOS_TABLERO.forEach((id) => {
            const c = gameState.tablero[id];
            if (c.dueno === numJ && !c.extractor) $(id).classList.add('nodo-accesible');
        });
    }
    if (modoAccion === 'reparar') {
        const numJ = gameState.turnoActual;
        NODOS_TABLERO.forEach((id) => {
            const casilla = gameState.tablero[id];
            if (casilla.ocupante && casilla.ocupante.jugador === numJ) {
                const m = buscarMaquina(numJ, casilla.ocupante.maquinaId);
                if (m && m.hp < m.hpMax) $(id).classList.add('nodo-reparable');
            }
        });
    }
}

export function renderBotonesInferiores() {
    const enJuego = gameState.fase === 'juego';
    const numJ = gameState.turnoActual;
    const jugador = enJuego ? gameState.jugadores[numJ] : null;
    const hayTerrenoParaExtractor = enJuego && Object.values(gameState.tablero).some((c) => c.dueno === numJ && !c.extractor);

    $('btnConstruirMG').disabled = !enJuego || jugador.accionesTurno.mgConstruida || contarMaquinasEnCastillo(numJ) >= 2 || !tienePago(numJ, COSTOS.maquina) || jugador.maquinas.length >= jugador.castillo.limiteMG;
    $('btnConstruirExtractor').disabled = !enJuego || jugador.accionesTurno.extractorConstruido || jugador.extractoresConstruidos >= 3 || !tienePago(numJ, COSTOS.extractor) || !hayTerrenoParaExtractor;
    $('btnConstruirCanon').disabled = !enJuego || jugador.castillo.canon || !tienePago(numJ, COSTOS.canon);
    $('btnMejorarCastillo').disabled = !enJuego || jugador.castillo.mejoras >= 5 || !tienePago(numJ, COSTOS.mejoraCastillo);
    $('btnComerciar').disabled = !enJuego;
    $('btnFinTurno').disabled = !enJuego;
    $('btnCancelarModo').disabled = !modoAccion;

    const maquina = enJuego ? buscarMaquina(numJ, maquinaSeleccionadaId) : null;
    $('btnMejorarMaquina').disabled = !maquina || maquina.mejoras >= 3 || !tienePago(numJ, COSTOS.mejoraMaquina);

    const puedeAtacarCastillo = enJuego && maquina && !maquina.accionRealizada && sonConectados(maquina.ubicacion, `castillo-p${rivalDe(numJ)}`);
    $('btnAtacarCastillo').disabled = !puedeAtacarCastillo;
}

export function dibujarConexionesSVG() {
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

export function aplicarPosicionesTablero() {
    Object.entries(POSICIONES).forEach(([id, p]) => {
        const el = $(id);
        if (!el) return;
        el.style.top = `${p.top}%`;
        el.style.left = `${p.left}%`;
        el.style.width = `${p.w}%`;
        el.style.height = `${p.h}%`;
    });
}

export function mostrarPantallaFin() {
    $('fin-titulo').textContent = `¡Jugador ${gameState.ganador} gana la partida! 🏆`;
    $('pantalla-juego').classList.add('oculta');
    $('pantalla-fin').classList.remove('oculta');
}