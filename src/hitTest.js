import * as THREE from "three";
import { metadata as rows } from "./components/Map";
import { player, position, isGameOver, setGameOver } from "./components/Player";

const resultDOM = document.getElementById("result-container");
const finalScoreDOM = document.getElementById("final-score");

export function hitTest() {
  // Bloqueia dano se o escudo ativo
  if (player.userData.hasShield && player.userData.shieldActive) {
    return;
  }
  // Não testa colisão se já morreu ou está a teleportar
  if (isGameOver) return;
  if (window.isTeleporting && window.isTeleporting()) return;

  const row = rows[position.currentRow - 1];
  if (!row) return;

  if (row.type === "car" || row.type === "truck") {
    const playerBoundingBox = new THREE.Box3().setFromObject(player);
    row.vehicles.forEach(({ ref }) => {
      if (!ref) return;
      const vehicleBoundingBox = new THREE.Box3().setFromObject(ref);
      if (playerBoundingBox.intersectsBox(vehicleBoundingBox)) {
        if (!resultDOM || !finalScoreDOM) return;
        if (typeof window.showGameOverScreen === "function") {
          window.showGameOverScreen();
        } else {
          resultDOM.style.display = "flex";
          resultDOM.style.visibility = "visible";
        }
        finalScoreDOM.innerText = position.currentRow.toString();
        setGameOver(true);
      }
    });
  }
}