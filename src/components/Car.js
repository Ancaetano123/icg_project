import * as THREE from "three";
import { tileSize } from "../constants";
import { Wheel } from "./Wheel";

// Carro
export function Car(initialTileIndex, color, direction = true) {
  const car = new THREE.Group();
  car.position.x = initialTileIndex * tileSize;

  // Corpo principal
  const main = new THREE.Mesh(
    new THREE.BoxGeometry(65, 30, 15),
    new THREE.MeshLambertMaterial({ color, flatShading: true })
  );
  main.position.z = 13;
  main.position.x = 3;
  main.castShadow = true;
  main.receiveShadow = true;
  car.add(main);

  // Janelas
  const windowMaterial = new THREE.MeshLambertMaterial({
    color: 0x87ceeb,
    flatShading: true,
  });

  // Vidro frontal
  const frontWindow = new THREE.Mesh(
    new THREE.BoxGeometry(20, 28, 10),
    windowMaterial
  );
  frontWindow.position.set(20, 0, 25);
  car.add(frontWindow);

  // Vidro traseiro
  const backWindow = new THREE.Mesh(
    new THREE.BoxGeometry(10, 28, 10),
    windowMaterial
  );
  backWindow.position.set(-20, 0, 25);
  car.add(backWindow);

  const sideWindowLeft = new THREE.Mesh(
    new THREE.BoxGeometry(30, 2, 10),
    windowMaterial
  );
  sideWindowLeft.position.set(0, -15, 25);
  car.add(sideWindowLeft);

  const sideWindowRight = new THREE.Mesh(
    new THREE.BoxGeometry(30, 2, 10),
    windowMaterial
  );
  sideWindowRight.position.set(0, 15, 25);
  car.add(sideWindowRight);

  // Faróis
  const headlightMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
  const headlightGeometry = new THREE.CylinderGeometry(3, 3, 5, 8);

  const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  leftHeadlight.rotation.z = Math.PI / 2;
  leftHeadlight.position.set(35, -10, 15);
  car.add(leftHeadlight);

  const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  rightHeadlight.rotation.z = Math.PI / 2;
  rightHeadlight.position.set(35, 10, 15);
  car.add(rightHeadlight);

  // Retrovisores
  const mirrorMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const mirrorBaseGeometry = new THREE.BoxGeometry(2, 2, 5);
  const mirrorGeometry = new THREE.CylinderGeometry(1, 1, 3, 8);

  const leftMirrorBase = new THREE.Mesh(mirrorBaseGeometry, mirrorMaterial);
  leftMirrorBase.position.set(30, -18, 20);
  car.add(leftMirrorBase);

  const leftMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
  leftMirror.rotation.z = Math.PI / 2;
  leftMirror.position.set(30, -20, 20);
  car.add(leftMirror);

  const rightMirrorBase = new THREE.Mesh(mirrorBaseGeometry, mirrorMaterial);
  rightMirrorBase.position.set(30, 18, 20);
  car.add(rightMirrorBase);

  const rightMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
  rightMirror.rotation.z = Math.PI / 2;
  rightMirror.position.set(30, 20, 20);
  car.add(rightMirror);

  // Rodas
  const frontWheel = Wheel(18);
  car.add(frontWheel);

  const backWheel = Wheel(-18);
  car.add(backWheel);

  // Inverter direção
  if (direction === false) {
    car.scale.x = -1;
  }

  // Condutor
  const driver = new THREE.Group();

  // Cabeça
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(5, 16, 16),
    new THREE.MeshLambertMaterial({ color: "peachpuff", flatShading: true })
  );
  head.position.set(3, 0, 32);
  driver.add(head);

  // Chapéu
  const hatTop = new THREE.Mesh(
    new THREE.SphereGeometry(5.2, 32, 17, 0, Math.PI * 2, 0, Math.PI / 0.85),
    new THREE.MeshLambertMaterial({ color, flatShading: true })
  );
  hatTop.scale.z = 0.7;
  hatTop.scale.x = 1.2;
  hatTop.position.set(3, 0, 36.3);
  driver.add(hatTop);

  const hatBrim = new THREE.Mesh(
    new THREE.BoxGeometry(13, 6, 1),
    new THREE.MeshLambertMaterial({ color, flatShading: true })
  );
  hatBrim.position.set(5.5, 0, 34.7);
  hatBrim.rotation.z = Math.PI / 16;
  driver.add(hatBrim);

  // Corpo
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(6, 16, 16),
    new THREE.MeshLambertMaterial({ color: "white", flatShading: true })
  );
  body.position.set(0, 0, 22);
  driver.add(body);

  // Braço esquerdo
  const leftArm = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 7),
    new THREE.MeshLambertMaterial({ color: "peachpuff", flatShading: true })
  );
  leftArm.position.set(0, -5, 22);
  leftArm.rotation.y = Math.PI / 8;
  leftArm.rotation.x = Math.PI / 2.2;
  driver.add(leftArm);

  // Braço direito
  const rightArm = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 7),
    new THREE.MeshLambertMaterial({ color: "peachpuff", flatShading: true })
  );
  rightArm.position.set(0, 5, 22);
  rightArm.rotation.y = -Math.PI / 8;
  rightArm.rotation.x = Math.PI / 2.2;
  driver.add(rightArm);

  // Perna esquerda
  const leftLeg = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 7),
    new THREE.MeshLambertMaterial({ color: "blue", flatShading: true })
  );
  leftLeg.position.set(-5, -2.5, 17);
  leftLeg.rotation.y = Math.PI / 2;
  driver.add(leftLeg);

  // Perna direita
  const rightLeg = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 7),
    new THREE.MeshLambertMaterial({ color: "blue", flatShading: true })
  );
  rightLeg.position.set(-5, 2.5, 17);
  rightLeg.rotation.y = Math.PI / 2;
  driver.add(rightLeg);

  car.add(driver);

  return car;
}