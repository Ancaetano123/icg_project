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
  // Bloqueia input se overlay ativo
  if (window.isStartOverlayActive && window.isStartOverlayActive()) return;
  // Bloqueia input durante teletransporte
  if (window.isTeleporting && window.isTeleporting()) return;

  // No verde ou partida, só permite input se movesQueue vazio
  if (
    (position.currentRow === -1 || position.currentRow === 0) &&
    movesQueue.length > 0
  ) {
    return;
  }

  // Movimento livre
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
    queueJump();
  }
});

// Expor movesQueue globalmente
window.movesQueue = movesQueue;

// Expor estado de teletransporte
let teleportingFlag = false;
window.isTeleporting = (val) => {
  if (typeof val === "boolean") teleportingFlag = val;
  return teleportingFlag;
};