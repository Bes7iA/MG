import { $ } from './utils.js';

let reglasYaCargadas = false;

export async function abrirReglas() {
    $('reglas-overlay').classList.remove('oculta');

    if (!reglasYaCargadas) {
        try {
            const respuesta = await fetch('REGLAS.md');
            const texto = await respuesta.text();
            $('reglas-contenido').innerHTML = marked.parse(texto);
            reglasYaCargadas = true;
        } catch (error) {
            $('reglas-contenido').textContent = 'No se pudieron cargar las reglas.';
        }
    }
}

export function cerrarReglas() {
    $('reglas-overlay').classList.add('oculta');
}