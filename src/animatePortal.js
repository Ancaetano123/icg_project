import { metadata as rows } from "./components/Map";

export function animatePortal() {
  for (const row of rows) {
    if (row && row.portal && row.portal.ref) {
      const portal = row.portal.ref;
      // Rodar o anel visualmente
      if (portal.userData.torus) {
        portal.userData.torus.rotation.z -= 0.08;
      }
      // Animar cubos dentro do anel
      if (portal.userData.cubes) {
        const time = performance.now() * 0.001;
        portal.userData.cubes.forEach(({ mesh, baseAngle, offset }, i) => {
          const speed = 1.2 + 0.25 * Math.sin(time + i);
          const angle = baseAngle + time * speed + offset;
          const r = 25 + Math.sin(time * 1.6 + i * 2) * (4 - 1.3 * Math.cos(angle * 2));
          mesh.position.x = Math.cos(angle) * r;
          mesh.position.y = Math.sin(angle) * r;
          mesh.position.z = Math.sin(time * 2.1 + i) * 2.5;
          const scale = 1 + 0.2 * Math.sin(time * 2.1 + i);
          mesh.scale.set(scale, scale, scale);
        });
      }
    }
  }
}