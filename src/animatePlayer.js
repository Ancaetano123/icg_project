import * as THREE from "three";
import {
  player,
  position,
  movesQueue,
  stepCompleted,
} from "./components/Player";
import { tileSize } from "./constants";
import { metadata as rows } from "./components/Map";

const moveClock = new THREE.Clock(false);
let jumpCount = 0;
let hasStarPower = false;
let dashCooldown = false;

export let powerUpEffects = {
  mushroom: false,
  star: false,
  flower: 0,
};

export function animatePlayer() {
  if (!movesQueue.length) return;

  if (!moveClock.running) moveClock.start();

  const stepTime = movesQueue[0] === "jump" ? 0.4 : 0.2;
  const progress = Math.min(1, moveClock.getElapsedTime() / stepTime);

  handleSpecialAbilities(progress);
  setPosition(progress);
  setRotation(progress);
  animateLimbs(progress);

  if (progress >= 1) {
    checkPowerUpCollision(); // Verifica se o jogador coletou um power-up
    stepCompleted();
    moveClock.stop();
    if (movesQueue[0] === "jump") jumpCount = 0;
  }
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
  let endRotation = 0;
  if (movesQueue[0] == "forward") endRotation = 0;
  if (movesQueue[0] == "left") endRotation = Math.PI / 2;
  if (movesQueue[0] == "right") endRotation = -Math.PI / 2;
  if (movesQueue[0] == "backward") endRotation = Math.PI;

  player.children[0].rotation.z = THREE.MathUtils.lerp(
    player.children[0].rotation.z,
    endRotation,
    progress
  );
}

function animateLimbs(progress) {
  const leftArm = player.children[0]?.children.find((child) => child.name === "leftArm");
  const rightArm = player.children[0]?.children.find((child) => child.name === "rightArm");
  const leftLeg = player.children[0]?.children.find((child) => child.name === "leftLeg");
  const rightLeg = player.children[0]?.children.find((child) => child.name === "rightLeg");

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