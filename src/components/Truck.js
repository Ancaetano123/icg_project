import * as THREE from "three";
import { tileSize } from "../constants";

// Caminhão
export function Truck(initialTileIndex, color, direction = true) {
  const truck = new THREE.Group();
  truck.position.x = initialTileIndex * tileSize;

  // Cabine
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(30, 30, 30),
    new THREE.MeshLambertMaterial({ color, flatShading: true })
  );
  cabin.position.x = 35;
  cabin.position.z = 20;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  truck.add(cabin);

  // Carga
  const cargo = new THREE.Mesh(
    new THREE.BoxGeometry(70, 35, 35),
    new THREE.MeshLambertMaterial({
      color: 0xb4c6fc,
      flatShading: true,
    })
  );
  cargo.position.x = -15;
  cargo.position.z = 25;
  cargo.castShadow = true;
  cargo.receiveShadow = true;
  truck.add(cargo);

  // Faróis
  const headlightMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
  const headlightGeometry = new THREE.CylinderGeometry(3, 3, 5, 8);

  const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  leftHeadlight.rotation.z = Math.PI / 2;
  leftHeadlight.position.set(50, -10, 15);
  truck.add(leftHeadlight);

  const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  rightHeadlight.rotation.z = Math.PI / 2;
  rightHeadlight.position.set(50, 10, 15);
  truck.add(rightHeadlight);

  // Retrovisores
  const mirrorMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const mirrorBaseGeometry = new THREE.BoxGeometry(2, 2, 5);
  const mirrorGeometry = new THREE.CylinderGeometry(1, 1, 3, 8);

  const leftMirrorBase = new THREE.Mesh(mirrorBaseGeometry, mirrorMaterial);
  leftMirrorBase.position.set(30, -18, 20);
  truck.add(leftMirrorBase);

  const leftMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
  leftMirror.rotation.z = Math.PI / 2;
  leftMirror.position.set(30, -20, 20);
  truck.add(leftMirror);

  const rightMirrorBase = new THREE.Mesh(mirrorBaseGeometry, mirrorMaterial);
  rightMirrorBase.position.set(30, 18, 20);
  truck.add(rightMirrorBase);

  const rightMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
  rightMirror.rotation.z = Math.PI / 2;
  rightMirror.position.set(30, 20, 20);
  truck.add(rightMirror);

  // Rodas
  import("./Wheel").then(({ Wheel }) => {
    const frontWheel = Wheel(18);
    truck.add(frontWheel);

    const backWheel = Wheel(-18);
    truck.add(backWheel);
  });

  // Inverter direção
  if (direction === false) {
    truck.scale.x = -1;
  }

  return truck;
}