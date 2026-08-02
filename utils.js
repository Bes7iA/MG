export const $ = (id) => document.getElementById(id);
export const rivalDe = (n) => (n === 1 ? 2 : 1);

export function log(mensaje) {
    const cont = $('log-contenido');
    const div = document.createElement('div');
    div.textContent = mensaje;
    cont.appendChild(div);
    cont.scrollTop = cont.scrollHeight;
    while (cont.children.length > 60) cont.removeChild(cont.firstChild);
}