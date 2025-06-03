const THREE = window.THREE;
import { tilesPerRow, tileSize } from "../constants";

export function Grass(rowIndex) {
  const grass = new THREE.Group();
  grass.position.y = rowIndex * tileSize;

  const foundation = new THREE.Mesh(
    new THREE.BoxGeometry(tilesPerRow * tileSize, tileSize, 3),
    new THREE.MeshLambertMaterial({ color: "#6ab150" }) // verde
  );
  foundation.position.z = 1.5;
  foundation.receiveShadow = true;
  grass.add(foundation);

  return grass;
}