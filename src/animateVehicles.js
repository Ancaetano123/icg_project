const THREE = window.THREE;
// import * as THREE from "three";
import { metadata as rows } from "./components/Map";
import { minTileIndex, maxTileIndex, tileSize } from "./constants";

const clock = new THREE.Clock();

export function animateVehicles() {
  const delta = clock.getDelta();

  // Animate cars and trucks
  rows.forEach((rowData) => {
    if (rowData.type === "car" || rowData.type === "truck") {
      const beginningOfRow = (minTileIndex - 2) * tileSize;
      const endOfRow = (maxTileIndex + 2) * tileSize;

      rowData.vehicles.forEach(({ ref }) => {
        if (!ref) throw Error("Vehicle reference is missing");

        if (rowData.direction === false) {
          // Direita para esquerda (frente para X negativo)
          ref.position.x =
            ref.position.x < beginningOfRow
              ? endOfRow
              : ref.position.x - rowData.speed * delta;
        } else {
          // Esquerda para direita (frente para X positivo)
          ref.position.x =
            ref.position.x > endOfRow
              ? beginningOfRow
              : ref.position.x + rowData.speed * delta;
        }
      });
    }
  });
}