const THREE = window.THREE;
// import * as THREE from "three";
import { tileSize } from "../constants";
import { Wheel } from "./Wheel";

export function Truck(initialTileIndex, color, direction = true) {
  const truck = new THREE.Group();
  truck.position.x = initialTileIndex * tileSize;

  // Cabine do caminhão
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(30, 30, 30),
    new THREE.MeshLambertMaterial({ color, flatShading: true })
  );
  cabin.position.x = 35;
  cabin.position.z = 20;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  truck.add(cabin);

  

  // Carga do caminhão
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

  // Faróis (cilindros na frente da cabine)
  const headlightMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 }); // Amarelo
  const headlightGeometry = new THREE.CylinderGeometry(3, 3, 5, 8);

  const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  leftHeadlight.rotation.z = Math.PI / 2;
  leftHeadlight.position.set(50, -10, 15);
  truck.add(leftHeadlight);

  const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  rightHeadlight.rotation.z = Math.PI / 2;
  rightHeadlight.position.set(50, 10, 15);
  truck.add(rightHeadlight);

  // Retrovisores (cubos e cilindros nas laterais)
  const mirrorMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Preto
  const mirrorBaseGeometry = new THREE.BoxGeometry(2, 2, 5);
  const mirrorGeometry = new THREE.CylinderGeometry(1, 1, 3, 8);

  const leftMirrorBase = new THREE.Mesh(mirrorBaseGeometry, mirrorMaterial);
  leftMirrorBase.position.set(40, -18, 25);
  truck.add(leftMirrorBase);

  const leftMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
  leftMirror.rotation.z = Math.PI / 2;
  leftMirror.position.set(40, -20, 25);
  truck.add(leftMirror);

  const rightMirrorBase = new THREE.Mesh(mirrorBaseGeometry, mirrorMaterial);
  rightMirrorBase.position.set(40, 18, 25);
  truck.add(rightMirrorBase);

  const rightMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
  rightMirror.rotation.z = Math.PI / 2;
  rightMirror.position.set(40, 20, 25);
  truck.add(rightMirror);

  // Rodas
  const frontWheel = Wheel(37);
  truck.add(frontWheel);

  const middleWheel = Wheel(5);
  truck.add(middleWheel);

  const backWheel = Wheel(-35);
  truck.add(backWheel);
  
  // Inverte o camião se direção for para a esquerda
  if (direction === false) {
    truck.scale.x = -1;
  }

  truck.castShadow = true;
  truck.receiveShadow = true;
  return truck;
}