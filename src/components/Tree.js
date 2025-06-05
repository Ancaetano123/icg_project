import * as THREE from "three";
import { tileSize } from "../constants";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Árvore
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

// Arbusto
export function Bush(tileIndex) {
  const bush = new THREE.Mesh(
    new THREE.SphereGeometry(tileSize * 0.5, 8, 8),
    new THREE.MeshLambertMaterial({
      color: 0x2e8b57,
      flatShading: true,
    })
  );
  bush.position.x = tileIndex * tileSize;
  bush.position.z = tileSize * 0.15;

  bush.castShadow = true;
  bush.receiveShadow = true;
  return bush;
}

// Flor
export function Flower(tileIndex) {
  const flower = new THREE.Group();
  flower.position.x = tileIndex * tileSize;
  flower.position.z = 0;

  // Caule
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(tileSize * 0.025, tileSize * 0.025, tileSize * 0.22, 8),
    new THREE.MeshLambertMaterial({ color: 0x228b22 })
  );
  stem.rotation.x = Math.PI / 2;
  stem.position.z = tileSize * 0.11;
  stem.castShadow = true;
  stem.receiveShadow = true;
  flower.add(stem);

  // Centro
  const center = new THREE.Mesh(
    new THREE.SphereGeometry(tileSize * 0.045, 16, 16),
    new THREE.MeshLambertMaterial({ color: 0xffff00 })
  );
  center.position.z = tileSize * 0.22;
  center.castShadow = true;
  center.receiveShadow = true;
  flower.add(center);

  // Pétalas
  const petalMaterial = new THREE.MeshLambertMaterial({ color: 0xff69b4 });
  const petalGeometry = new THREE.SphereGeometry(tileSize * 0.045, 8, 8);

  for (let i = 0; i < 6; i++) {
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    petal.position.x = Math.cos((i / 6) * Math.PI * 2) * tileSize * 0.09;
    petal.position.y = Math.sin((i / 6) * Math.PI * 2) * tileSize * 0.09;
    petal.position.z = tileSize * 0.22;
    petal.rotation.z = (i / 6) * Math.PI * 2;
    petal.castShadow = true;
    petal.receiveShadow = true;
    flower.add(petal);
  }
  flower.castShadow = true;
  flower.receiveShadow = true;
  return flower;
}