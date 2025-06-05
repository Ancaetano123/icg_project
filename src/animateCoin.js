import { metadata as rows } from "./components/Map";
import { position } from "./components/Player";

// Faz as moedas girarem 
export function animateCoin() {
  let speed = 0.18;
  if (position.currentRow >= 100 && position.currentRow < 200) {
    speed = 0.32;
  } else if (position.currentRow >= 200) {
    speed = 0.45;
  }
  for (const row of rows) {
    if (row && row.coin && row.coin.ref) {
      row.coin.ref.rotation.z += speed;
    }
  }
}
