import * as THREE from "three";
import { endsUpInValidPosition } from "../utilities/endsUpInValidPosition";
import { metadata as rows, addRows } from "./Map";

export const player = Player();

function Player() {
  const player = new THREE.Group();

  // Cabeça (esfera)
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32), // Esfera para a cabeça
    new THREE.MeshLambertMaterial({
      color: "peachpuff", // Cor de pele
      flatShading: true,
    })
  );
  head.position.set(0, 0, 25); // Posição acima do tronco
  head.castShadow = true;
  head.receiveShadow = true;
  player.add(head);

  // Corpo (esfera maior)
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(7, 32, 32), // Esfera para o corpo
    new THREE.MeshLambertMaterial({
      color: "white", // Cor do corpo
      flatShading: true,
    })
  );
  body.position.set(0, 0, 15); // Posição central
  body.castShadow = true;
  body.receiveShadow = true;
  player.add(body);

  // Braço esquerdo
  const leftArm = new THREE.Group();
  leftArm.name = "rightArm"; // Nome do braço direito para identificação

  // Parte superior do braço (camiseta)
  const leftArmShirt = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 3), // Parte superior menor
  new THREE.MeshLambertMaterial({
  color: "white", // Cor da camiseta
  flatShading: true,
  })
  );
  leftArmShirt.position.set(0, 0, 1.5); // Ajuste de posição
  leftArm.add(leftArmShirt);

  // Parte inferior do braço (pele)
  const leftArmSkin = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 9), // Parte inferior maior
  new THREE.MeshLambertMaterial({
  color: "peachpuff", // Cor de pele
  flatShading: true,
  })
  );
  leftArmSkin.position.set(0, 0, -4.5); // Ajuste de posição
  leftArm.add(leftArmSkin);

  leftArm.position.set(-8, 0, 15); // Posição do braço esquerdo
  leftArm.castShadow = true;
  leftArm.receiveShadow = true;
  player.add(leftArm);

  // Braço direito
  const rightArm = new THREE.Group();
  rightArm.name = "leftArm"; // Nome do braço esquerdo para identificação

  // Parte superior do braço (camiseta)
  const rightArmShirt = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 3), // Parte superior menor
  new THREE.MeshLambertMaterial({
  color: "white", // Cor da camiseta
  flatShading: true,
  })
  );
  rightArmShirt.position.set(0, 0, 1.5); // Ajuste de posição
  rightArm.add(rightArmShirt);

  // Parte inferior do braço (pele)
  const rightArmSkin = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 9), // Parte inferior maior
  new THREE.MeshLambertMaterial({
  color: "peachpuff", // Cor de pele
  flatShading: true,
  })
  );
  rightArmSkin.position.set(0, 0, -2.5); // Ajuste de posição
  rightArm.add(rightArmSkin);

  rightArm.position.set(8, 0, 15); // Posição do braço direito
  rightArm.castShadow = true;
  rightArm.receiveShadow = true;
  player.add(rightArm);

  // Perna esquerda
  const leftLeg = new THREE.Group();
  leftLeg.name = "rightLeg"; // Nome da perna direita para identificação

  // Parte superior da perna (calça)
  const leftLegPants = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 7.5), // Parte superior maior
    new THREE.MeshLambertMaterial({
      color: "blue", // Cor da calça
      flatShading: true,
    })
  );
  leftLegPants.position.set(0, 0, 3.75); // Ajuste de posição
  leftLeg.add(leftLegPants);

  // Parte inferior da perna (sapato)
  const leftLegShoe = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 2.5), // Parte inferior menor
    new THREE.MeshLambertMaterial({
      color: "black", // Cor do sapato
      flatShading: true,
    })
  );
  leftLegShoe.position.set(0, 0, -1.25); // Ajuste de posição
  leftLeg.add(leftLegShoe);

  leftLeg.position.set(-4, 0, 5); // Posição abaixo do tronco
  leftLeg.castShadow = true;
  leftLeg.receiveShadow = true;
  player.add(leftLeg);

  // Perna direita
  const rightLeg = new THREE.Group();
  rightLeg.name = "leftLeg"; // Nome da perna esquerda para identificação

  // Parte superior da perna (calça)
  const rightLegPants = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 7.5), // Parte superior maior
    new THREE.MeshLambertMaterial({
      color: "blue", // Cor da calça
      flatShading: true,
    })
  );
  rightLegPants.position.set(0, 0, 3.75); // Ajuste de posição
  rightLeg.add(rightLegPants);

  // Parte inferior da perna (sapato)
  const rightLegShoe = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 2.5), // Parte inferior menor
    new THREE.MeshLambertMaterial({
      color: "black", // Cor do sapato
      flatShading: true,
    })
  );
  rightLegShoe.position.set(0, 0, -1.25); // Ajuste de posição
  rightLeg.add(rightLegShoe);

  rightLeg.position.set(4, 0, 5); // Posição abaixo do tronco
  rightLeg.castShadow = true;
  rightLeg.receiveShadow = true;
  player.add(rightLeg);

  const playerContainer = new THREE.Group();
  playerContainer.add(player);

  return playerContainer;
}

export const position = {
  currentRow: 0,
  currentTile: 0,
};

export const movesQueue = [];

export function initializePlayer() {
  // Initialize the Three.js player object
  player.position.x = 0;
  player.position.y = 0; // Posição original
  player.children[0].position.z = 0;

  // Initialize metadata
  position.currentRow = 0; // Linha inicial original
  position.currentTile = 0; // Centro do mapa original

  // Clear the moves queue
  movesQueue.length = 0;
}

export function queueMove(direction) {
  const isValidMove = endsUpInValidPosition(
    {
      rowIndex: position.currentRow,
      tileIndex: position.currentTile,
    },
    [...movesQueue, direction]
  );

  if (!isValidMove) return;

  movesQueue.push(direction);
}
export function queueJump() {

  // Verifica se o salto é válido (duas casas para frente)
  const isValidJump = endsUpInValidPosition(
    {
      rowIndex: position.currentRow,
      tileIndex: position.currentTile,
    },
    [...movesQueue, "jump"]
  );

  if (!isValidJump) return;

  movesQueue.push("jump");
}

export function stepCompleted() {
  const direction = movesQueue.shift();

  if (direction === "forward") position.currentRow += 1;
  if (direction === "backward") position.currentRow -= 1;
  if (direction === "left") position.currentTile -= 1;
  if (direction === "right") position.currentTile += 1;
  if (direction === "jump") position.currentRow += 2; // Salto para frente

  // Adiciona novas linhas se o jogador estiver perto do final
  if (position.currentRow > rows.length - 10) addRows();

  const scoreDOM = document.getElementById("score");
  if (scoreDOM) scoreDOM.innerText = position.currentRow.toString();
}