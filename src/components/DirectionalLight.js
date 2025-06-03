const THREE = window.THREE;

export function DirectionalLight() {
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.32); // intensidade média
  dirLight.position.set(-100, -100, 200);
  dirLight.up.set(0, 0, 1);
  dirLight.castShadow = true;

  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;

  dirLight.shadow.camera.up.set(0, 0, 1);
  // Aumente bastante os limites para cobrir o mapa inteiro
  dirLight.shadow.camera.left = -2000;
  dirLight.shadow.camera.right = 2000;
  dirLight.shadow.camera.top = 2000;
  dirLight.shadow.camera.bottom = -2000;
  dirLight.shadow.camera.near = 10;
  dirLight.shadow.camera.far = 4000;

  return dirLight;
}