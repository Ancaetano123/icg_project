import * as THREE from "three";
import { tileSize } from "../constants";
import { Wheel } from "./Wheel";

export function Car(initialTileIndex, color) {
  const car = new THREE.Group();
  car.position.x = initialTileIndex * tileSize;

  // Corpo principal do carro
  const main = new THREE.Mesh(
    new THREE.BoxGeometry(60, 30, 15),
    new THREE.MeshLambertMaterial({ color, flatShading: true })
  );
  main.position.z = 12;
  main.castShadow = true;
  main.receiveShadow = true;
  car.add(main);


  // Janelas (ao redor da parte superior do carro)
  const windowMaterial = new THREE.MeshLambertMaterial({
    color: 0x87ceeb, // Azul claro
    flatShading: true,
  });

  const frontWindow = new THREE.Mesh(
    new THREE.BoxGeometry(20, 28, 10),
    windowMaterial
  );
  frontWindow.position.set(-10, 0, 25);
  car.add(frontWindow);

  const backWindow = new THREE.Mesh(
    new THREE.BoxGeometry(20, 28, 10),
    windowMaterial
  );
  backWindow.position.set(20, 0, 25);
  car.add(backWindow);

  const sideWindowLeft = new THREE.Mesh(
    new THREE.BoxGeometry(30, 2, 10),
    windowMaterial
  );
  sideWindowLeft.position.set(5, -15, 25);
  car.add(sideWindowLeft);

  const sideWindowRight = new THREE.Mesh(
    new THREE.BoxGeometry(30, 2, 10),
    windowMaterial
  );
  sideWindowRight.position.set(5, 15, 25);
  car.add(sideWindowRight);

  // Faróis (cilindros na frente do carro)
  const headlightMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 }); // Amarelo
  const headlightGeometry = new THREE.CylinderGeometry(3, 3, 5, 8);

  const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  leftHeadlight.rotation.z = Math.PI / 2;
  leftHeadlight.position.set(-35, -10, 15);
  car.add(leftHeadlight);

  const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  rightHeadlight.rotation.z = Math.PI / 2;
  rightHeadlight.position.set(-35, 10, 15);
  car.add(rightHeadlight);

  // Retrovisores (cubos e cilindros nas laterais)
  const mirrorMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Preto
  const mirrorBaseGeometry = new THREE.BoxGeometry(2, 2, 5);
  const mirrorGeometry = new THREE.CylinderGeometry(1, 1, 3, 8);

  const leftMirrorBase = new THREE.Mesh(mirrorBaseGeometry, mirrorMaterial);
  leftMirrorBase.position.set(-20, -18, 20);
  car.add(leftMirrorBase);

  const leftMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
  leftMirror.rotation.z = Math.PI / 2;
  leftMirror.position.set(-20, -20, 20);
  car.add(leftMirror);

  const rightMirrorBase = new THREE.Mesh(mirrorBaseGeometry, mirrorMaterial);
  rightMirrorBase.position.set(-20, 18, 20);
  car.add(rightMirrorBase);

  const rightMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
  rightMirror.rotation.z = Math.PI / 2;
  rightMirror.position.set(-20, 20, 20);
  car.add(rightMirror);

  // Rodas
  const frontWheel = Wheel(18);
  car.add(frontWheel);

  const backWheel = Wheel(-18);
  car.add(backWheel);


  return car;
}