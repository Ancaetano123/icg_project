import * as THREE from "three";
import { tileSize } from "../constants";

export function Tree(tileIndex, height) {
  const tree = new THREE.Group();
  tree.position.x = tileIndex * tileSize;

  const trunk = new THREE.Mesh(
    new THREE.BoxGeometry(15, 15, 20),
    new THREE.MeshLambertMaterial({
      color: 0x4d2926,
      flatShading: true,
    })
  );
  trunk.position.z = 10;
  tree.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.BoxGeometry(30, 30, height),
    new THREE.MeshLambertMaterial({
      color: 0x7aa21d,
      flatShading: true,
    })
  );
  crown.position.z = height / 2 + 20;
  crown.castShadow = true;
  crown.receiveShadow = true;
  tree.add(crown);

  return tree;
}

export function Bush(tileIndex) {
  const bush = new THREE.Mesh(
    new THREE.SphereGeometry(tileSize * 0.5, 8, 8),
    new THREE.MeshLambertMaterial({
      color: 0x2e8b57,
      flatShading: true,
    })
  );
  bush.position.x = tileIndex * tileSize;
  bush.position.z = tileSize * 0.15; // Slightly above the ground

  bush.castShadow = true;
  bush.receiveShadow = true;
  return bush;
}

export function Flower(tileIndex) {
  const flower = new THREE.Group();
  flower.position.x = tileIndex * tileSize;
  flower.position.z = 0; // Ajuste para o nível correto

// Stem (caule)
const stem = new THREE.Mesh(
  new THREE.CylinderGeometry(tileSize * 0.05, tileSize * 0.05, tileSize * 0.5, 8),
  new THREE.MeshLambertMaterial({ color: 0x228b22 }) // Green stem
);
stem.rotation.x = Math.PI / 2; // Rotacionar o cilindro para ficar em pé
stem.position.z = tileSize * 0.25; // Colocar o caule em pé
stem.castShadow = true;
stem.receiveShadow = true;
flower.add(stem);

  // Center of the flower (centro)
  const center = new THREE.Mesh(
    new THREE.SphereGeometry(tileSize * 0.1, 16, 16),
    new THREE.MeshLambertMaterial({ color: 0xffff00 }) // Yellow center
  );
  center.position.z = tileSize * 0.5; // No topo do caule
  center.castShadow = true;
  center.receiveShadow = true;
  flower.add(center);

  // Petals (pétalas)
const petalMaterial = new THREE.MeshLambertMaterial({ color: 0xff69b4 }); // Pink petals
const petalGeometry = new THREE.SphereGeometry(tileSize * 0.1, 8, 8); // Rounded petals

for (let i = 0; i < 6; i++) {
  const petal = new THREE.Mesh(petalGeometry, petalMaterial);

  // Posicionar as pétalas ao redor do centro, em um plano horizontal
  petal.position.x = Math.cos((i / 6) * Math.PI * 2) * tileSize * 0.2; // Circular ao redor do centro
  petal.position.y = Math.sin((i / 6) * Math.PI * 2) * tileSize * 0.2; // Circular ao redor do centro
  petal.position.z = tileSize * 0.5; // Alinhado com o centro no eixo Z

  // Inclinar as pétalas para ficarem na horizontal
  petal.rotation.z = (i / 6) * Math.PI * 2; // Girar as pétalas ao redor do centro

  petal.castShadow = true;
  petal.receiveShadow = true;
  flower.add(petal);
}
  flower.castShadow = true;
  flower.receiveShadow = true;
  return flower;
}