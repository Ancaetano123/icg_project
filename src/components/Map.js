import * as THREE from "three";
import { generateRows } from "../utilities/generateRows";
import { Grass } from "./Floor";
import { Road } from "./Road";
import { Tree, Bush, Flower } from "./Tree";
import { Car } from "./Car";
import { Truck } from "./Truck";
import { tilesPerRow, tileSize } from "../constants";
import { Coin } from "./Coin";
import { Portal } from "./Portal";

// Linha de partida xadrez preto e branco
function StartLine(rowIndex) {
  const group = new THREE.Group();
  group.position.y = rowIndex * tileSize;

  for (let i = 0; i < tilesPerRow; i++) {
    const color = i % 2 === 0 ? "#000000" : "#ffffff";
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(tileSize, tileSize, 3),
      new THREE.MeshLambertMaterial({ color })
    );
    tile.position.x = (i - Math.floor(tilesPerRow / 2)) * tileSize;
    tile.position.z = 1.5;
    tile.receiveShadow = true;
    group.add(tile);
  }

  return group;
}

// Linha de relva verde claro (não xadrez)
function GrassLightGreen(rowIndex) {
  const group = new THREE.Group();
  group.position.y = rowIndex * tileSize;

  const tile = new THREE.Mesh(
    new THREE.BoxGeometry(tilesPerRow * tileSize, tileSize, 3),
    new THREE.MeshLambertMaterial({ color: "#b2e07a" }) // verde claro
  );
  tile.position.z = 1.5;
  tile.receiveShadow = true;
  group.add(tile);

  return group;
}

// Linha de solo bege para floresta
function BeigeSoil(rowIndex) {
  const group = new THREE.Group();
  group.position.y = rowIndex * tileSize;

  const tile = new THREE.Mesh(
    new THREE.BoxGeometry(tilesPerRow * tileSize, tileSize, 3),
    new THREE.MeshLambertMaterial({ color: "#FAEBD7" }) // bege
  );
  tile.position.z = 1.5;
  tile.receiveShadow = true;
  group.add(tile);

  return group;
}

export const metadata = [];

export const map = new THREE.Group();

export function initializeMap() {
  // Remove all rows
  metadata.length = 0;
  map.remove(...map.children);

  // Número de linhas verde claro antes da linha de partida
  const greenLines = 10;
  for (let i = -greenLines; i <= -1; i++) {
    const grass = GrassLightGreen(i);
    map.add(grass);
  }

  // Linha de partida xadrez preto e branco (rowIndex 0)
  const startLine = StartLine(0);
  map.add(startLine);

  // NÃO adicionar mais linhas de relva! As próximas linhas são geradas dinamicamente.
  addRows();
}

export function addRows() {
  const newMetadata = generateRows(20);

  const startIndex = metadata.length;
  metadata.push(...newMetadata);

  newMetadata.forEach((rowData, index) => {
    const rowIndex = startIndex + index + 1; // +1 porque 0 é a linha de partida

    if (rowData.type === "forest") {
      const row = BeigeSoil(rowIndex);

      rowData.plants.forEach(({ tileIndex, type, height }) => {
        let plant;
        if (type === "tree") {
          plant = Tree(tileIndex, height);
        } else if (type === "bush") {
          plant = Bush(tileIndex);
        } else if (type === "flower") {
          plant = Flower(tileIndex);
        } else if (type === "star") {
          plant = Flower(tileIndex);
        }
        row.add(plant);
      });

      // --- Adiciona moeda se existir ---
      if (rowData.coin) {
        const coin = Coin(rowData.coin.tileIndex);
        row.add(coin);
        rowData.coin.ref = coin;
      }

      // --- Adiciona portal se existir ---
      if (rowData.portal) {
        const portal = Portal(rowData.portal.tileIndex, rowData.portal.direction);
        row.add(portal);
        rowData.portal.ref = portal;
        console.log(`Portal adicionado à cena na linha ${rowIndex}, tile ${rowData.portal.tileIndex}`);
      }

      map.add(row);
    }

    if (rowData.type === "car" || rowData.type === "truck") {
      const row = Road(rowIndex);

      rowData.vehicles.forEach((vehicle) => {
        const vehicleObj =
          rowData.type === "car"
            ? Car(vehicle.initialTileIndex, vehicle.color, rowData.direction)
            : Truck(vehicle.initialTileIndex, vehicle.color, rowData.direction);
        vehicle.ref = vehicleObj;
        row.add(vehicleObj);
      });

      // --- Adiciona moeda se existir ---
      if (rowData.coin) {
        const coin = Coin(rowData.coin.tileIndex);
        row.add(coin);
        rowData.coin.ref = coin;
      }

      // --- Adiciona portal se existir ---
      if (rowData.portal) {
        const portal = Portal(rowData.portal.tileIndex, rowData.portal.direction);
        row.add(portal);
        rowData.portal.ref = portal;
        console.log(`Portal adicionado à estrada na linha ${rowIndex}, tile ${rowData.portal.tileIndex}`);
      }

      map.add(row);
    }
  });
}