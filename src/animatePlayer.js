const THREE = window.THREE;
// import * as THREE from "three";
import {
  player,
  position,
  movesQueue,
  stepCompleted,
} from "./components/Player";
import { tileSize, minTileIndex, maxTileIndex } from "./constants";
import { metadata as rows } from "./components/Map";
import { addRows } from "./components/Map"; // ADICIONADO

const moveClock = new THREE.Clock(false);
let jumpCount = 0;
let hasStarPower = false;
let dashCooldown = false;
let coinScore = 0; // NOVO: score de moedas

export let powerUpEffects = {
  mushroom: false,
  star: false,
  flower: 0,
};

let teleporting = false; // NOVO: flag para bloquear input e movimento durante teletransporte
window.isTeleporting = (val) => {
  if (typeof val === "boolean") teleporting = val;
  return teleporting;
};

export function animatePlayer() {
  // --- Removido: verifica colisão com portal plasma azul (CityPortal) ---
  if (!teleporting) {
    // Removido: if (checkCityPortalCollision()) return;
    checkPortalCollision();
  }

  if (teleporting) return; // Bloqueia animação/movimento durante teletransporte

  if (!movesQueue.length) {
    return;
  }

  if (!moveClock.running) moveClock.start();

  // Calcule a linha de destino do movimento
  let targetRow = position.currentRow;
  if (movesQueue[0] === "forward") targetRow += 1;
  if (movesQueue[0] === "backward") targetRow -= 1;
  if (movesQueue[0] === "jump") targetRow += 2;

  // Um pouco mais rápido no verde (-1), normal no resto
  let stepTime;
  if (position.currentRow < 0 || targetRow < 0) {
    stepTime = movesQueue[0] === "jump" ? 0.65 : 0.38; // Verde: mais rápido que antes, mas ainda mais lento que o resto
  } else {
    stepTime = movesQueue[0] === "jump" ? 0.4 : 0.18; // Normal no jogo
  }
  const progress = Math.min(1, moveClock.getElapsedTime() / stepTime);

  handleSpecialAbilities(progress);
  setPosition(progress);
  setRotation(progress);
  animateLimbs(progress);

  // NOVO: durante o salto, verifica colisão na linha intermediária
  if (
    movesQueue[0] === "jump" &&
    progress > 0.45 && progress < 0.55 // Aproximadamente no meio do salto
  ) {
    if (checkVehicleCollisionOnMidJump()) {
      showGameOver();
      return;
    }
  }

  if (progress >= 1) {
    checkPowerUpCollision(); // Verifica se o jogador coletou um power-up

    // --- NOVO: verifica colisão com portal ---
    checkPortalCollision();

    // Se completou um salto, checa colisão com veículos na linha de chegada
    if (movesQueue[0] === "jump" && checkVehicleCollisionOnJump()) {
      showGameOver();
      return;
    }

    stepCompleted();
    moveClock.stop();
    if (movesQueue[0] === "jump") jumpCount = 0;
  }
}

// NOVA FUNÇÃO: checa colisão com veículos na linha intermediária do salto
function checkVehicleCollisionOnMidJump() {
  // Check if player has active shield protection
  if (player.userData.hasShield && player.userData.shieldActive) {
    return false; // Shield blocks collision
  }

  // Linha intermediária do salto
  const midRow = position.currentRow + 1;
  const row = rows[midRow - 1];
  if (!row) return false;
  if (row.type === "car" || row.type === "truck") {
    const playerBoundingBox = new THREE.Box3().setFromObject(player);
    for (const { ref } of row.vehicles) {
      if (!ref) continue;
      const vehicleBoundingBox = new THREE.Box3().setFromObject(ref);
      if (playerBoundingBox.intersectsBox(vehicleBoundingBox)) {
        return true;
      }
    }
  }
  return false;
}

function checkPowerUpCollision() {
  const row = rows[position.currentRow - 1];
  if (!row || !row.powerUps) return;

  row.powerUps = row.powerUps.filter(({ ref, type }) => {
    const playerBoundingBox = new THREE.Box3().setFromObject(player);
    const powerUpBoundingBox = new THREE.Box3().setFromObject(ref);

    if (playerBoundingBox.intersectsBox(powerUpBoundingBox)) {
      applyPowerUpEffect(type); // Aplica o efeito do power-up
      return false; // Remove o power-up da lista
    }
    return true;
  });
}

