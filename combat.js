import { log } from './utils.js';
import { liberarCasilla, buscarRetiroDisponible } from './board.js';
import { gameState } from './state.js';

export const rollD4 = () => 1 + Math.floor(Math.random() * 4);
export const roll2D4 = () => rollD4() + rollD4();

export function destruirMaquina(maquina) {
    liberarCasilla(maquina);
    const jugador = gameState.jugadores[maquina.jugador];
    jugador.maquinas = jugador.maquinas.filter((m) => m.id !== maquina.id);
    log(`💀 Se destruyó una máquina de guerra de Jugador ${maquina.jugador}.`);
}

export async function resolverCombate(atacante, defensor, permiteRetiro) {
    const dmg1 = atacante.dano + rollD4();
    defensor.hp -= dmg1;
    log(`💥 Máquina de Jugador ${atacante.jugador} hace ${dmg1} de daño a máquina de Jugador ${defensor.jugador} (HP restante: ${Math.max(defensor.hp, 0)}).`);
    if (defensor.hp <= 0) { destruirMaquina(defensor); return 'atacanteGana'; }

    if (permiteRetiro) {
        const retiro = buscarRetiroDisponible(defensor);
        if (retiro) {
            liberarCasilla(defensor);
            defensor.ubicacion = retiro;
            gameState.tablero[retiro].ocupante = { jugador: defensor.jugador, maquinaId: defensor.id };
            log(`🏃 La máquina de Jugador ${defensor.jugador} sobrevive y se retira a ${retiro}.`);
            return 'defensorRetira';
        }
    }

    let turno = 'defensor';
    while (true) {
        if (turno === 'defensor') {
            const dmg = defensor.dano + rollD4();
            atacante.hp -= dmg;
            log(`💥 Máquina de Jugador ${defensor.jugador} contraataca con ${dmg} de daño (HP restante atacante: ${Math.max(atacante.hp, 0)}).`);
            if (atacante.hp <= 0) { destruirMaquina(atacante); return 'defensorGana'; }
            turno = 'atacante';
        } else {
            const dmg = atacante.dano + rollD4();
            defensor.hp -= dmg;
            log(`💥 Máquina de Jugador ${atacante.jugador} hace ${dmg} de daño (HP restante defensor: ${Math.max(defensor.hp, 0)}).`);
            if (defensor.hp <= 0) { destruirMaquina(defensor); return 'atacanteGana'; }
            turno = 'defensor';
        }
    }
}