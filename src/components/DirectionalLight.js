import * as THREE from "three";

export function DirectionalLight() {
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2); // luz branca
  dirLight.position.set(100, -100, 200); // posição da luz
  dirLight.up.set(0, 0, 1);
  dirLight.castShadow = true;

  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 2000;

  // cobre toda a área de jogo
  dirLight.shadow.camera.left = -500;
  dirLight.shadow.camera.right = 500;
  dirLight.shadow.camera.top = 500;
  dirLight.shadow.camera.bottom = -500;
  dirLight.shadow.bias = -0.001; 

  dirLight.shadow.camera.up.set(0, 0, 1);

  return dirLight;
}