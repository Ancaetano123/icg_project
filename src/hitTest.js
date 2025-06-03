import * as THREE from "three";
import { metadata as rows } from "./components/Map";
import { player, position, isGameOver, setGameOver } from "./components/Player";
import { powerUpEffects } from "./animatePlayer";

const resultDOM = document.getElementById("result-container");
const finalScoreDOM = document.getElementById("final-score");

export function hitTest() {
  // Check if player has active shield protection
  if (player.userData.hasShield && player.userData.shieldActive) {
    return; // Shield blocks all damage
  }

  // Não testa colisão se já morreu ou se está teleportando (portal)
  if (isGameOver) return;
  if (window.isTeleporting && window.isTeleporting()) return;

  const row = rows[position.currentRow - 1];
  if (!row) return;

  if (row.type === "car" || row.type === "truck") {
    const playerBoundingBox = new THREE.Box3().setFromObject(player);

    row.vehicles.forEach(({ ref }) => {
      if (!ref) throw Error("Vehicle reference is missing");

      const vehicleBoundingBox = new THREE.Box3().setFromObject(ref);

      if (playerBoundingBox.intersectsBox(vehicleBoundingBox)) {
        if (powerUpEffects.star) return; // Skip game-over logic if invincible

        if (!resultDOM || !finalScoreDOM) return;

        // Show the game over screen and stop further actions
        if (typeof window.showGameOverScreen === "function") {
          window.showGameOverScreen();
        } else {
          resultDOM.style.display = "flex";
          resultDOM.style.visibility = "visible";
        }
        finalScoreDOM.innerText = position.currentRow.toString();

        setGameOver(true); // Bloqueia o jogador imediatamente ao morrer

        // Remove the animation loop stopping logic - let it continue running
      }
    });
  }
}