import * as THREE from "three";

export function DirectionalLight() {
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2); // cor branca, intensidade aumentada
  dirLight.position.set(100, -100, 200); // Better position for shadows
  dirLight.up.set(0, 0, 1);
  dirLight.castShadow = true;

  // Enhanced shadow map settings for better quality
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 2000;

  // Ensure shadow camera covers entire playable area
  dirLight.shadow.camera.left = -500;
  dirLight.shadow.camera.right = 500;
  dirLight.shadow.camera.top = 500;
  dirLight.shadow.camera.bottom = -500;
  dirLight.shadow.bias = -0.001; // Reduce shadow acne

  dirLight.shadow.camera.up.set(0, 0, 1);

  return dirLight;
}