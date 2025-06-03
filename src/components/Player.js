const THREE = window.THREE;

import { endsUpInValidPosition } from "../utilities/endsUpInValidPosition";
import { metadata as rows, addRows } from "./Map";
import { tileSize } from "../constants"; // Adicione este import se ainda não existir
import { updateScoreHUD } from "../main_easy"; // ADICIONADO

export const player = Player();
export let isGameOver = false;
export function setGameOver(val) { 
  isGameOver = val;
  
  // Reset shield effects when game over state changes
  if (!val && player.userData) {
    // Keep shield if it was active (for revival)
    // Don't reset shield state here
  }
}

function Player() {
  const player = new THREE.Group();

  // Sombra como filho do player (fixa, não recalculada)
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(32, 18),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      opacity: 0.22,
      transparent: true,
      depthWrite: false,
    })
  );
  shadow.position.set(0, 0, 1.5); // Fixa sempre abaixo do boneco
  shadow.rotation.x = -Math.PI / 2;
  shadow.renderOrder = -1;
  shadow.name = "fixedShadow";
  player.add(shadow);

  // Cabeça (esfera)
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32),
    new THREE.MeshLambertMaterial({
      color: "peachpuff",
      flatShading: true,
    })
  );
  head.position.set(0, 0, 27); // Increased from 25 for better spacing
  head.rotation.x = 0;
  head.castShadow = true;
  head.receiveShadow = true;

  // Corpo (esfera maior)
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(7, 32, 32),
    new THREE.MeshLambertMaterial({
      color: "white",
      flatShading: true,
    })
  );
  body.position.set(0, 0, 16); // Increased from 15 for better spacing
  body.castShadow = true;
  body.receiveShadow = true;

  // Braço esquerdo
  const leftArm = new THREE.Group();
  leftArm.name = "leftArm";
  const leftArmShirt = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 3),
    new THREE.MeshLambertMaterial({
      color: "white",
      flatShading: true,
    })
  );
  leftArmShirt.name = "leftArmShirt";
  leftArmShirt.position.set(0, 0, 1.5);
  leftArm.add(leftArmShirt);
  const leftArmSkin = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 9),
    new THREE.MeshLambertMaterial({
      color: "peachpuff",
      flatShading: true,
    })
  );
  leftArmSkin.name = "leftArmSkin";
  leftArmSkin.position.set(0, 0, -4.5);
  leftArm.add(leftArmSkin);
  leftArm.position.set(-8, 0, 15);
  leftArm.castShadow = true;
  leftArm.receiveShadow = true;

  // Braço direito
  const rightArm = new THREE.Group();
  rightArm.name = "rightArm";
  const rightArmShirt = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 3),
    new THREE.MeshLambertMaterial({
      color: "white",
      flatShading: true,
    })
  );
  rightArmShirt.name = "rightArmShirt";
  rightArmShirt.position.set(0, 0, 1.5);
  rightArm.add(rightArmShirt);
  const rightArmSkin = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 9),
    new THREE.MeshLambertMaterial({
      color: "peachpuff",
      flatShading: true,
    })
  );
  rightArmSkin.name = "rightArmSkin";
  rightArmSkin.position.set(0, 0, -4.5);
  rightArm.add(rightArmSkin);
  rightArm.position.set(8, 0, 15);
  rightArm.castShadow = true;
  rightArm.receiveShadow = true;

  // Perna esquerda
  const leftLeg = new THREE.Group();
  leftLeg.name = "leftLeg";
  const leftLegPants = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 7.5),
    new THREE.MeshLambertMaterial({
      color: "blue",
      flatShading: true,
    })
  );
  leftLegPants.name = "leftLegPants";
  leftLegPants.position.set(0, 0, 3.75);
  leftLeg.add(leftLegPants);
  const leftLegShoe = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 2.5),
    new THREE.MeshLambertMaterial({
      color: "black",
      flatShading: true,
    })
  );
  leftLegShoe.name = "leftLegShoe";
  leftLegShoe.position.set(0, 0, -1.25);
  leftLeg.add(leftLegShoe);
  leftLeg.position.set(-4, 0, 5);
  leftLeg.castShadow = true;
  leftLeg.receiveShadow = true;

  // Perna direita
  const rightLeg = new THREE.Group();
  rightLeg.name = "rightLeg";
  const rightLegPants = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 7.5),
    new THREE.MeshLambertMaterial({
      color: "blue",
      flatShading: true,
    })
  );
  rightLegPants.name = "rightLegPants";
  rightLegPants.position.set(0, 0, 3.75);
  rightLeg.add(rightLegPants);
  const rightLegShoe = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 2.5),
    new THREE.MeshLambertMaterial({
      color: "black",
      flatShading: true,
    })
  );
  rightLegShoe.name = "rightLegShoe";
  rightLegShoe.position.set(0, 0, -1.25);
  rightLeg.add(rightLegShoe);
  rightLeg.position.set(4, 0, 5);
  rightLeg.castShadow = true;
  rightLeg.receiveShadow = true;

  // Adiciona na ordem correta (sem sombra)
  player.add(head);
  player.add(body);
  player.add(leftArm);
  player.add(rightArm);
  player.add(leftLeg);
  player.add(rightLeg);

  // Referências diretas para animação
  player.head = head;
  player.body = body;
  player.leftArm = leftArm;
  player.rightArm = rightArm;
  player.leftLeg = leftLeg;
  player.rightLeg = rightLeg;

  return player;
}

