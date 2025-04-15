import { queueMove, queueJump } from "./components/Player";

document
  .getElementById("forward")
  ?.addEventListener("click", () => queueMove("forward"));

document
  .getElementById("backward")
  ?.addEventListener("click", () => queueMove("backward"));

document
  .getElementById("left")
  ?.addEventListener("click", () => queueMove("left"));

document
  .getElementById("right")
  ?.addEventListener("click", () => queueMove("right"));

window.addEventListener("keydown", (event) => {
  if (event.key === "w" || event.key === "W") {
    event.preventDefault(); // Evita o scroll da página
    queueMove("forward");
  } else if (event.key === "s" || event.key === "S") {
    event.preventDefault();
    queueMove("backward");
  } else if (event.key === "a" || event.key === "A") {
    event.preventDefault();
    queueMove("left");
  } else if (event.key === "d" || event.key === "D") {
    event.preventDefault();
    queueMove("right");
  } else if (event.key === " ") {
    event.preventDefault();
    queueJump(); // Chama a função de salto
  }
});