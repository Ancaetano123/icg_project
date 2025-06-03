import * as THREE from "three";
import { tileSize } from "../constants";

export function Coin(tileIndex) {
  const coin = new THREE.Group();
  coin.position.x = tileIndex * tileSize;
  coin.position.z = 28; // centro da moeda no meio

  // Corpo da moeda (cilindro dourado maior)
  const geometry = new THREE.CylinderGeometry(10, 10, 3, 32);
  const material = new THREE.MeshLambertMaterial({ color: 0xffd700 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.y = Math.PI / 2; // Deixa a moeda em pé (vertical, gira como pião no eixo Z)
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  coin.add(mesh);

  // Borda mais escura
  const edgeMaterial = new THREE.MeshLambertMaterial({ color: 0xbfa100 });
  const edge = new THREE.Mesh(
    new THREE.CylinderGeometry(10.5, 10.5, 3.5, 32, 1, true),
    edgeMaterial
  );
  edge.rotation.y = Math.PI / 2;
  coin.add(edge);

  // Marcar a moeda para detecção do ímã
  coin.userData.isCoin = true;

  return coin;
}