// Skins disponíveis (pode expandir depois)
export const playerSkins = [
  {
    name: "Classic",
    shirt: "white",
    pants: "blue",
    skin: "peachpuff",
  },
  {
    name: "Red",
    shirt: "#e53935",
    pants: "#222",
    skin: "#fddbb0",
  },
  {
    name: "Neon Green",
    shirt: "#43a047",
    pants: "#222",
    skin: "#ffe0b2",
  },
  {
    name: "Pixel Blue",
    shirt: "#1976d2",
    pants: "#90caf9",
    skin: "#ffe0b2",
  },
];

// Estado atual do skin
let currentSkin = { ...playerSkins[0] };

// Funções para guardar/obter índice da skin escolhida
function getSelectedSkinIndex() {
  const idx = localStorage.getItem("selectedSkinIndex");
  return idx !== null ? parseInt(idx, 10) : 0;
}
function setSelectedSkinIndex(idx) {
  localStorage.setItem("selectedSkinIndex", String(idx));
}

// Função para aplicar skin ao modelo do jogador
export function setPlayerSkin(skinOrIndex) {
  let idx = -1;
  let skin;
  if (typeof skinOrIndex === "number") {
    idx = skinOrIndex;
    skin = playerSkins[idx];
  } else {
    skin = skinOrIndex;
    idx = playerSkins.findIndex(s => s.name === skin.name);
  }
  if (!skin) skin = playerSkins[0];
  if (idx < 0) idx = 0;
  currentSkin = { ...skin };
  setSelectedSkinIndex(idx);

  // player.children[0] = shadow, [1] = head, [2] = body, [3] = leftArm, [4] = rightArm, [5] = leftLeg, [6] = rightLeg

  // Cabeça
  player.children[1].material.color.set(currentSkin.skin);
  player.children[1].rotation.x = 0;

  // Corpo
  player.children[2].material.color.set(currentSkin.shirt);

  // Braço esquerdo
  const leftArm = player.children[3];
  leftArm.children[0].material.color.set(currentSkin.shirt);
  leftArm.children[1].material.color.set(currentSkin.skin);

  // Braço direito
  const rightArm = player.children[4];
  rightArm.children[0].material.color.set(currentSkin.shirt);
  rightArm.children[1].material.color.set(currentSkin.skin);

  // Perna esquerda
  const leftLeg = player.children[5];
  leftLeg.children[0].material.color.set(currentSkin.pants);
  leftLeg.children[1].material.color.set("black");

  // Perna direita
  const rightLeg = player.children[6];
  rightLeg.children[0].material.color.set(currentSkin.pants);
  rightLeg.children[1].material.color.set("black");
}

export const position = {
  currentRow: -1, // Começa na linha imediatamente anterior à linha de partida
  currentTile: 0,
};

export const movesQueue = [];

