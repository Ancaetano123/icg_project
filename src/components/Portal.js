import * as THREE from "three";
import { tileSize } from "../constants";

// Constantes do portal
const SPHERE_RADIUS = 7;
const CUBE_COUNT = 8;
const CUBE_SIZE = 4.5;
const ORBIT_RADIUS = 22;
const COLOR_START = 0x6a82fb;
const COLOR_END = 0xfc5c7d;

export function Portal(tileIndex) {
  const group = new THREE.Group();
  group.position.x = tileIndex * tileSize;
  group.position.z = 28;

  // Direção do portal
  const direction = Math.random() < 0.5 ? "forward" : "backward";
  group.userData.direction = direction;

  // Esfera central
  const geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 32, 32);
  const colorStart = new THREE.Color(COLOR_START);
  const colorEnd = new THREE.Color(COLOR_END);
  const colors = [];
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    const v = geometry.attributes.position.getZ(i) / SPHERE_RADIUS;
    const t = (v + 1) / 2;
    const color = colorStart.clone().lerp(colorEnd, t);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const sphere = new THREE.Mesh(
    geometry,
    new THREE.MeshLambertMaterial({
      vertexColors: true,
      emissive: 0x7c4dff,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.55,
    })
  );
  group.add(sphere);

  // Cubos a orbitar
  const cubes = [];
  for (let i = 0; i < CUBE_COUNT; i++) {
    const t = i / (CUBE_COUNT - 1);
    const cubeColor = colorStart.clone().lerp(colorEnd, t).getHex();
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE),
      new THREE.MeshLambertMaterial({
        color: cubeColor,
        transparent: false,
        opacity: 1,
        emissive: cubeColor,
        emissiveIntensity: 0.8,
      })
    );
    const angle = (i / CUBE_COUNT) * Math.PI * 2;
    cube.position.x = Math.cos(angle) * ORBIT_RADIUS;
    cube.position.y = Math.sin(angle) * ORBIT_RADIUS;
    cube.position.z = Math.sin(i * 2) * 2.2;
    group.add(cube);
    cubes.push({ mesh: cube, baseAngle: angle, offset: Math.random() * Math.PI * 2 });
  }

  // Dados para colisão
  group.userData.torus = sphere;
  group.userData.cubes = cubes;
  group.userData.isPortal = true;

  return group;
}