// NOVA FUNÇÃO: checa colisão com veículos ao completar salto
function checkVehicleCollisionOnJump() {
  // Check if player has active shield protection
  if (player.userData.hasShield && player.userData.shieldActive) {
    return false; // Shield blocks collision
  }

  const row = rows[position.currentRow - 1];
  if (!row) return false;
  if (row.type === "car" || row.type === "truck") {
    const playerBoundingBox = new THREE.Box3().setFromObject(player);
    for (const { ref } of row.vehicles) {
      if (!ref) continue;
      const vehicleBoundingBox = new THREE.Box3().setFromObject(ref);
      if (playerBoundingBox.intersectsBox(vehicleBoundingBox)) {
        return true;
      }
    }
  }
  return false;
}

function applyPowerUpEffect(type) {
  if (type === "mushroom") {
    powerUpEffects.mushroom = true;
    setTimeout(() => (powerUpEffects.mushroom = false), 5000); // Dura 5 segundos
  }
  if (type === "star") {
    powerUpEffects.star = true;
    setTimeout(() => (powerUpEffects.star = false), 5000); // Dura 5 segundos
  }
  if (type === "flower") {
    powerUpEffects.flower += 3; // Adiciona 3 ataques
  }

  updatePowerUpHUD(); // Atualiza o HUD
}

function handleSpecialAbilities(progress) {
  if (powerUpEffects.star) {
    player.children[0].material.color.setHex(0xffff00); // Amarelo
  }

  if (movesQueue[0] === "dash" && !dashCooldown) {
    player.position.x += movesQueue[0] === "left" ? -tileSize * 2 : tileSize * 2;
    dashCooldown = true;
    setTimeout(() => (dashCooldown = false), 1000);
  }
}

function setPosition(progress) {
  // Sempre calcula a posição baseada em tileSize, igual para todas as linhas
  const startX = position.currentTile * tileSize;
  const startY = position.currentRow * tileSize;
  let endX = startX;
  let endY = startY;

  if (movesQueue[0] === "left") endX -= tileSize;
  if (movesQueue[0] === "right") endX += tileSize;
  if (movesQueue[0] === "forward") endY += tileSize;
  if (movesQueue[0] === "backward") endY -= tileSize;
  if (movesQueue[0] === "jump") endY += tileSize * 2;

  player.position.x = THREE.MathUtils.lerp(startX, endX, progress);
  player.position.y = THREE.MathUtils.lerp(startY, endY, progress);
  player.children[0].position.z =
    movesQueue[0] === "jump"
      ? Math.sin(progress * Math.PI) * 10
      : 0;
}

function setRotation(progress) {
  // Gira apenas o boneco (não a sombra) para a direção do movimento
  let startRotation = player.userData.visualRotation ?? 0;
  let endRotation = 0;
  if (movesQueue[0] == "forward") endRotation = 0;
  if (movesQueue[0] == "left") endRotation = Math.PI / 2;
  if (movesQueue[0] == "right") endRotation = -Math.PI / 2;
  if (movesQueue[0] == "backward") endRotation = Math.PI;

  // Cria um grupo visual para o boneco se ainda não existir
  if (!player.userData.visualGroup) {
    const visualGroup = new THREE.Group();
    // Move todos os filhos exceto a sombra (children[0]) para o grupo visual
    // Só move children[1] em diante!
    while (player.children.length > 1) {
      visualGroup.add(player.children[1]);
    }
    player.add(visualGroup);
    player.userData.visualGroup = visualGroup;
  }
  const visualGroup = player.userData.visualGroup;

  // Interpola a rotação do grupo visual (boneco), sombra fica fixa
  if (Math.abs(endRotation - startRotation) > Math.PI) {
    visualGroup.rotation.z = endRotation;
    player.userData.visualRotation = endRotation;
  } else {
    visualGroup.rotation.z = THREE.MathUtils.lerp(startRotation, endRotation, progress);
    player.userData.visualRotation = visualGroup.rotation.z;
  }

  // Mantém a cabeça sempre para cima (sem rodar no eixo X)
  if (player.head) {
    player.head.rotation.x = 0;
    player.head.rotation.z = 0;
  } else if (visualGroup.children[0]) {
    visualGroup.children[0].rotation.x = 0;
    visualGroup.children[0].rotation.z = 0;
  }
}

function animateLimbs(progress) {
  // Use referências diretas do player
  const leftArm = player.leftArm;
  const rightArm = player.rightArm;
  const leftLeg = player.leftLeg;
  const rightLeg = player.rightLeg;

  if (leftArm && rightArm && leftLeg && rightLeg) {
    const angle = Math.sin(progress * Math.PI * 2) * 0.5;
    if (movesQueue[0] !== "jump") {
      leftArm.rotation.x = -angle;
      rightArm.rotation.x = angle;
      leftLeg.rotation.x = angle;
      rightLeg.rotation.x = -angle;
    } else {
      leftArm.rotation.x = 0;
      rightArm.rotation.x = 0;
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
    }
  }
}