export function initializePlayer() {
  player.position.x = 0;
  player.position.y = -1 * tileSize; // Linha imediatamente anterior à linha de partida

  // Initialize metadata
  position.currentRow = -1; // Linha inicial é a anterior à linha de partida
  position.currentTile = 0; // Centro do mapa original

  // Clear the moves queue
  movesQueue.length = 0;
  isGameOver = false;
  // Ao inicializar, aplica sempre a skin guardada
  const idx = getSelectedSkinIndex();
  setPlayerSkin(idx);
  
  // Initialize shield state
  player.userData = { 
    hasShield: false, 
    shieldActive: false,
    visualRotation: 0,
    visualGroup: null
  };
}

export function queueMove(direction) {
  if (isGameOver) return;
  // Bloqueia qualquer movimento na linha de partida enquanto overlay está ativo
  if (
    typeof window.isStartOverlayActive === "function" &&
    window.isStartOverlayActive() &&
    position.currentRow === 0
  ) {
    return;
  }

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
  if (isGameOver) return;
  if (position.currentRow < 0) return; // já bloqueia salto no verde
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

  // Atualiza o HUD da pontuação principal (que agora também verifica bônus)
  if (typeof updateScoreHUD === "function") {
    updateScoreHUD(position.currentRow >= 0 ? position.currentRow : 0);
  }

}

export function createPlayerPreviewModel(skin) {
  const group = new THREE.Group();

  // Cabeça
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32),
    new THREE.MeshLambertMaterial({ color: skin.skin, flatShading: true })
  );
  head.position.set(0, 0, 25);

  // Corpo
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(7, 32, 32),
    new THREE.MeshLambertMaterial({ color: skin.shirt, flatShading: true })
  );
  body.position.set(0, 0, 15);

  // Braço esquerdo
  const leftArm = new THREE.Group();
  const leftArmShirt = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 3),
    new THREE.MeshLambertMaterial({ color: skin.shirt, flatShading: true })
  );
  leftArmShirt.position.set(0, 0, 1.5);
  leftArm.add(leftArmShirt);
  const leftArmSkin = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 9),
    new THREE.MeshLambertMaterial({ color: skin.skin, flatShading: true })
  );
  leftArmSkin.position.set(0, 0, -4.5);
  leftArm.add(leftArmSkin);
  leftArm.position.set(-8, 0, 15);

  // Braço direito
  const rightArm = new THREE.Group();
  const rightArmShirt = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 3),
    new THREE.MeshLambertMaterial({ color: skin.shirt, flatShading: true })
  );
  rightArmShirt.position.set(0, 0, 1.5);
  rightArm.add(rightArmShirt);
  const rightArmSkin = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 9),
    new THREE.MeshLambertMaterial({ color: skin.skin, flatShading: true })
  );
  rightArmSkin.position.set(0, 0, -4.5);
  rightArm.add(rightArmSkin);
  rightArm.position.set(8, 0, 15);

  // Perna esquerda
  const leftLeg = new THREE.Group();
  const leftLegPants = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 7.5),
    new THREE.MeshLambertMaterial({ color: skin.pants, flatShading: true })
  );
  leftLegPants.position.set(0, 0, 3.75);
  leftLeg.add(leftLegPants);
  const leftLegShoe = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 2.5),
    new THREE.MeshLambertMaterial({ color: "black", flatShading: true })
  );
  leftLegShoe.position.set(0, 0, -1.25);
  leftLeg.add(leftLegShoe);
  leftLeg.position.set(-4, 0, 5);

  // Perna direita
  const rightLeg = new THREE.Group();
  const rightLegPants = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 7.5),
    new THREE.MeshLambertMaterial({ color: skin.pants, flatShading: true })
  );
  rightLegPants.position.set(0, 0, 3.75);
  rightLeg.add(rightLegPants);
  const rightLegShoe = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 2.5),
    new THREE.MeshLambertMaterial({ color: "black", flatShading: true })
  );
  rightLegShoe.position.set(0, 0, -1.25);
  rightLeg.add(rightLegShoe);
  rightLeg.position.set(4, 0, 5);

  group.add(head, body, leftArm, rightArm, leftLeg, rightLeg);
  return group;
}