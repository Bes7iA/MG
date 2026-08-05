import { $ } from './utils.js';
import { RECURSOS, EMOJI, NOMBRE } from './constants.js';
import { gameState } from './state.js';

export function abrirModal(titulo, descripcion, opciones, conRetraso = false) {
    return new Promise((resolve) => {
        $('modal-titulo').innerHTML = titulo;
        $('modal-descripcion').innerHTML = descripcion || '';
        const cont = $('modal-botones');
        cont.innerHTML = '';

        const segundosEspera = conRetraso ? 3 : 0;

        opciones.forEach((op) => {
            const btn = document.createElement('button');

            if (segundosEspera > 0) {
                btn.textContent = `Espera... ${segundosEspera}`;
                btn.disabled = true;
            } else {
                btn.textContent = op.label;
                btn.disabled = !!op.disabled;
            }

            if (op.destacado) btn.classList.add('opcion-destacada');

            btn.addEventListener('click', () => {
                $('modal-overlay').classList.add('oculta');
                resolve(op.value);
            });
            cont.appendChild(btn);
        });

        $('modal-overlay').classList.remove('oculta');

        if (segundosEspera > 0) {
            let restante = segundosEspera;
            const botones = Array.from(cont.children);
            const intervalo = setInterval(() => {
                restante -= 1;
                if (restante > 0) {
                    botones.forEach((btn) => { btn.textContent = `Espera... ${restante}`; });
                } else {
                    clearInterval(intervalo);
                    botones.forEach((btn, i) => {
                        btn.textContent = opciones[i].label;
                        btn.disabled = !!opciones[i].disabled;
                    });
                }
            }, 1000);
        }
    });
}

export function preguntar(titulo, descripcion, opciones, conRetraso = false) {
    return abrirModal(titulo, descripcion, opciones, conRetraso);
}

export async function elegirRecurso(numJ, titulo, descripcion, permitirCancelar = true) {
    const recursos = gameState.jugadores[numJ].recursos;
    const opciones = RECURSOS.filter((r) => recursos[r] > 0).map((r) => ({
        label: `${EMOJI[r]} ${NOMBRE[r]} (tienes ${recursos[r]})`,
        value: r
    }));
    if (opciones.length === 0) return null;
    if (permitirCancelar) opciones.push({ label: 'Cancelar', value: null });
    return preguntar(titulo, descripcion, opciones);
}