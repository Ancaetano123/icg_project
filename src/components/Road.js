import * as THREE from "three";
import { tilesPerRow, tileSize } from "../constants";

export function Road(rowIndex) {
  const road = new THREE.Group();
  road.position.y = rowIndex * tileSize;

  // Estrada
  const foundation = new THREE.Mesh(
    new THREE.PlaneGeometry(tilesPerRow * tileSize, tileSize),
    new THREE.MeshLambertMaterial({ color: 0x454a59 })
  );
  foundation.receiveShadow = true;
  road.add(foundation);

  // Linha tracejada central
  const dashWidth = tileSize * 0.3; 
  const dashHeight = tileSize * 0.07; 
  const dashSpacing = tileSize * 0.2; 
  const numDashes = Math.floor((tilesPerRow * tileSize) / (dashWidth + dashSpacing));

  for (let i = 0; i < numDashes; i++) {
    // Traço
    const dash = new THREE.Mesh(
      new THREE.PlaneGeometry(dashWidth, dashHeight),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    dash.position.x = -((tilesPerRow * tileSize) / 2) + i * (dashWidth + dashSpacing) + dashWidth / 2;
    dash.position.z = 0.01; 
    road.add(dash);
  }

  // Linha contínua esquerda
  const lineWidth = tileSize * 0.05; 
  const lineLength = tilesPerRow * tileSize; 
  const leftLine = new THREE.Mesh(
    new THREE.PlaneGeometry(lineLength, lineWidth),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  leftLine.position.x = 0; 
  leftLine.position.y = -tileSize / 2 + lineWidth / 2; 
  leftLine.position.z = 0.01;
  road.add(leftLine);

  // Linha contínua direita
  const rightLine = new THREE.Mesh(
    new THREE.PlaneGeometry(lineLength, lineWidth),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  rightLine.position.x = 0;
  rightLine.position.y = tileSize / 2 - lineWidth / 2;
  rightLine.position.z = 0.01; 
  road.add(rightLine);

  return road;
}