const THREE = window.THREE;
import { tilesPerRow, tileSize } from "../constants";

export function Road(rowIndex) {
  const road = new THREE.Group();
  road.position.y = rowIndex * tileSize;

  const foundation = new THREE.Mesh(
    new THREE.PlaneGeometry(tilesPerRow * tileSize, tileSize),
    new THREE.MeshLambertMaterial({ color: 0x454a59 })
  );
  foundation.receiveShadow = true;
  road.add(foundation);

  // Add dashed line in the middle of the road
  const dashWidth = tileSize * 0.3; // Width of each dash
  const dashHeight = tileSize * 0.07; // Height of each dash
  const dashSpacing = tileSize * 0.2; // Spacing between dashes
  const numDashes = Math.floor((tilesPerRow * tileSize) / (dashWidth + dashSpacing));

  for (let i = 0; i < numDashes; i++) {
    const dash = new THREE.Mesh(
      new THREE.PlaneGeometry(dashWidth, dashHeight),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    dash.position.x = -((tilesPerRow * tileSize) / 2) + i * (dashWidth + dashSpacing) + dashWidth / 2;
    dash.position.z = 0.01; // Slightly above the foundation to avoid z-fighting
    road.add(dash);
  }

  // Add continuous lines to the edges of the road
  const lineWidth = tileSize * 0.05; // Width of the edge lines
  const lineLength = tilesPerRow * tileSize; // Length of the edge lines (matches the road length)

  // Left continuous line
  const leftLine = new THREE.Mesh(
    new THREE.PlaneGeometry(lineLength, lineWidth),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  leftLine.position.x = 0; // Centered horizontally
  leftLine.position.y = -tileSize / 2 + lineWidth / 2; // Position at the bottom edge
  leftLine.position.z = 0.01; // Slightly above the foundation to avoid z-fighting
  road.add(leftLine);

  // Right continuous line
  const rightLine = new THREE.Mesh(
    new THREE.PlaneGeometry(lineLength, lineWidth),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  rightLine.position.x = 0; // Centered horizontally
  rightLine.position.y = tileSize / 2 - lineWidth / 2; // Position at the top edge
  rightLine.position.z = 0.01; // Slightly above the foundation to avoid z-fighting
  road.add(rightLine);

  return road;
}