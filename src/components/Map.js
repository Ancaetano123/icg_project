import * as THREE from "three";
import { generateRows } from "../utilities/generateRows";
import { Grass } from "./Floor";
import { Road } from "./Road";
import { Tree, Bush, Flower } from "./Tree";
import { Car } from "./Car";
import { Truck } from "./Truck";

export const metadata = [];

export const map = new THREE.Group();

export function initializeMap() {
  console.log("Initializing map...");
  // Remove all rows
  metadata.length = 0;
  map.remove(...map.children);

  // Add new rows
  for (let rowIndex = 0; rowIndex > -8; rowIndex--) {
    const grass = Grass(rowIndex);
    map.add(grass);
  }
  addRows();
  console.log("Map initialized with rows:", metadata);
}

export function addRows() {
  const newMetadata = generateRows(20);
  console.log("Generated rows:", newMetadata);

  const startIndex = metadata.length;
  metadata.push(...newMetadata);

  newMetadata.forEach((rowData, index) => {
    const rowIndex = startIndex + index + 1;

    if (rowData.type === "forest") {
      const row = Grass(rowIndex);

      rowData.plants.forEach(({ tileIndex, type, height }) => {
        let plant;
        if (type === "tree") {
          plant = Tree(tileIndex, height);
        } else if (type === "bush") {
          plant = Bush(tileIndex);
        } else if (type === "flower") {
          plant = Flower(tileIndex);
        } else if (type === "star") { // Add star power-up
          plant = Flower(tileIndex); // Reuse Flower for visual representation
        }
        row.add(plant);
      });

      map.add(row);
    }

    if (rowData.type === "car") {
      const row = Road(rowIndex);

      rowData.vehicles.forEach((vehicle) => {
        const car = Car(vehicle.initialTileIndex, vehicle.color);
        vehicle.ref = car;
        row.add(car);
      });

      map.add(row);
    }

    if (rowData.type === "truck") {
      const row = Road(rowIndex);

      rowData.vehicles.forEach((vehicle) => {
        const truck = Truck(vehicle.initialTileIndex, vehicle.color);
        vehicle.ref = truck;
        row.add(truck);
      });

      map.add(row);
    }
  });
  console.log("Rows added to map:", metadata);
}