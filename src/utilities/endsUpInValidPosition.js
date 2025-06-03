import { calculateFinalPosition } from "./calculateFinalPosition";
import { minTileIndex, maxTileIndex, tileSize } from "../constants";
import { metadata as rows } from "../components/Map";
import * as THREE from "three";

export function endsUpInValidPosition(currentPosition, moves) {
  // Detecta se o último movimento é um salto
  const isJump = moves[moves.length - 1] === "jump";

  // Para salto, precisamos checar a linha intermediária e a final
  if (isJump) {
    // Posição inicial
    let { rowIndex, tileIndex } = currentPosition;
    // Considera movimentos anteriores ao salto
    for (let i = 0; i < moves.length - 1; i++) {
      const dir = moves[i];
      if (dir === "forward") rowIndex += 1;
      if (dir === "backward") rowIndex -= 1;
      if (dir === "left") tileIndex -= 1;
      if (dir === "right") tileIndex += 1;
    }
    // Linha intermediária (primeiro passo do salto)
    const midRow = rowIndex + 1;
    // Linha final (segundo passo do salto)
    const finalRow = rowIndex + 2;

    // Fora dos limites do tabuleiro
    if (
      tileIndex < minTileIndex ||
      tileIndex > maxTileIndex ||
      midRow < 0 ||
      finalRow < 0
    ) {
      return false;
    }

    // Checa obstáculos na linha intermediária
    const midRowData = rows[midRow - 1];
    if (
      midRowData &&
      midRowData.type === "forest" &&
      midRowData.plants.some(
        (plant) =>
          (plant.type === "tree" ||
            plant.type === "bush" ||
            plant.type === "flower" ||
            plant.type === "star") &&
          plant.tileIndex === tileIndex
      )
    ) {
      return false;
    }

    // Checa obstáculos na linha final
    const finalRowData = rows[finalRow - 1];
    if (
      finalRowData &&
      finalRowData.type === "forest" &&
      finalRowData.plants.some(
        (plant) =>
          (plant.type === "tree" ||
            plant.type === "bush" ||
            plant.type === "flower" ||
            plant.type === "star") &&
          plant.tileIndex === tileIndex
      )
    ) {
      return false;
    }

    // Checa limites das linhas verdes antes da partida
    const greenLines = 10;
    if (midRow < 0 && (midRow < -greenLines || midRow > -1)) return false;
    if (finalRow < 0 && (finalRow < -greenLines || finalRow > -1)) return false;

    return true;
  }

  // Calculate where the player would end up after the move
  const finalPosition = calculateFinalPosition(
    currentPosition,
    moves
  );

  // Detect if we hit the edge of the board
  if (
    finalPosition.tileIndex < minTileIndex ||
    finalPosition.tileIndex > maxTileIndex
  ) {
    // Invalid move, ignore move command
    return false;
  }

  // Antes da linha de partida, impede ultrapassar as linhas verdes claras
  if (finalPosition.rowIndex < 0) {
    const greenLines = 10; // igual ao valor em Map.js
    if (finalPosition.rowIndex < -greenLines || finalPosition.rowIndex > -1) {
      return false;
    }
    return true;
  }

  // Detect if we hit a tree
  const finalRow = rows[finalPosition.rowIndex - 1];
  if (
    finalRow &&
    finalRow.type === "forest" &&
    finalRow.plants.some(
      (plant) =>
        (plant.type === "tree" ||
         plant.type === "bush" ||
         plant.type === "flower" ||
         plant.type === "star") && // Inclui star
        plant.tileIndex === finalPosition.tileIndex
    )
  ) {
    // Invalid move, ignore move command
    return false;
  }

  return true;
}