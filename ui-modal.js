import { $ } from './utils.js';
import { RECURSOS, EMOJI, NOMBRE } from './constants.js';
import { gameState } from './state.js';

export function abrirModal(titulo, descripcion, opciones) {
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

export function preguntar(titulo, descripcion, opciones) {
    return abrirModal(titulo, descripcion, opciones);
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