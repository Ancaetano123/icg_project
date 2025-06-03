const THREE = window.THREE;
// import * as THREE from "three";
import { tileSize } from "../constants";
import { Wheel } from "./Wheel";

export function Car(initialTileIndex, color, direction = true) {
  const car = new THREE.Group();
  car.position.x = initialTileIndex * tileSize;

  // Corpo principal do carro
  const main = new THREE.Mesh(
    new THREE.BoxGeometry(65, 30, 15),
    new THREE.MeshLambertMaterial({ color, flatShading: true })
  );
  main.position.z = 13;
  main.position.x = 3;
  main.castShadow = true;
  main.receiveShadow = true;
  car.add(main);

  // Janelas (ao redor da parte superior do carro)
  const windowMaterial = new THREE.MeshLambertMaterial({
    color: 0x87ceeb, // Azul claro
    flatShading: true,
  });

  // Vidro frontal (frente X positivo)
  const frontWindow = new THREE.Mesh(
    new THREE.BoxGeometry(20, 28, 10),
    windowMaterial
  );
  frontWindow.position.set(20, 0, 25);
  car.add(frontWindow);

  // Vidro traseiro (trás X negativo)
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

  // Faróis (cilindros na frente do carro)
  const headlightMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 }); // Amarelo
  const headlightGeometry = new THREE.CylinderGeometry(3, 3, 5, 8);

  const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  leftHeadlight.rotation.z = Math.PI / 2;
  leftHeadlight.position.set(35, -10, 15);
  car.add(leftHeadlight);

  const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  rightHeadlight.rotation.z = Math.PI / 2;
  rightHeadlight.position.set(35, 10, 15);
  car.add(rightHeadlight);

  // Retrovisores (cubos e cilindros nas laterais)
  const mirrorMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Preto
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

  // Inverte o carro se direção for para a esquerda (igual ao camião)
  if (direction === false) {
    car.scale.x = -1;
  }

  // --- Condutor (driver) ---
  const driver = new THREE.Group();

  // Cabeça
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(5, 16, 16),
    new THREE.MeshLambertMaterial({ color: "peachpuff", flatShading: true })
  );
  head.position.set(3, 0, 32);
  driver.add(head);

  // Chapéu ajustado à cabeça (semiesfera achatada + pala)
  // Topo do chapéu (semiesfera achatada, cobre mais da cabeça)
  const hatTop = new THREE.Mesh(
    new THREE.SphereGeometry(5.2, 32, 17, 0, Math.PI * 2, 0, Math.PI / 0.85),
    new THREE.MeshLambertMaterial({ color, flatShading: true })
  );
  hatTop.scale.z = 0.7;
  hatTop.scale.x = 1.2;
  hatTop.position.set(3, 0, 36.3);
  driver.add(hatTop);

  // Pala do chapéu (larga, mas pouco profunda)
  const hatBrim = new THREE.Mesh(
    new THREE.BoxGeometry(13, 6, 1), // Largura bem maior que a cabeça, pouco para a frente
    new THREE.MeshLambertMaterial({ color, flatShading: true })
  );
  hatBrim.position.set(5.5, 0, 34.7); // Só um pouco à frente da cabeça
  hatBrim.rotation.z = Math.PI / 16;
  driver.add(hatBrim);

  // Corpo
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(6, 16, 16),
    new THREE.MeshLambertMaterial({ color: "white", flatShading: true })
  );
  body.position.set(0, 0, 22); // Mais para trás
  driver.add(body);

  // Braço esquerdo (ligeiramente para frente)
  const leftArm = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 7),
    new THREE.MeshLambertMaterial({ color: "peachpuff", flatShading: true })
  );
  leftArm.position.set(0, -5, 22);
  leftArm.rotation.y = Math.PI / 8;
  leftArm.rotation.x = Math.PI / 2.2;
  driver.add(leftArm);

  // Braço direito (ligeiramente para frente)
  const rightArm = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 7),
    new THREE.MeshLambertMaterial({ color: "peachpuff", flatShading: true })
  );
  rightArm.position.set(0, 5, 22);
  rightArm.rotation.y = -Math.PI / 8;
  rightArm.rotation.x = Math.PI / 2.2;
  driver.add(rightArm);

  // Perna esquerda (sentada, para frente)
  const leftLeg = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 7),
    new THREE.MeshLambertMaterial({ color: "blue", flatShading: true })
  );
  leftLeg.position.set(-5, -2.5, 17); // Increased spacing
  leftLeg.rotation.y = Math.PI / 2;
  driver.add(leftLeg);

  // Perna direita (sentada, para frente)
  const rightLeg = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 7),
    new THREE.MeshLambertMaterial({ color: "blue", flatShading: true })
  );
  rightLeg.position.set(-5, 2.5, 17); // Increased spacing
  rightLeg.rotation.y = Math.PI / 2;
  driver.add(rightLeg);

  car.add(driver);

  car.castShadow = true;
  car.receiveShadow = true;
  return car;
}