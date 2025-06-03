import { metadata as rows } from "./components/Map";
// Importa a posição do jogador para saber a pontuação
import { position } from "./components/Player";

// Faz todas as moedas girarem como um pião (eixo Z)
export function animateCoin() {
  // Velocidade base
  let speed = 0.18;
  // Se o jogador já passou de 100, aumenta a velocidade
  if (position.currentRow >= 100 && position.currentRow < 200) {
    speed = 0.32;
  } else if (position.currentRow >= 200) {
    speed = 0.45;
  }
  for (const row of rows) {
    if (row && row.coin && row.coin.ref) {
      // Only animate rotation, position might be controlled by magnet
      row.coin.ref.rotation.z += speed;
    }
  }
}
