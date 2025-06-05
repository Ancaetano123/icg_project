import * as THREE from "three";
import {
  player,
  position,
  movesQueue,
  stepCompleted,
} from "./components/Player";
import { tileSize } from "./constants";
import { metadata as rows } from "./components/Map";
import { addRows } from "./components/Map";

const moveClock = new THREE.Clock(false);
let teleporting = false;
window.isTeleporting = (val) => {
  if (typeof val === "boolean") teleporting = val;
  return teleporting;
};

export function animatePlayer() {
  if (!teleporting) {
    checkPortalCollision();
  }

  if (teleporting) return;

  if (!movesQueue.length) {
    return;
  }

  if (!moveClock.running) moveClock.start();

  let targetRow = position.currentRow;
  if (movesQueue[0] === "forward") targetRow += 1;
  if (movesQueue[0] === "backward") targetRow -= 1;
  if (movesQueue[0] === "jump") targetRow += 2;

  let stepTime;
  if (position.currentRow < 0 || targetRow < 0) {
    stepTime = movesQueue[0] === "jump" ? 0.65 : 0.38;
  } else {
    stepTime = movesQueue[0] === "jump" ? 0.4 : 0.18;
  }
  const progress = Math.min(1, moveClock.getElapsedTime() / stepTime);

  setPosition(progress);
  setRotation(progress);
  animateLimbs(progress);

  // Durante o salto, verifica colisão na linha intermédia
  if (
    movesQueue[0] === "jump" &&
    progress > 0.45 && progress < 0.55
  ) {
    if (checkVehicleCollisionOnMidJump()) {
      showGameOver();
      return;
    }
  }

  if (progress >= 1) {
    checkPortalCollision();
    if (movesQueue[0] === "jump" && checkVehicleCollisionOnJump()) {
      showGameOver();
      return;
    }
    stepCompleted();
    moveClock.stop();
  }
}

