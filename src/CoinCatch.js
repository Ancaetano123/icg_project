import * as THREE from "three";
import { metadata as rows } from "./components/Map";
import { player, position } from "./components/Player";
import { setCoinProbability } from "./utilities/generateRows";

let coinScore = 0;
let bonus100Given = false;
let bonus200Given = false;
export let coinProbability = 0.6;

let currentDifficulty = 0;

export function coinCatch() {
  // Ajusta dificuldade conforme posição
  updateDifficulty();

  const row = rows[position.currentRow - 1];
  if (!row || !row.coin || !row.coin.ref) return;

  const coinObj = row.coin.ref;

  // Verifica se moeda ainda existe
  if (!coinObj.parent) {
    row.coin.ref = null;
    return;
  }

  // Centro da moeda
  const coinWorldPos = new THREE.Vector3();
  coinObj.getWorldPosition(coinWorldPos);

  // Centro do jogador
  const playerWorldPos = new THREE.Vector3();
  player.getWorldPosition(playerWorldPos);

  // Distância 2D
  const dx = coinWorldPos.x - playerWorldPos.x;
  const dy = coinWorldPos.y - playerWorldPos.y;
  const dist2D = Math.sqrt(dx * dx + dy * dy);

  // Raio de recolha
  const collectionRadius = 35;

  if (dist2D < collectionRadius) {
    if (typeof window.collectCoin === "function") {
      window.collectCoin();
    }
    if (coinObj.parent) coinObj.parent.remove(coinObj);
    row.coin.ref = null;
    console.log("Regular collection!");
  }
}

// Ajusta velocidade dos carros
function setCarSpeed(multiplier) {
  import("./components/Map").then(({ metadata }) => {
    for (const row of metadata) {
      if (row.type === "car" || row.type === "truck") {
        if (!row._baseSpeed) row._baseSpeed = Math.round(row.speed / (row._lastMultiplier || 1));
        row.speed = Math.round(row._baseSpeed * multiplier);
        row._lastMultiplier = multiplier;
      }
    }
  });
}

// Ajusta dificuldade conforme posição
function updateDifficulty() {
  if (position.currentRow >= 200 && currentDifficulty !== 2) {
    coinProbability = 0.15;
    setCoinProbability(coinProbability);
    setCarSpeed(2.1);
    currentDifficulty = 2;
  } else if (position.currentRow >= 100 && position.currentRow < 200 && currentDifficulty !== 1) {
    coinProbability = 0.3;
    setCoinProbability(coinProbability);
    setCarSpeed(1.6);
    currentDifficulty = 1;
  } else if (position.currentRow < 100 && currentDifficulty !== 0) {
    setCarSpeed(1);
    coinProbability = 0.6;
    setCoinProbability(coinProbability);
    currentDifficulty = 0;
  }
}

function updateCoinHUD() {
  if (typeof window.updateCoinHUD === "function") {
    window.updateCoinHUD();
  }
}
