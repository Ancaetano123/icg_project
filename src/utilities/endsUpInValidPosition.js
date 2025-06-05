import { calculateFinalPosition } from "./calculateFinalPosition";
import { minTileIndex, maxTileIndex } from "../constants";
import { metadata as rows } from "../components/Map";

export function endsUpInValidPosition(currentPosition, moves) {
  // Verifica se o último movimento é salto
  const isJump = moves[moves.length - 1] === "jump";

  if (isJump) {
    let { rowIndex, tileIndex } = currentPosition;
    for (let i = 0; i < moves.length - 1; i++) {
      const dir = moves[i];
      if (dir === "forward") rowIndex += 1;
      if (dir === "backward") rowIndex -= 1;
      if (dir === "left") tileIndex -= 1;
      if (dir === "right") tileIndex += 1;
    }
    const midRow = rowIndex + 1;
    const finalRow = rowIndex + 2;

    // Fora dos limites
    if (
      tileIndex < minTileIndex ||
      tileIndex > maxTileIndex ||
      midRow < 0 ||
      finalRow < 0
    ) {
      return false;
    }

    // Obstáculo na linha intermédia
    const midRowData = rows[midRow - 1];
    if (
      midRowData &&
      midRowData.type === "forest" &&
      midRowData.plants.some(
        (plant) =>
          (plant.type === "tree" ||
            plant.type === "bush" ||
            plant.type === "flower") &&
          plant.tileIndex === tileIndex
      )
    ) {
      return false;
    }

    // Obstáculo na linha final
    const finalRowData = rows[finalRow - 1];
    if (
      finalRowData &&
      finalRowData.type === "forest" &&
      finalRowData.plants.some(
        (plant) =>
          (plant.type === "tree" ||
            plant.type === "bush" ||
            plant.type === "flower") &&
          plant.tileIndex === tileIndex
      )
    ) {
      return false;
    }

    // Limite das linhas verdes antes da partida
    const greenLines = 10;
    if (midRow < 0 && (midRow < -greenLines || midRow > -1)) return false;
    if (finalRow < 0 && (finalRow < -greenLines || finalRow > -1)) return false;

    return true;
  }

  // Calcula posição final
  const finalPosition = calculateFinalPosition(
    currentPosition,
    moves
  );

  // Bateu no limite do tabuleiro
  if (
    finalPosition.tileIndex < minTileIndex ||
    finalPosition.tileIndex > maxTileIndex
  ) {
    return false;
  }

  // Antes da linha de partida, impede ultrapassar linhas verdes claras
  if (finalPosition.rowIndex < 0) {
    const greenLines = 10;
    if (finalPosition.rowIndex < -greenLines || finalPosition.rowIndex > -1) {
      return false;
    }
    return true;
  }

  // Obstáculo na linha final
  const finalRow = rows[finalPosition.rowIndex - 1];
  if (
    finalRow &&
    finalRow.type === "forest" &&
    finalRow.plants.some(
      (plant) =>
        (plant.type === "tree" ||
         plant.type === "bush" ||
         plant.type === "flower") &&
        plant.tileIndex === finalPosition.tileIndex
    )
  ) {
    return false;
  }

  return true;
}