import * as THREE from "three";
import { Renderer } from "./components/Renderer";
import { Camera } from "./components/Camera";
import { DirectionalLight } from "./components/DirectionalLight";
import { player, initializePlayer } from "./components/Player";
import { map, initializeMap } from "./components/Map";
import { animateVehicles } from "./animateVehicles";
import { animatePlayer } from "./animatePlayer";
import { hitTest } from "./hitTest";
import "./style.css";
import "./collectUserInput";

const scene = new THREE.Scene();
scene.add(player);
scene.add(map);

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const dirLight = DirectionalLight();
dirLight.target = player;
player.add(dirLight);

const camera = Camera();
player.add(camera);

const scoreDOM = document.getElementById("score");
const resultDOM = document.getElementById("result-container");

initializeGame();

function initializeGame() {
  console.log("Initializing game...");
  initializePlayer();
  initializeMap();
  console.log("Player and map initialized.");

  // Initialize UI
  if (scoreDOM) scoreDOM.innerText = "0";
  if (resultDOM) resultDOM.style.visibility = "hidden";
}

const renderer = Renderer();
renderer.setAnimationLoop(() => {
  try {
    animate();
  } catch (error) {
    console.error("Error in animation loop:", error);
  }
});

function animate() {
  try {
    animateVehicles();
    animatePlayer();
    hitTest();
    renderer.render(scene, camera);
  } catch (error) {
    console.error("Error during animation:", error);
  }
}

window.addEventListener('error', (event) => {
  console.error('Erro capturado:', event.error);
});