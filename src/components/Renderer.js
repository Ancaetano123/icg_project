import * as THREE from "three";

export function Renderer() {
  const canvas = document.querySelector("canvas.game");
  if (!canvas) throw new Error("Canvas not found");

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
    canvas: canvas,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x181a20, 1);
  renderer.sortObjects = true;

  return renderer;
}