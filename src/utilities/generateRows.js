import * as THREE from "three";
import { minTileIndex, maxTileIndex } from "../constants";

// Probabilidade de moeda
export let coinProbability = 0.2; 
export function setCoinProbability(prob) {
  coinProbability = Math.max(0, Math.min(1, prob));
}
// Probabilidade de portal
const PORTAL_PROBABILITY = 0.08; 

export function generateRows(amount) {
  const rows = [];
  for (let i = 0; i < amount; i++) {
    // Não gera moeda nem portal nas primeiras 3 linhas
    const allowSpecials = i >= 3;
    const placeCoin = allowSpecials && Math.random() < coinProbability;
    const placePortal = allowSpecials && Math.random() < PORTAL_PROBABILITY;
    if (placePortal) {
      console.log(`Portal gerado na linha ${i}`);
    }
    const rowData = generateRow(placeCoin, placePortal);
    rows.push(rowData);
  }
  return rows;
}

function generateRow(placeCoin = false, placePortal = false) {
  const type = randomElement(["car", "truck", "forest"]);
  if (type === "car") return generateCarLaneMetadata(placeCoin, placePortal);
  if (type === "truck") return generateTruckLaneMetadata(placeCoin, placePortal);
  return generateForesMetadata(placeCoin, placePortal);
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateForesMetadata(placeCoin = false, placePortal = false) {
  const occupiedTiles = new Set();
  const plants = Array.from({ length: 6 }, () => {
    let tileIndex;
    do {
      tileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
    } while (occupiedTiles.has(tileIndex));
    occupiedTiles.add(tileIndex);

    const type = randomElement(["tree", "bush", "flower", "star"]);
    const height = type === "tree" ? randomElement([25, 50, 75]) : null;

    return { tileIndex, type, height };
  });

  let coin = null;
  if (placeCoin) {
    let coinTileIndex;
    let tries = 0;
    do {
      coinTileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
      tries++;
      if (tries > 30) break;
    } while (occupiedTiles.has(coinTileIndex));
    if (!occupiedTiles.has(coinTileIndex)) {
      coin = { tileIndex: coinTileIndex };
    }
  }

  let portal = null;
  if (placePortal) {
    const direction = randomElement(["forward", "backward"]);
    const offset = THREE.MathUtils.randInt(10, 30);
    let portalTileIndex;
    let tries = 0;
    do {
      portalTileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
      tries++;
      if (tries > 30) break;
    } while (occupiedTiles.has(portalTileIndex));
    if (!occupiedTiles.has(portalTileIndex)) {
      portal = { tileIndex: portalTileIndex, direction, offset };
      console.log(`Portal criado no tile ${portalTileIndex}, direção: ${direction}, offset: ${offset}`);
    }
  }
  return { type: "forest", plants, coin, portal };
}

function generateCarLaneMetadata(placeCoin = false, placePortal = false) {
  const direction = randomElement([true, false]);
  const speed = randomElement([125, 156, 188]);
  const occupiedTiles = new Set();

  const vehicles = Array.from({ length: 3 }, () => {
    let initialTileIndex;
    do {
      initialTileIndex = THREE.MathUtils.randInt(
        minTileIndex,
        maxTileIndex
      );
    } while (occupiedTiles.has(initialTileIndex));
    occupiedTiles.add(initialTileIndex - 2);
    occupiedTiles.add(initialTileIndex - 1);
    occupiedTiles.add(initialTileIndex);
    occupiedTiles.add(initialTileIndex + 1);
    occupiedTiles.add(initialTileIndex + 2);

    const color = randomElement([0xa52523, 0xbdb638, 0x78b14b]);
    return { initialTileIndex, color };
  });

  let coin = null;
  if (placeCoin) {
    let coinTileIndex;
    let tries = 0;
    do {
      coinTileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
      tries++;
      if (tries > 30) break;
    } while (occupiedTiles.has(coinTileIndex));
    if (!occupiedTiles.has(coinTileIndex)) {
      coin = { tileIndex: coinTileIndex };
    }
  }

  let portal = null;
  if (placePortal) {
    const direction = randomElement(["forward", "backward"]);
    const offset = THREE.MathUtils.randInt(10, 30);
    let portalTileIndex;
    let tries = 0;
    do {
      portalTileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
      tries++;
      if (tries > 30) break;
    } while (occupiedTiles.has(portalTileIndex));
    if (!occupiedTiles.has(portalTileIndex)) {
      portal = { tileIndex: portalTileIndex, direction, offset };
      console.log(`Portal criado em estrada (carro) no tile ${portalTileIndex}`);
    }
  }
  return { type: "car", direction, speed, vehicles, coin, portal };
}

function generateTruckLaneMetadata(placeCoin = false, placePortal = false) {
  const direction = randomElement([true, false]);
  const speed = randomElement([125, 156, 188]);
  const occupiedTiles = new Set();

  const vehicles = Array.from({ length: 2 }, () => {
    let initialTileIndex;
    do {
      initialTileIndex = THREE.MathUtils.randInt(
        minTileIndex,
        maxTileIndex
      );
    } while (occupiedTiles.has(initialTileIndex));
    occupiedTiles.add(initialTileIndex - 2);
    occupiedTiles.add(initialTileIndex - 1);
    occupiedTiles.add(initialTileIndex);
    occupiedTiles.add(initialTileIndex + 1);
    occupiedTiles.add(initialTileIndex + 2);

    const color = randomElement([0xa52523, 0xbdb638, 0x78b14b]);
    return { initialTileIndex, color };
  });

  let coin = null;
  if (placeCoin) {
    let coinTileIndex;
    let tries = 0;
    do {
      coinTileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
      tries++;
      if (tries > 30) break;
    } while (occupiedTiles.has(coinTileIndex));
    if (!occupiedTiles.has(coinTileIndex)) {
      coin = { tileIndex: coinTileIndex };
    }
  }

  let portal = null;
  if (placePortal) {
    const direction = randomElement(["forward", "backward"]);
    const offset = THREE.MathUtils.randInt(10, 30);
    let portalTileIndex;
    let tries = 0;
    do {
      portalTileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
      tries++;
      if (tries > 30) break;
    } while (occupiedTiles.has(portalTileIndex));
    if (!occupiedTiles.has(portalTileIndex)) {
      portal = { tileIndex: portalTileIndex, direction, offset };
      console.log(`Portal criado em estrada (truck) no tile ${portalTileIndex}`);
    }
  }
  return { type: "truck", direction, speed, vehicles, coin, portal };
}