// Colisão com veículos na linha intermédia do salto
function checkVehicleCollisionOnMidJump() {
  if (player.userData.hasShield && player.userData.shieldActive) {
    return false;
  }
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

// Colisão com veículos ao completar salto
function checkVehicleCollisionOnJump() {
  if (player.userData.hasShield && player.userData.shieldActive) {
    return false;
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

function setPosition(progress) {
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

  // Salto parabólico
  if (movesQueue[0] === "jump") {
    const h = 10;
    player.position.z = -4 * h * Math.pow(progress - 0.5, 2) + h;
    if (player.children[0]) player.children[0].position.z = 0;
  } else {
    player.position.z = 0;
    if (player.children[0]) player.children[0].position.z = 0;
  }
}

function setRotation(progress) {
  let startRotation = player.userData.visualRotation ?? 0;
  let endRotation = 0;
  if (movesQueue[0] == "forward") endRotation = 0;
  if (movesQueue[0] == "left") endRotation = Math.PI / 2;
  if (movesQueue[0] == "right") endRotation = -Math.PI / 2;
  if (movesQueue[0] == "backward") endRotation = Math.PI;

  if (!player.userData.visualGroup) {
    const visualGroup = new THREE.Group();
    while (player.children.length > 1) {
      visualGroup.add(player.children[1]);
    }
    player.add(visualGroup);
    player.userData.visualGroup = visualGroup;
  }
  const visualGroup = player.userData.visualGroup;

  if (Math.abs(endRotation - startRotation) > Math.PI) {
    visualGroup.rotation.z = endRotation;
    player.userData.visualRotation = endRotation;
  } else {
    visualGroup.rotation.z = THREE.MathUtils.lerp(startRotation, endRotation, progress);
    player.userData.visualRotation = visualGroup.rotation.z;
  }

  if (player.head) {
    player.head.rotation.x = 0;
    player.head.rotation.z = 0;
  } else if (visualGroup.children[0]) {
    visualGroup.children[0].rotation.x = 0;
    visualGroup.children[0].rotation.z = 0;
  }
}

function animateLimbs(progress) {
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

function showGameOver() {
  import("./components/Player").then(({ setGameOver }) => {
    setGameOver(true);
  });
  if (typeof window.showGameOverScreen === "function") {
    window.showGameOverScreen();
  }
}

// Função global para poderes especiais (rocket)
export function movePlayer(tiles) {
  position.currentRow += tiles;
  player.position.y = position.currentRow * tileSize;
  if (typeof window.updateScoreHUD === "function") {
    window.updateScoreHUD(position.currentRow >= 0 ? position.currentRow : 0);
  }
}
window.movePlayer = movePlayer;

// Colisão com portal
function checkPortalCollision() {
  const row = rows[position.currentRow - 1];
  if (!row || !row.portal || !row.portal.ref) return;

  const portalObj = row.portal.ref;
  const torus = portalObj.userData.torus;
  if (!torus) return;

  const playerBoundingBox = new THREE.Box3().setFromObject(player);
  const portalBoundingBox = new THREE.Box3().setFromObject(torus);

  if (!playerBoundingBox.intersectsBox(portalBoundingBox)) return;

  teleporting = true;
  if (typeof window.isTeleporting === "function") window.isTeleporting(true);

  if (typeof window.showPortalTeleportEffect === "function") {
    window.showPortalTeleportEffect(1500);
  }

  if (row.portal.ref.parent) row.portal.ref.parent.remove(row.portal.ref);
  row.portal.ref = null;

  const originalRow = position.currentRow;
  const originalTile = position.currentTile;

  const direction = row.portal.direction;
  const offset = row.portal.offset;
  let targetRow = direction === "forward"
    ? position.currentRow + offset
    : position.currentRow - offset;
  if (targetRow < 1) targetRow = 1;

  const newTile = portalObj.position.x / tileSize;

  function findNearestDifferentForestRow(startRow, dir, currentRow) {
    let idx = startRow - 1;
    while (idx >= 0 && idx < rows.length) {
      const rowIndex = idx + 1;
      if (rowIndex === currentRow) {
        idx += dir;
        continue;
      }
      const r = rows[idx];
      if (r && r.type === "forest") {
        const blocked = r.plants.some(
          (plant) =>
            (plant.type === "tree" ||
              plant.type === "bush" ||
              plant.type === "flower") &&
            plant.tileIndex === newTile
        );
        if (!blocked) return rowIndex;
      }
      idx += dir;
    }
    return null;
  }

  while (!rows[targetRow - 1]) {
    addRows();
  }

  let forestRow = null;
  if (targetRow !== originalRow && rows[targetRow - 1] && rows[targetRow - 1].type === "forest") {
    const blocked = rows[targetRow - 1].plants.some(
      (plant) =>
        (plant.type === "tree" ||
          plant.type === "bush" ||
          plant.type === "flower") &&
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

  setTimeout(() => {
    if (!forestRow || forestRow === originalRow) {
      teleporting = false;
      if (typeof window.isTeleporting === "function") window.isTeleporting(false);
      if (typeof window.showPortalTeleportEffect === "function") {
        window.showPortalTeleportEffect(0);
      }
      return;
    }
    position.currentRow = forestRow;
    position.currentTile = newTile;
    player.position.x = position.currentTile * tileSize;
    player.position.y = position.currentRow * tileSize;
    if (typeof window.updateScoreHUD === "function") {
      window.updateScoreHUD(position.currentRow);
    }
    if (typeof window.checkMilestoneBonusesAfterTeleport === "function") {
      window.checkMilestoneBonusesAfterTeleport();
    }
    teleporting = false;
    if (typeof window.isTeleporting === "function") window.isTeleporting(false);
    if (typeof window.showPortalTeleportEffect === "function") {
      window.showPortalTeleportEffect(0);
    }
  }, 1500);
}

function activateRevivalShield(player, scene, duration = 3000) {
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
    if (!shield.parent) return;
    shield.rotation.x += 0.1;
    shield.rotation.y += 0.1;
    shield.rotation.z += 0.1;
    requestAnimationFrame(animateShield);
  }

  setTimeout(() => {
    scene.remove(shield);
    player.userData.hasShield = false;
    player.userData.shieldActive = false;
    console.log("Revival shield deactivated");
  }, duration);

  animateShield();
  console.log(`Revival shield activated for ${duration/1000} seconds`);
}