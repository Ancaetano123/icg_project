import { queueMove, queueJump, movesQueue } from "./components/Player";
import { position } from "./components/Player";

document
  .getElementById("forward")
  ?.addEventListener("click", () => queueMove("forward"));

document
  .getElementById("backward")
  ?.addEventListener("click", () => queueMove("backward"));

document
  .getElementById("left")
  ?.addEventListener("click", () => queueMove("left"));

document
  .getElementById("right")
  ?.addEventListener("click", () => queueMove("right"));

window.addEventListener("keydown", (event) => {
  // Bloqueia qualquer input enquanto o overlay está ativo
  if (window.isStartOverlayActive && window.isStartOverlayActive()) return;
  // Bloqueia input durante teletransporte
  if (window.isTeleporting && window.isTeleporting()) return;

  // No verde (linha -1) ou na linha de partida (linha 0), só permite novo input se movesQueue estiver vazio
  if (
    (position.currentRow === -1 || position.currentRow === 0) &&
    movesQueue.length > 0
  ) {
    return;
  }

  // Movimento livre no verde (linha -1) e no resto do jogo
  if (event.key === "w" || event.key === "W") {
    event.preventDefault();
    queueMove("forward");
  } else if (event.key === "s" || event.key === "S") {
    event.preventDefault();
    queueMove("backward");
  } else if (event.key === "a" || event.key === "A") {
    event.preventDefault();
    queueMove("left");
  } else if (event.key === "d" || event.key === "D") {
    event.preventDefault();
    queueMove("right");
  } else if (event.key === " ") {
    event.preventDefault();
    queueJump(); // Chama a função de salto (já bloqueado no verde pelo Player.js)
  }
});

// Exponha movesQueue globalmente para o bloqueio funcionar
window.movesQueue = movesQueue;

// NOVO: expose teleporting state
let teleportingFlag = false;
window.isTeleporting = (val) => {
  if (typeof val === "boolean") teleportingFlag = val;
  return teleportingFlag;
};