function updatePowerUpHUD() {
  const mushroomDOM = document.getElementById("mushroom");
  const starDOM = document.getElementById("star");
  const flowerDOM = document.getElementById("flower");

  if (mushroomDOM) mushroomDOM.innerText = `🍄: ${powerUpEffects.mushroom ? "ON" : "OFF"}`;
  if (starDOM) starDOM.innerText = `⭐: ${powerUpEffects.star ? "ON" : "OFF"}`;
  if (flowerDOM) flowerDOM.innerText = `🌸: ${powerUpEffects.flower}`;
}

function showGameOver() {
  // Set game over state first
  import("./components/Player").then(({ setGameOver }) => {
    setGameOver(true);
  });
  
  // Remove the game loop stopping logic
  
  // Chama a função global de game over que salva as moedas
  if (typeof window.showGameOverScreen === "function") {
    window.showGameOverScreen();
  }
}

// Expose movePlayer function for superpowers
export function movePlayer(tiles) {
  position.currentRow += tiles;
  player.position.y = position.currentRow * tileSize;
  
  // Update score HUD
  if (typeof window.updateScoreHUD === "function") {
    window.updateScoreHUD(position.currentRow >= 0 ? position.currentRow : 0);
  }
}

// Make movePlayer available globally for superpowers
window.movePlayer = movePlayer;

// NOVA FUNÇÃO: checa colisão com portal
function checkPortalCollision() {
  const row = rows[position.currentRow - 1];
  if (!row || !row.portal || !row.portal.ref) return;

  // Checa colisão real com o arco do portal (torus)
  const portalObj = row.portal.ref;
  const torus = portalObj.userData.torus;
  if (!torus) return;

  // Bounding box do jogador
  const playerBoundingBox = new THREE.Box3().setFromObject(player);
  // Bounding box do arco do portal
  const portalBoundingBox = new THREE.Box3().setFromObject(torus);

  // Se colidiu com o arco, inicia o teletransporte (mas só faz depois do efeito)
  if (!playerBoundingBox.intersectsBox(portalBoundingBox)) return;

  // Bloqueia input e animação
  teleporting = true;
  if (typeof window.isTeleporting === "function") window.isTeleporting(true);

  // Mostra efeito visual PRIMEIRO (antes do teletransporte)
  if (typeof window.showPortalTeleportEffect === "function") {
    window.showPortalTeleportEffect(1500); // Dura 1.5s
  }

  // Remove o portal visualmente e da metadata imediatamente
  if (row.portal.ref.parent) row.portal.ref.parent.remove(row.portal.ref);
  row.portal.ref = null;

  // Guarda posição original antes do teletransporte
  const originalRow = position.currentRow;
  const originalTile = position.currentTile;

  // Calcula destino inicial
  const direction = row.portal.direction;
  const offset = row.portal.offset;
  let targetRow = direction === "forward"
    ? position.currentRow + offset
    : position.currentRow - offset;
  if (targetRow < 1) targetRow = 1;

  // Atualiza também o tile para o tile do portal
  const newTile = portalObj.position.x / tileSize;

  // --- NOVO: encontra a linha de floresta mais próxima que seja DIFERENTE da atual ---
  function findNearestDifferentForestRow(startRow, dir, currentRow) {
    let idx = startRow - 1;
    while (idx >= 0 && idx < rows.length) {
      const rowIndex = idx + 1;
      // Skip if it's the same row as current position
      if (rowIndex === currentRow) {
        idx += dir;
        continue;
      }
      const r = rows[idx];
      if (r && r.type === "forest") {
        // Verifica se o tile está livre
        const blocked = r.plants.some(
          (plant) =>
            (plant.type === "tree" ||
              plant.type === "bush" ||
              plant.type === "flower" ||
              plant.type === "star") &&
            plant.tileIndex === newTile
        );
        if (!blocked) return rowIndex; // rowIndex é idx+1
      }
      idx += dir;
    }
    return null;
  }

  // Garante que a row de destino existe (cria se necessário)
  while (!rows[targetRow - 1]) {
    addRows();
  }

  // Procura uma linha de floresta válida que seja DIFERENTE da atual
  let forestRow = null;
  if (targetRow !== originalRow && rows[targetRow - 1] && rows[targetRow - 1].type === "forest") {
    const blocked = rows[targetRow - 1].plants.some(
      (plant) =>
        (plant.type === "tree" ||
          plant.type === "bush" ||
          plant.type === "flower" ||
          plant.type === "star") &&
        plant.tileIndex === newTile
    );
    if (!blocked) forestRow = targetRow;
  }
  if (!forestRow) {
    const dir = direction === "forward" ? 1 : -1;
    forestRow = findNearestDifferentForestRow(targetRow, dir, originalRow);
  }
  if (!forestRow) {
    const oppositeDir = direction === "forward" ? -1 : 1;
    forestRow = findNearestDifferentForestRow(targetRow, oppositeDir, originalRow);
  }

  // Aguarda o efeito do portal ANTES de teletransportar
  setTimeout(() => {
    // Se não encontrou linha de floresta válida DIFERENTE, cancela teletransporte
    if (!forestRow || forestRow === originalRow) {
      teleporting = false;
      if (typeof window.isTeleporting === "function") window.isTeleporting(false);
      if (typeof window.showPortalTeleportEffect === "function") {
        window.showPortalTeleportEffect(0);
      }
      return;
    }

    // --- TELEPORTA O JOGADOR IMEDIATAMENTE PARA A FLORESTA VÁLIDA E DIFERENTE ---
    position.currentRow = forestRow;
    position.currentTile = newTile;
    player.position.x = position.currentTile * tileSize;
    player.position.y = position.currentRow * tileSize;

    // Atualiza HUD da pontuação (que verifica bônus automaticamente)
    if (typeof window.updateScoreHUD === "function") {
      window.updateScoreHUD(position.currentRow);
    }

    // NOVO: Garante bônus de moedas após teletransporte
    if (typeof window.checkMilestoneBonusesAfterTeleport === "function") {
      window.checkMilestoneBonusesAfterTeleport();
    }

    // Libera input e remove efeito visual
    teleporting = false;
    if (typeof window.isTeleporting === "function") window.isTeleporting(false);
    if (typeof window.showPortalTeleportEffect === "function") {
      window.showPortalTeleportEffect(0);
    }
  }, 1500); // Aguarda 1.5s para o efeito antes de teletransportar
}

