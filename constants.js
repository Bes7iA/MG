// ---------- CONSTANTES ----------
export const RECURSOS = ['madera', 'carbon', 'hierro'];
export const EMOJI = { madera: '🪵', carbon: '⬛', hierro: '⚙️' };
export const NOMBRE = { madera: 'Madera', carbon: 'Carbón', hierro: 'Hierro' };

export const NODOS_TABLERO = Array.from({ length: 29 }, (_, i) => `nodo-${i + 1}`);

export const CONEXIONES_TABLERO = {
    'castillo-p1': ['nodo-1', 'nodo-13', 'nodo-22'],
    'castillo-p2': ['nodo-8', 'nodo-17', 'nodo-29'],

    'nodo-1':  ['castillo-p1', 'nodo-2', 'nodo-13'],
    'nodo-2':  ['nodo-1', 'nodo-3', 'nodo-9'],
    'nodo-3':  ['nodo-2', 'nodo-9'],
    'nodo-4':  ['nodo-9', 'nodo-11'],
    'nodo-5':  ['nodo-10', 'nodo-12'],
    'nodo-6':  ['nodo-7', 'nodo-12'],
    'nodo-7':  ['nodo-6', 'nodo-8', 'nodo-12'],
    'nodo-8':  ['castillo-p2', 'nodo-7', 'nodo-17'],

    'nodo-9':  ['nodo-2', 'nodo-3', 'nodo-13', 'nodo-14', 'nodo-4', 'nodo-10'],
    'nodo-10': ['nodo-14', 'nodo-15', 'nodo-9', 'nodo-5'],
    'nodo-11': ['nodo-4', 'nodo-15', 'nodo-16', 'nodo-12'],
    'nodo-12': ['nodo-6', 'nodo-7', 'nodo-16', 'nodo-17', 'nodo-11', 'nodo-5'],

    'nodo-13': ['castillo-p1', 'nodo-9', 'nodo-18', 'nodo-22', 'nodo-1'],
    'nodo-14': ['nodo-9', 'nodo-10', 'nodo-15', 'nodo-18', 'nodo-19'],
    'nodo-15': ['nodo-10', 'nodo-11', 'nodo-14', 'nodo-16', 'nodo-19', 'nodo-20'],
    'nodo-16': ['nodo-11', 'nodo-12', 'nodo-15', 'nodo-20', 'nodo-21'],
    'nodo-17': ['castillo-p2', 'nodo-12', 'nodo-21', 'nodo-8', 'nodo-29'],

    'nodo-18': ['nodo-13', 'nodo-14', 'nodo-19', 'nodo-23', 'nodo-24', 'nodo-25'],
    'nodo-19': ['nodo-14', 'nodo-15', 'nodo-18', 'nodo-26'],
    'nodo-20': ['nodo-15', 'nodo-16', 'nodo-25', 'nodo-21'],
    'nodo-21': ['nodo-16', 'nodo-17', 'nodo-20', 'nodo-26', 'nodo-27', 'nodo-28'],

    'nodo-22': ['castillo-p1', 'nodo-13', 'nodo-23'],
    'nodo-23': ['nodo-22', 'nodo-18', 'nodo-24'],
    'nodo-24': ['nodo-23', 'nodo-18'],
    'nodo-25': ['nodo-18', 'nodo-20'],
    'nodo-26': ['nodo-19', 'nodo-21'],
    'nodo-27': ['nodo-21', 'nodo-28'],
    'nodo-28': ['nodo-21', 'nodo-27', 'nodo-29'],
    'nodo-29': ['castillo-p2', 'nodo-17', 'nodo-28']
};

// Posiciones (%) usadas SOLO para calcular los centros de las líneas de conexión del SVG.
// Deben coincidir con las reglas de estilos.css.
export const POSICIONES = {
    'castillo-p1': { top: 27, left: 3.5, w: 10.5, h: 30 },
    'castillo-p2': { top: 27, left: 86, w: 10.5, h: 30 },
    'nodo-1': { top: 8.5, left: 8.5, w: 6.6, h: 11.6 }, 'nodo-2': { top: 8.5, left: 19, w: 6.6, h: 11.6 },
    'nodo-3': { top: 8.5, left: 29.5, w: 6.6, h: 11.6 }, 'nodo-4': { top: 8.5, left: 39, w: 6.6, h: 11.6 },
    'nodo-5': { top: 8.5, left: 55, w: 6.6, h: 11.6 }, 'nodo-6': { top: 8.5, left: 65.5, w: 6.6, h: 11.6 },
    'nodo-7': { top: 8.5, left: 75, w: 6.6, h: 11.6 }, 'nodo-8': { top: 8.5, left: 85.5, w: 6.6, h: 11.6 },
    'nodo-9': { top: 26, left: 28, w: 6.6, h: 11.6 }, 'nodo-10': { top: 26, left: 41, w: 6.6, h: 11.6 },
    'nodo-11': { top: 26, left: 52.5, w: 6.6, h: 11.6 }, 'nodo-12': { top: 26, left: 65, w: 6.6, h: 11.6 },
    'nodo-13': { top: 44, left: 20.5, w: 6.6, h: 11.6 }, 'nodo-14': { top: 44, left: 35.5, w: 6.6, h: 11.6 },
    'nodo-15': { top: 44, left: 46.5, w: 6.6, h: 11.6 }, 'nodo-16': { top: 44, left: 57, w: 6.6, h: 11.6 },
    'nodo-17': { top: 44, left: 72, w: 6.6, h: 11.6 },
    'nodo-18': { top: 61.5, left: 28, w: 6.6, h: 11.6 }, 'nodo-19': { top: 61.5, left: 41, w: 6.6, h: 11.6 },
    'nodo-20': { top: 61.5, left: 52.5, w: 6.6, h: 11.6 }, 'nodo-21': { top: 61.5, left: 65, w: 6.6, h: 11.6 },
    'nodo-22': { top: 79, left: 8.5, w: 6.6, h: 11.6 }, 'nodo-23': { top: 79, left: 19, w: 6.6, h: 11.6 },
    'nodo-24': { top: 79, left: 29.5, w: 6.6, h: 11.6 }, 'nodo-25': { top: 79, left: 39, w: 6.6, h: 11.6 },
    'nodo-26': { top: 79, left: 55, w: 6.6, h: 11.6 }, 'nodo-27': { top: 79, left: 65.5, w: 6.6, h: 11.6 },
    'nodo-28': { top: 79, left: 75, w: 6.6, h: 11.6 }, 'nodo-29': { top: 79, left: 85.5, w: 6.6, h: 11.6 }
};

export const COSTOS = {
    maquina: { madera: 3, hierro: 3 },
    extractor: { madera: 2, carbon: 2 },
    canon: { madera: 4, carbon: 4, hierro: 4 },
    mejoraMaquina: { madera: 1, hierro: 1 },
    mejoraCastillo: { hierro: 4 },
    conquistaNueva: { carbon: 1 },
    conquistaEnemigaBase: 2,
    conquistaEnemigaExtractor: 3
};

// Mismas rutas que en el proyecto original: si existen en assets/, se usan tal cual.
// Si una imagen no carga, cada elemento cae automáticamente en el diseño con emoji.
export const IMAGENES = {
    reverso: 'assets/cartas/reverso.png',
    madera: 'assets/cartas/madera.png',
    carbon: 'assets/cartas/carbon.png',
    hierro: 'assets/cartas/hierro.png',
    mgRojo: 'assets/cartas/MG_Rojo.png',
    mgAzul: 'assets/cartas/MG_Azul.png'
};