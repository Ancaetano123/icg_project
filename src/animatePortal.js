import { metadata as rows } from "./components/Map";

export function animatePortal() {
  for (const row of rows) {
    if (row && row.portal && row.portal.ref) {
      const portal = row.portal.ref;
      // Rodopiar o anel visualmente (sentido contrário)
      if (portal.userData.torus) {
        portal.userData.torus.rotation.z -= 0.08; // Slightly faster rotation
      }
      // Animar cubos dentro do anel (sentido original)
      if (portal.userData.cubes) {
        const time = performance.now() * 0.001;
        portal.userData.cubes.forEach(({ mesh, baseAngle, offset }, i) => {
          // Movimento circular dentro da espessura do anel
          const speed = 1.2 + 0.25 * Math.sin(time + i); // Slightly increased values
          const angle = baseAngle + time * speed + offset;
          // Oscila dentro da espessura do anel
          const r = 25 + Math.sin(time * 1.6 + i * 2) * (4 - 1.3 * Math.cos(angle * 2)); // Increased radius
          mesh.position.x = Math.cos(angle) * r;
          mesh.position.y = Math.sin(angle) * r;
          // Pequena oscilação em Z para dar vida
          mesh.position.z = Math.sin(time * 2.1 + i) * 2.5; // Increased Z oscillation
          // Efeito de pulsação
          const scale = 1 + 0.2 * Math.sin(time * 2.1 + i); // Slightly more pulsation
          mesh.scale.set(scale, scale, scale);
        });
      }
    }
  }
}