// NOVA FUNÇÃO: checa colisão com o portal plasma azul (CityPortal)
// function checkCityPortalCollision() {
//   // O portal plasma azul está sempre na linha -1, tile -2
//   const row = rows[-1 + 10]; // greenLines = 10, então rowIndex -1 é o 9º elemento
//   if (!row) return false;
//   // Procura o CityPortal na árvore de objetos da linha
//   let cityPortalObj = null;
//   if (window.__cityPortalObj) {
//     cityPortalObj = window.__cityPortalObj;
//   } else {
//     // Busca manualmente se não estiver em window
//     if (row.children) {
//       for (const child of row.children) {
//         if (child.userData && child.userData.isCityPortal) {
//           cityPortalObj = child;
//           break;
//         }
//       }
//     }
//   }
//   if (!cityPortalObj) return false;
//   // O mesh do plasma animado está em cityPortalObj.children (CircleGeometry)
//   const plasmaMesh = cityPortalObj.children?.find(
//     (obj) => obj.geometry && obj.geometry.type === "CircleGeometry"
//   );
//   if (!plasmaMesh) return false;

//   // Bounding box do jogador
//   const playerBoundingBox = new THREE.Box3().setFromObject(player);
//   // Bounding box do plasma azul
//   const portalBoundingBox = new THREE.Box3().setFromObject(plasmaMesh);

//   if (!playerBoundingBox.intersectsBox(portalBoundingBox)) return false;

//   // --- Entrou no portal plasma azul: vai para a cidade! ---
//   // Efeito visual opcional (pode usar o mesmo do portal normal)
//   if (typeof window.showPortalTeleportEffect === "function") {
//     window.showPortalTeleportEffect(1200);
//   }
//   setTimeout(() => {
//     window.location.href = "/city.html";
//   }, 1200); // Aguarda o efeito antes de redirecionar

//   // Bloqueia input e animação imediatamente
//   teleporting = true;
//   if (typeof window.isTeleporting === "function") window.isTeleporting(true);

//   return true; // Para a animação
// }

function activateRevivalShield(player, scene, duration = 3000) {
  // Create a visual shield around the player
  const shieldGeometry = new THREE.SphereGeometry(1.2, 32, 32);
  const shieldMaterial = new THREE.MeshBasicMaterial({
    color: 0x0077ff,
    transparent: true,
    opacity: 0.5,
  });
  const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
  shield.name = "revivalShield";
  player.add(shield);

  player.userData.hasShield = true;
  player.userData.shieldActive = true;

  function animateShield() {
    if (!shield.parent) return; // Stop if shield is removed
    shield.rotation.x += 0.1;
    shield.rotation.y += 0.1;
    shield.rotation.z += 0.1;
    requestAnimationFrame(animateShield);
  }

  setTimeout(() => {
    // Remove shield
    scene.remove(shield);
    player.userData.hasShield = false;
    player.userData.shieldActive = false;
    console.log("Revival shield deactivated");
  }, duration);

  animateShield();
  console.log(`Revival shield activated for ${duration/1000} seconds`);
}