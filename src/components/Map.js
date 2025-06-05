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

// Linha de partida xadrez
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

// Linha de relva verde claro
function GrassLightGreen(rowIndex) {
  const group = new THREE.Group();
  group.position.y = rowIndex * tileSize;

  const tile = new THREE.Mesh(
    new THREE.BoxGeometry(tilesPerRow * tileSize, tileSize, 3),
    new THREE.MeshLambertMaterial({ color: "#b2e07a" })
  );
  tile.position.z = 1.5;
  tile.receiveShadow = true;
  group.add(tile);

  return group;
}

// Linha de solo bege
function BeigeSoil(rowIndex) {
  const group = new THREE.Group();
  group.position.y = rowIndex * tileSize;

  const tile = new THREE.Mesh(
    new THREE.BoxGeometry(tilesPerRow * tileSize, tileSize, 3),
    new THREE.MeshLambertMaterial({ color: "#FAEBD7" })
  );
  tile.position.z = 1.5;
  tile.receiveShadow = true;
  group.add(tile);

  return group;
}

export const metadata = [];

export const map = new THREE.Group();

export function initializeMap() {
  metadata.length = 0;
  map.remove(...map.children);

  // Linhas verdes antes da partida
  const greenLines = 10;
  for (let i = -greenLines; i <= -1; i++) {
    const grass = GrassLightGreen(i);
    map.add(grass);
  }

  // Linha de partida xadrez (rowIndex 0)
  const startLine = StartLine(0);
  map.add(startLine);

  addRows();
}

export function addRows() {
  const newMetadata = generateRows(20);

  const startIndex = metadata.length;
  metadata.push(...newMetadata);

  newMetadata.forEach((rowData, index) => {
    const rowIndex = startIndex + index + 1;

    if (rowData.type === "forest") {
      const row = BeigeSoil(rowIndex);

      rowData.plants
        .filter(plant =>
          plant.type === "tree" ||
          plant.type === "bush" ||
          plant.type === "flower"
        )
        .forEach((plant) => {
          let plantObj = null;
          if (plant.type === "tree") {
            plantObj = Tree(plant.tileIndex, plant.height);
          } else if (plant.type === "bush") {
            plantObj = Bush(plant.tileIndex);
          } else if (plant.type === "flower") {
            plantObj = Flower(plant.tileIndex);
          }
          if (plantObj) {
            row.add(plantObj);
          }
        });

      // Moeda
      if (rowData.coin) {
        const coin = Coin(rowData.coin.tileIndex);
        row.add(coin);
        rowData.coin.ref = coin;
      }

      // Portal
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

      // Moeda
      if (rowData.coin) {
        const coin = Coin(rowData.coin.tileIndex);
        row.add(coin);
        rowData.coin.ref = coin;
      }

      // Portal
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