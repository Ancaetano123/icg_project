const THREE = window.THREE;
// import * as THREE from "three";
import { metadata as rows } from "./components/Map";
import { player, position } from "./components/Player";
import { setCoinProbability } from "./utilities/generateRows";

let coinScore = 0;
let bonus100Given = false;
let bonus200Given = false;
export let coinProbability = 0.6; // Reduzido de 0.8 para 0.6 para compensar mais portais

let currentDifficulty = 0; // 0 = normal, 1 = 100+, 2 = 200+

export function coinCatch() {
  // Checa e ajusta dificuldade conforme a posição do jogador
  updateDifficulty();

  const row = rows[position.currentRow - 1];
  if (!row || !row.coin || !row.coin.ref) return;

  const coinObj = row.coin.ref;

  // Check if coin still exists in scene (might have been collected by magnet)
  if (!coinObj.parent) {
    row.coin.ref = null;
    return;
  }

  // Centro da moeda (centro geométrico)
  const coinWorldPos = new THREE.Vector3();
  coinObj.getWorldPosition(coinWorldPos);

  // Centro do jogador (bounding box center)
  const playerWorldPos = new THREE.Vector3();
  player.getWorldPosition(playerWorldPos);

  // Calculate 2D distance for consistent collision detection
  const dx = coinWorldPos.x - playerWorldPos.x;
  const dy = coinWorldPos.y - playerWorldPos.y;
  const dist2D = Math.sqrt(dx * dx + dy * dy);

  // Collection radius
  const collectionRadius = 35;

  if (dist2D < collectionRadius) {
    // Usa a função global de coletar moeda
    if (typeof window.collectCoin === "function") {
      window.collectCoin();
    }
    if (coinObj.parent) coinObj.parent.remove(coinObj);
    row.coin.ref = null;
    console.log("Regular collection!");
  }
}

// Função para aumentar ou resetar a velocidade dos carros/trucks
function setCarSpeed(multiplier) {
  import("./components/Map").then(({ metadata }) => {
    for (const row of metadata) {
      if (row.type === "car" || row.type === "truck") {
        // Salva velocidade base se não existir
        if (!row._baseSpeed) row._baseSpeed = Math.round(row.speed / (row._lastMultiplier || 1));
        row.speed = Math.round(row._baseSpeed * multiplier);
        row._lastMultiplier = multiplier;
      }
    }
  });
}

// Ajusta dificuldade conforme a posição do jogador (remove bónus automáticos duplicados)
function updateDifficulty() {
  if (position.currentRow >= 200 && currentDifficulty !== 2) {
    // Bônus automático já é dado via checkScoreBonus no updateScoreHUD
    coinProbability = 0.15; // Reduzido de 0.2
    setCoinProbability(coinProbability);
    setCarSpeed(2.1);
    currentDifficulty = 2;
  } else if (position.currentRow >= 100 && position.currentRow < 200 && currentDifficulty !== 1) {
    // Bônus automático já é dado via checkScoreBonus no updateScoreHUD
    coinProbability = 0.3; // Reduzido de 0.4
    setCoinProbability(coinProbability);
    setCarSpeed(1.6);
    currentDifficulty = 1;
  } else if (position.currentRow < 100 && currentDifficulty !== 0) {
    // Reset para dificuldade normal
    setCarSpeed(1);
    coinProbability = 0.6; // Reduzido de 0.8
    setCoinProbability(coinProbability);
    currentDifficulty = 0;
  }
}

function updateCoinHUD() {
  // Chama a função global que agora lida com sessão apenas
  if (typeof window.updateCoinHUD === "function") {
    window.updateCoinHUD();
  }
}
