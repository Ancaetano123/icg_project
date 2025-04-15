import * as THREE from "three";
import { metadata as rows } from "./components/Map";
import { player, position } from "./components/Player";
import { powerUpEffects } from "./animatePlayer";

const resultDOM = document.getElementById("result-container");
const finalScoreDOM = document.getElementById("final-score");

export function hitTest() {
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
        resultDOM.style.visibility = "visible";
        finalScoreDOM.innerText = position.currentRow.toString();

        // Stop the animation loop
        const renderer = document.querySelector("canvas.game").__renderer;
        if (renderer) renderer.setAnimationLoop(null);
      }
    });
  }
}