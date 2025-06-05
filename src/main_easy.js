import * as THREE from "three";
import { Renderer } from "./components/Renderer";
import { Camera } from "./components/Camera";
import { DirectionalLight } from "./components/DirectionalLight";
import { player, initializePlayer, playerSkins, setPlayerSkin } from "./components/Player";
import { map, initializeMap } from "./components/Map";
import { animateVehicles } from "./animateVehicles";
import { animatePlayer } from "./animatePlayer";
import { hitTest } from "./hitTest";
import { animateCoin } from "./animateCoin";
import { coinCatch, coinProbability } from "./CoinCatch";
import { animatePortal } from "./animatePortal";
import "./style.css";
import "./collectUserInput";
import { createPlayerPreviewModel } from "./components/Player"; 
import { superpowers, activateSuperpower, getPurchaseCount, createSuperpowerButtons, updateSuperpowerCounters, useSuperpower, updateSuperpowerButtonStates, lifeSystem, getExtraLives, setExtraLives, useExtraLife, addExtraLife } from "./superpowers";

const scene = new THREE.Scene();
scene.add(player); // Adiciona o player 
scene.add(map);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
scene.add(ambientLight);

const dirLight = DirectionalLight();
dirLight.intensity = 1.2;
dirLight.target = new THREE.Object3D();
scene.add(dirLight);

const camera = Camera();
scene.add(camera);

// Posição da sombra fixa
const shadowPosition = dirLight.position.clone();
function updateShadowPosition() {
  if (player && player.fixedShadow) {
    player.fixedShadow.position.set(shadowPosition.x, shadowPosition.y, shadowPosition.z);
  }
}

const resultDOM = document.getElementById("result-container");

// Preços das skins 
const skinPrices = [0, 15, 25, 35];

// Power-up lista e preços
const powerUps = [
  { 
    name: superpowers[0]?.name || "Shield",
    description: superpowers[0]?.description || "Shield for 8s",
    icon: superpowers[0]?.icon || "🛡️",
    effect: superpowers[0]?.effect || "protection",
    key: superpowers[0]?.key || "shield",
    price: 10
  },
  { 
    name: superpowers[1]?.name || "Rocket",
    description: superpowers[1]?.description || "Advance 10 tiles",
    icon: superpowers[1]?.icon || "🚀",
    effect: superpowers[1]?.effect || "boostStart",
    key: superpowers[1]?.key || "rocket",
    price: 5
  },
  { 
    name: superpowers[2]?.name || "Magnet",
    description: superpowers[2]?.description || "Attracts coins for 10s",
    icon: superpowers[2]?.icon || "🧲",
    effect: superpowers[2]?.effect || "coinMagnet",
    key: superpowers[2]?.key || "magnet",
    price: 15
  },
  { 
    name: "Extra Life",
    description: "Gain an extra life",
    icon: "❤️",
    effect: "extraLife",
    key: "extraLife",
    price: 20
  }
];

// Controlo de moedas 
window.currentSessionCoins = 0;
window.bonusGiven = { 100: false, 200: false };

// Saldo total de moedas
function getTotalCoins() {
  return parseInt(localStorage.getItem("totalCoins") || "0", 10);
}
function setTotalCoins(val) {
  localStorage.setItem("totalCoins", String(Math.max(0, val)));
}

// Skins desbloqueadas
function getUnlockedSkins() {
  const saved = localStorage.getItem("unlockedSkins");
  return saved ? JSON.parse(saved) : [true, false, false, false];
}
function setUnlockedSkins(arr) {
  localStorage.setItem("unlockedSkins", JSON.stringify(arr));
}

// Selecionar skin atual
function getSelectedSkinIndex() {
  const idx = localStorage.getItem("selectedSkinIndex");
  return idx !== null ? parseInt(idx, 10) : 0;
}
function setSelectedSkinIndex(idx) {
  localStorage.setItem("selectedSkinIndex", String(idx));
}


// Iniciar novo jogo (reset moedas da sessão)
function startGame() {
  window.currentSessionCoins = 0;
  window.bonusGiven = { 100: false, 200: false };
  updateCoinHUD();
}

// Terminar jogo (adiciona moedas da sessão ao total)
function endGame() {
  if (window.currentSessionCoins > 0) {
    const newTotal = getTotalCoins() + window.currentSessionCoins;
    setTotalCoins(newTotal);
    // Coins earned popup (console)
    console.log(`You earned ${window.currentSessionCoins} coins! Total balance: ${newTotal}`);
  }
  window.currentSessionCoins = 0;
  updateCoinHUD();
}

// Apanhar moeda durante o jogo
function collectCoin() {
  window.currentSessionCoins += 1;
  updateCoinHUD();
}

// Verificar bónus de score
function checkScoreBonus(score) {
  if (score >= 100 && !window.bonusGiven[100]) {
    window.currentSessionCoins += 10;
    window.bonusGiven[100] = true;
    updateCoinHUD();
    console.log("100 points bonus: +10 coins!");
  }
  if (score >= 200 && !window.bonusGiven[200]) {
    window.currentSessionCoins += 20;
    window.bonusGiven[200] = true;
    updateCoinHUD();
    console.log("200 points bonus: +20 coins!");
  }
}

// HUD moedas (mostra total e sessão)
function updateCoinHUD() {
  let coinDOM = document.getElementById("coin-score");
  if (!coinDOM) {
    coinDOM = document.createElement("div");
    coinDOM.id = "coin-score";
    coinDOM.style.position = "absolute";
    coinDOM.style.top = "25px";
    coinDOM.style.right = "25px";
    coinDOM.style.fontSize = "1.8em";
    coinDOM.style.color = "gold";
    coinDOM.style.fontFamily = "Press Start 2P, cursive";
    coinDOM.style.textShadow = "2px 2px 4px #000";
    coinDOM.style.zIndex = "1000";
    coinDOM.style.lineHeight = "1.4";
    document.body.appendChild(coinDOM);
  }
  const totalCoins = getTotalCoins();
  const sessionCoins = window.currentSessionCoins;
  coinDOM.innerHTML = `🪙: ${totalCoins}<br> S: +${sessionCoins}`;
}

// HUD vidas
function updateLifeHUD() {
  let lifeDOM = document.getElementById("life-hud");
  if (!lifeDOM) {
    lifeDOM = document.createElement("div");
    lifeDOM.id = "life-hud";
    lifeDOM.style.position = "absolute";
    lifeDOM.style.top = "90px";
    lifeDOM.style.left = "25px";
    lifeDOM.style.fontSize = "1.5em";
    lifeDOM.style.color = "#ff4081";
    lifeDOM.style.fontFamily = "Press Start 2P, cursive";
    lifeDOM.style.textShadow = "2px 2px 4px #000";
    lifeDOM.style.zIndex = "1000";
    document.body.appendChild(lifeDOM);
  }
  const lives = getExtraLives();
  lifeDOM.innerText = `❤️: ${lives}`;
}

// Comprar power-up (usa moedas totais e sessão)
function buyPowerUp(idx) {
  const pu = powerUps[idx];
  const price = pu.price || 0;
  let availableTotal = getTotalCoins();
  let availableSession = window.currentSessionCoins;
  const totalAvailable = availableTotal + availableSession;
  if (totalAvailable < price) {
    console.log(`Insufficient coins! Need ${price} coins, you have ${totalAvailable}.`);
    return false;
  }
  let remaining = price;
  if (availableTotal >= remaining) {
    setTotalCoins(availableTotal - remaining);
  } else {
    setTotalCoins(0);
    remaining -= availableTotal;
    window.currentSessionCoins = Math.max(0, availableSession - remaining);
  }
  updateCoinHUD();
  if (pu.effect === "extraLife") {
    addExtraLife();
    updateLifeHUD();
    console.log(`Purchased ${pu.name} for ${price} coins! Lives: ${getExtraLives()}`);
  } else {
    activateSuperpower(pu.effect, { 
      player, 
      scene, 
      onComplete: () => {
        console.log(`${pu.name} effect completed!`);
        updateSuperpowerCounters();
      }
    });
    console.log(`Purchased ${pu.name} for ${price} coins!`);
  }
  return true;
}

// Comprar skin (usa moedas totais e sessão)
function tryBuySkin(skinIndex) {
  const price = skinPrices[skinIndex];
  const unlocked = getUnlockedSkins();
  if (unlocked[skinIndex]) {
    console.log("Skin already unlocked!");
    return false;
  }
  let availableTotal = getTotalCoins();
  let availableSession = window.currentSessionCoins;
  const totalAvailable = availableTotal + availableSession;
  if (totalAvailable < price) {
    console.log(`Not enough coins! Need ${price}, you have ${totalAvailable}.`);
    return false;
  }
  let remaining = price;
  if (availableTotal >= remaining) {
    setTotalCoins(availableTotal - remaining);
  } else {
    setTotalCoins(0);
    remaining -= availableTotal;
    window.currentSessionCoins = Math.max(0, availableSession - remaining);
  }
  const newUnlocked = getUnlockedSkins();
  newUnlocked[skinIndex] = true;
  setUnlockedSkins(newUnlocked);
  setPlayerSkin(skinIndex);
  setSelectedSkinIndex(skinIndex);
  updateCoinHUD();
  console.log(`Skin "${playerSkins[skinIndex].name}" purchased for ${price} coins!`);
  return true;
}

window.updateCoinHUD = updateCoinHUD;
window.collectCoin = collectCoin;
window.checkScoreBonus = checkScoreBonus;
window.startGame = startGame;
window.endGame = endGame;
window.buyPowerUp = buyPowerUp;
window.tryBuySkin = tryBuySkin;

let thirdPerson = false;
let startActive = false;
let lastRow = -2;
let inCustomization = false;

// Renderer e ciclo principal
const renderer = Renderer();
renderer.setClearColor(0x181a20, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);
renderer.domElement.className = "game";

// Ajustar tamanho do canvas
function resizeRenderer() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

resizeRenderer();
window.addEventListener('resize', resizeRenderer);

function startAnimationLoop() {
  function mainLoop() {
    animate();
    requestAnimationFrame(mainLoop);
  }
  mainLoop();
}

initializeGame();

function initializeGame() {
  initializePlayer();
  initializeMap();
  setupSidebarButtons();
  setupScoreHUD();
  setupCoinHUD();
  updateLifeHUD();
  createSuperpowerButtons({ player, scene });
  updateSuperpowerButtonStates(true);
  if (resultDOM) {
    resultDOM.style.display = "none";
    resultDOM.style.visibility = "hidden";
  }
  resizeRenderer();
  startGame();
  const idx = getSelectedSkinIndex();
  const unlocked = getUnlockedSkins();
  if (unlocked[idx]) {
    setPlayerSkin(playerSkins[idx]);
  } else {
    setPlayerSkin(playerSkins[0]);
    setSelectedSkinIndex(0);
  }
  startAnimationLoop();
}

// Score HUD
function setupScoreHUD() {
  let scoreDOM = document.getElementById("score-hud");
  if (!scoreDOM) {
    scoreDOM = document.createElement("div");
    scoreDOM.id = "score-hud";
    scoreDOM.style.position = "absolute";
    scoreDOM.style.top = "25px";
    scoreDOM.style.left = "25px";
    scoreDOM.style.fontSize = "2.5em";
    scoreDOM.style.color = "white";
    scoreDOM.style.fontFamily = "Press Start 2P, cursive";
    scoreDOM.style.textShadow = "2px 2px 4px #000";
    scoreDOM.style.zIndex = "1000";
    document.body.appendChild(scoreDOM);
  }
  scoreDOM.innerText = `🏁: 0`;
}

// HUD moedas inicial
function setupCoinHUD() {
  let coinDOM = document.getElementById("coin-score");
  if (!coinDOM) {
    coinDOM = document.createElement("div");
    coinDOM.id = "coin-score";
    coinDOM.style.position = "absolute";
    coinDOM.style.top = "25px";
    coinDOM.style.right = "25px";
    coinDOM.style.fontSize = "1.8em";
    coinDOM.style.color = "gold";
    coinDOM.style.fontFamily = "Press Start 2P, cursive";
    coinDOM.style.textShadow = "2px 2px 4px #000";
    coinDOM.style.zIndex = "1000";
    coinDOM.style.lineHeight = "1.4";
    document.body.appendChild(coinDOM);
  }
  const totalCoins = getTotalCoins();
  coinDOM.innerHTML = `🪙 Total: ${totalCoins}<br>Session: +0`;
}

// Adicione esta função para criar uma barra vertical de botões no lado esquerdo
function setupSidebarButtons() {
  let sidebar = document.getElementById("sidebar-btns");
  if (!sidebar) {
    sidebar = document.createElement("div");
    sidebar.id = "sidebar-btns";
    sidebar.style.position = "absolute";
    sidebar.style.top = "140px"; 
    sidebar.style.left = "0";
    sidebar.style.width = "95px"; 
    sidebar.style.background = "rgba(30,40,60,0.85)";
    sidebar.style.borderRadius = "0 28px 28px 0";
    sidebar.style.boxShadow = "2px 0 16px #0003";
    sidebar.style.display = "flex";
    sidebar.style.flexDirection = "column";
    sidebar.style.alignItems = "center";
    sidebar.style.padding = "28px 0"; 
    sidebar.style.gap = "28px"; 
    sidebar.style.zIndex = "1002";
    document.body.appendChild(sidebar);
  }

  // Botão personagem 
  let charBtn = document.getElementById("change-character-btn");
  if (!charBtn) {
    charBtn = document.createElement("button");
    charBtn.id = "change-character-btn";
    charBtn.title = "Change Character";
    charBtn.innerHTML = "👤";
    charBtn.style.fontSize = "2.2em";
    charBtn.style.background = "#2196f3";
    charBtn.style.color = "#fff";
    charBtn.style.border = "none";
    charBtn.style.borderRadius = "50%";
    charBtn.style.width = "60px";
    charBtn.style.height = "60px"; 
    charBtn.style.display = "flex";
    charBtn.style.alignItems = "center";
    charBtn.style.justifyContent = "center";
    charBtn.style.boxShadow = "0 2px 8px #0003";
    charBtn.style.cursor = "pointer";
    charBtn.style.transition = "background 0.2s";

    charBtn.onclick = () => {
      const overlay = document.getElementById("character-big-overlay");
      if (overlay) {
        closeCharacterOverlay();
      } else {
        showCharacterWindow();
      }
    };
    sidebar.appendChild(charBtn);
  }

  // Botão Power-ups
  let puBtn = document.getElementById("powerup-btn");
  if (!puBtn) {
    puBtn = document.createElement("button");
    puBtn.id = "powerup-btn";
    puBtn.title = "Power-up Shop";
    puBtn.innerHTML = "⚡";
    puBtn.style.cssText = charBtn.style.cssText;

    puBtn.onclick = () => {
      const overlay = document.getElementById("powerup-shop-overlay");
      if (overlay) {
        closePowerUpOverlay();
      } else {
        showPowerUpShop();
      }
    };
    sidebar.appendChild(puBtn);
  }
}

// Função para exibir a loja de power-ups 
function showPowerUpShop() {
  if (document.getElementById("powerup-shop-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "powerup-shop-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "50%";
  overlay.style.left = "50%";
  overlay.style.transform = "translate(-50%, -50%)";
  overlay.style.width = "950px";
  overlay.style.height = "600px";
  overlay.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  overlay.style.borderRadius = "25px";
  overlay.style.boxShadow = "0 25px 50px rgba(0,0,0,0.25)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "row";
  overlay.style.alignItems = "stretch";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "99999";
  overlay.style.fontFamily = '"Press Start 2P", cursive';
  overlay.style.overflow = "hidden";
  overlay.style.opacity = "0";
  overlay.style.pointerEvents = "auto";
  overlay.classList.add("character-overlay-enter");
  document.body.appendChild(overlay);

  // Efeito de entrada 
  setTimeout(() => {
    overlay.style.opacity = "1";
    overlay.classList.remove("character-overlay-enter");
  }, 10);

  // Clique fora da caixa fecha o overlay
  function handleOverlayClick(e) {
    if (e.target === overlay) {
      closePowerUpOverlay();
    }
  }
  overlay.addEventListener("mousedown", handleOverlayClick);

  // Fechar ao pressionar ESC
  function escListener(e) {
    if (e.key === "Escape") {
      closePowerUpOverlay();
    }
  }
  document.addEventListener("keydown", escListener);

  // Limpeza de listeners ao fechar
  function cleanupListeners() {
    document.removeEventListener("keydown", escListener);
    overlay.removeEventListener("mousedown", handleOverlayClick);
  }

  // Botão de fechar (X) 
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✕";
  closeBtn.title = "Fechar";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "18px";
  closeBtn.style.right = "28px";
  closeBtn.style.width = "48px";
  closeBtn.style.height = "48px";
  closeBtn.style.fontSize = "2em";
  closeBtn.style.background = "rgba(30,40,60,0.95)";
  closeBtn.style.color = "#fff";
  closeBtn.style.border = "none";
  closeBtn.style.borderRadius = "50%";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.zIndex = "10001";
  closeBtn.style.boxShadow = "0 2px 8px #0007";
  closeBtn.style.display = "flex";
  closeBtn.style.alignItems = "center";
  closeBtn.style.justifyContent = "center";
  closeBtn.style.transition = "background 0.2s, color 0.2s, box-shadow 0.2s";
  closeBtn.onmouseenter = () => {
    closeBtn.style.background = "#ffd700";
    closeBtn.style.color = "#222";
    closeBtn.style.boxShadow = "0 4px 16px #ffd70088";
  };
  closeBtn.onmouseleave = () => {
    closeBtn.style.background = "rgba(30,40,60,0.95)";
    closeBtn.style.color = "#fff";
    closeBtn.style.boxShadow = "0 2px 8px #0007";
  };
  closeBtn.onclick = () => {
    overlay.classList.add("character-overlay-exit");
    overlay.style.opacity = "0";
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 350);
    cleanupListeners();
  };
  overlay.appendChild(closeBtn);

  // Coluna esquerda
  const left = document.createElement("div");
  left.style.flex = "0 0 420px";
  left.style.height = "100%";
  left.style.display = "flex";
  left.style.flexDirection = "column";
  left.style.alignItems = "center";
  left.style.justifyContent = "center";
  left.style.background = "linear-gradient(145deg, #f8f9ff 0%, #e6ebff 100%)";
  left.style.borderRadius = "25px 0 0 25px";
  left.style.padding = "30px";
  left.style.boxShadow = "inset 0 0 30px rgba(0,0,0,0.05)";
  overlay.appendChild(left);

  // Título da coluna esquerda
  const previewTitle = document.createElement("div");
  previewTitle.innerText = "Superpower Preview";
  previewTitle.style.fontSize = "1.4em";
  previewTitle.style.color = "#4a5568";
  previewTitle.style.fontWeight = "bold";
  previewTitle.style.textAlign = "center";
  previewTitle.style.marginBottom = "25px";
  previewTitle.style.padding = "15px 25px";
  previewTitle.style.background = "rgba(255,255,255,0.8)";
  previewTitle.style.borderRadius = "15px";
  previewTitle.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
  left.appendChild(previewTitle);

  // Container para preview do power-up selecionado
  const previewContainer = document.createElement("div");
  previewContainer.style.width = "280px";
  previewContainer.style.height = "220px";
  previewContainer.style.background = "radial-gradient(circle at 30% 20%, #a8edea 0%, #fed6e3 100%)";
  previewContainer.style.borderRadius = "20px";
  previewContainer.style.display = "flex";
  previewContainer.style.flexDirection = "column";
  previewContainer.style.alignItems = "center";
  previewContainer.style.justifyContent = "center";
  previewContainer.style.boxShadow = "0 15px 35px rgba(0,0,0,0.1)";
  previewContainer.style.marginBottom = "25px";
  left.appendChild(previewContainer);

  // Ícone grande do power-up
  const previewIcon = document.createElement("div");
  previewIcon.style.fontSize = "4em";
  previewIcon.style.marginBottom = "15px";
  previewIcon.innerText = "⚡";
  previewContainer.appendChild(previewIcon);

  // Nome do power-up
  const previewName = document.createElement("div");
  previewName.style.fontSize = "1.2em";
  previewName.style.color = "#2d3748";
  previewName.style.fontWeight = "bold";
  previewName.style.textAlign = "center";
  previewName.style.marginBottom = "8px";
  previewName.innerText = "Speed Boost";
  previewContainer.appendChild(previewName);

  // Descrição do power-up
  const previewDesc = document.createElement("div");
  previewDesc.style.fontSize = "0.8em";
  previewDesc.style.color = "#4a5568";
  previewDesc.style.textAlign = "center";
  previewDesc.style.lineHeight = "1.4";
  previewDesc.style.padding = "0 15px";
  previewDesc.innerText = "Increases movement speed";
  previewContainer.appendChild(previewDesc);

  // Saldo de moedas 
  const coinBalance = document.createElement("div");
  coinBalance.style.fontSize = "1.2em";
  coinBalance.style.color = "#f6ad55";
  coinBalance.style.fontWeight = "bold";
  coinBalance.style.textAlign = "center";
  coinBalance.style.padding = "12px 20px";
  coinBalance.style.background = "rgba(246,173,85,0.1)";
  coinBalance.style.borderRadius = "15px";
  coinBalance.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
  coinBalance.innerHTML = `🪙 Balance: ${getTotalCoins() + window.currentSessionCoins}`;
  left.appendChild(coinBalance);

  // Coluna direita: lista de power-ups
  const right = document.createElement("div");
  right.style.flex = "1";
  right.style.height = "100%";
  right.style.overflowY = "auto";
  right.style.background = "linear-gradient(145deg, #ffffff 0%, #f7fafc 100%)";
  right.style.borderRadius = "0 25px 25px 0";
  right.style.display = "flex";
  right.style.flexDirection = "column";
  right.style.alignItems = "center";
  right.style.padding = "25px 20px";
  overlay.appendChild(right);

  // Título da loja
  const title = document.createElement("div");
  title.innerText = "Superpower Shop";
  title.style.fontSize = "1.6em";
  title.style.color = "#2d3748";
  title.style.fontWeight = "bold";
  title.style.marginBottom = "25px";
  title.style.textAlign = "center";
  title.style.padding = "15px 25px";
  title.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  title.style.color = "#fff";
  title.style.borderRadius = "20px";
  title.style.boxShadow = "0 10px 25px rgba(102,126,234,0.3)";
  title.style.textShadow = "0 2px 4px rgba(0,0,0,0.3)";
  right.appendChild(title);

  let selectedPowerUp = 0;

  // Função para renderizar lista de power-ups
  function renderPowerUpList() {
    while (right.children.length > 1) {
      right.removeChild(right.lastChild);
    }
    
    powerUps.forEach((pu, idx) => {
      const powerUpBox = document.createElement("div");
      powerUpBox.style.width = "95%";
      powerUpBox.style.margin = "8px 0";
      powerUpBox.style.padding = "18px 20px";
      powerUpBox.style.borderRadius = "18px";
      powerUpBox.style.background = "linear-gradient(135deg, #ffffff 0%, #f0fff4 100%)";
      powerUpBox.style.display = "flex";
      powerUpBox.style.alignItems = "center";
      powerUpBox.style.cursor = "pointer";
      powerUpBox.style.transition = "all 0.3s ease";
      powerUpBox.style.position = "relative";
      powerUpBox.style.border = idx === selectedPowerUp 
        ? "3px solid #667eea"
        : "2px solid #e2e8f0";
      powerUpBox.style.fontWeight = idx === selectedPowerUp ? "bold" : "normal";
      powerUpBox.style.boxShadow = idx === selectedPowerUp 
        ? "0 15px 35px rgba(102,126,234,0.25)"
        : "0 5px 15px rgba(0,0,0,0.08)";
      
      powerUpBox.onmouseenter = () => {
        if (idx !== selectedPowerUp) {
          powerUpBox.style.transform = "translateY(-3px)";
          powerUpBox.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
          powerUpBox.style.border = "2px solid #667eea";
        }
      };
      powerUpBox.onmouseleave = () => {
        if (idx !== selectedPowerUp) {
          powerUpBox.style.transform = "translateY(0)";
          powerUpBox.style.boxShadow = "0 5px 15px rgba(0,0,0,0.08)";
          powerUpBox.style.border = "2px solid #e2e8f0";
        }
      };
      
      // Nome e icon do power-up
      const iconName = document.createElement("div");
      iconName.style.display = "flex";
      iconName.style.alignItems = "center";
      iconName.style.flex = "1";
      iconName.innerHTML = `<span style="font-size:1.8em;margin-right:15px;">${pu.icon}</span> <span style="color:#2d3748;font-size:1.1em;font-weight:600;">${pu.name}</span>`;
      powerUpBox.appendChild(iconName);

      powerUpBox.onclick = () => selectPowerUp(idx);

      // Preço
      const price = document.createElement("span");
      price.innerText = `${pu.price || 0}🪙`;
      price.style.marginLeft = "auto";
      price.style.marginRight = "12px";
      price.style.color = "#f6ad55";
      price.style.fontWeight = "bold";
      price.style.fontSize = "1.1em";
      price.style.padding = "5px 10px";
      price.style.background = "rgba(246,173,85,0.1)";
      price.style.borderRadius = "10px";
      powerUpBox.appendChild(price);

      // Botão de compra
      const canAfford = (getTotalCoins() + window.currentSessionCoins) >= (pu.price || 0);
      const buyBtn = document.createElement("button");
      buyBtn.innerText = canAfford ? "Buy" : "Can't Afford";
      buyBtn.style.fontSize = "0.9em";
      buyBtn.style.padding = "10px 20px";
      buyBtn.style.borderRadius = "12px";
      buyBtn.style.background = canAfford 
        ? "linear-gradient(135deg, #48bb78 0%, #38a169 100%)"
        : "linear-gradient(135deg, #a0aec0 0%, #718096 100%)";
      buyBtn.style.color = "#fff";
      buyBtn.style.fontWeight = "bold";
      buyBtn.style.border = "none";
      buyBtn.style.cursor = canAfford ? "pointer" : "not-allowed";
      buyBtn.style.transition = "all 0.3s ease";
      buyBtn.style.boxShadow = canAfford 
        ? "0 5px 15px rgba(72,187,120,0.3)"
        : "0 2px 8px rgba(160,174,192,0.3)";
      
      if (canAfford) {
        buyBtn.onmouseenter = () => {
          buyBtn.style.transform = "translateY(-2px)";
          buyBtn.style.boxShadow = "0 8px 20px rgba(72,187,120,0.4)";
        };
        buyBtn.onmouseleave = () => {
          buyBtn.style.transform = "translateY(0)";
          buyBtn.style.boxShadow = "0 5px 15px rgba(72,187,120,0.3)";
        };
      }
      
      buyBtn.onclick = (e) => {
        e.stopPropagation();
        if (canAfford && buyPowerUp(idx)) {
          buyBtn.innerText = "Purchased!";
          buyBtn.style.background = "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)";
          coinBalance.innerHTML = `🪙 Balance: ${getTotalCoins() + window.currentSessionCoins}`;
          setTimeout(() => {
            renderPowerUpList(); 
          }, 1200);
        }
      };
      powerUpBox.appendChild(buyBtn);

      right.appendChild(powerUpBox);
    });
  }

  // Função para selecionar power-up e atualizar preview
  function selectPowerUp(idx) {
    selectedPowerUp = idx;
    const pu = powerUps[idx];
    
    // Atualizar preview
    previewIcon.innerText = pu.icon;
    previewName.innerText = pu.name;
    previewDesc.innerText = pu.description;
    
    // Re-render list to update selection
    renderPowerUpList();
  }

  
  selectPowerUp(0);

  
  function closePowerUpOverlay() {
    overlay.classList.add("character-overlay-exit");
    overlay.style.opacity = "0";
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 350);
    cleanupListeners();
  }

  window.closePowerUpOverlay = closePowerUpOverlay;
}

// Função para exibir a janela de personalização do personagem
function showCharacterWindow() {
  if (inCustomization) return;
  inCustomization = true;

  let overlay = document.createElement("div");
  overlay.id = "character-big-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "50%";
  overlay.style.left = "50%";
  overlay.style.transform = "translate(-50%, -50%)";
  overlay.style.width = "950px";
  overlay.style.height = "600px";
  overlay.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  overlay.style.borderRadius = "25px";
  overlay.style.boxShadow = "0 25px 50px rgba(0,0,0,0.25)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "row";
  overlay.style.alignItems = "stretch";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "99999";
  overlay.style.fontFamily = '"Press Start 2P", cursive';
  overlay.style.overflow = "hidden";
  overlay.style.opacity = "0";
  overlay.style.pointerEvents = "auto";
  overlay.classList.add("character-overlay-enter");
  document.body.appendChild(overlay);

  // Efeito de entrada 
  setTimeout(() => {
    overlay.style.opacity = "1";
    overlay.classList.remove("character-overlay-enter");
  }, 10);

  // Clique fora da caixa fecha o overlay
  function handleOverlayClick(e) {
    if (e.target === overlay) {
      closeCharacterOverlay();
    }
  }
  overlay.addEventListener("mousedown", handleOverlayClick);

  // Fechar ao pressionar ESC
  function escListener(e) {
    if (e.key === "Escape") {
      closeCharacterOverlay();
    }
  }
  document.addEventListener("keydown", escListener);

  // Limpeza de listeners ao fechar
  function cleanupListeners() {
    document.removeEventListener("keydown", escListener);
    overlay.removeEventListener("mousedown", handleOverlayClick);
  }

  // Botão de fechar (X) para a loja de personagens
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✕";
  closeBtn.title = "Fechar";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "18px";
  closeBtn.style.right = "28px";
  closeBtn.style.width = "48px";
  closeBtn.style.height = "48px";
  closeBtn.style.fontSize = "2em";
  closeBtn.style.background = "rgba(30,40,60,0.95)";
  closeBtn.style.color = "#fff";
  closeBtn.style.border = "none";
  closeBtn.style.borderRadius = "50%";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.zIndex = "10001";
  closeBtn.style.boxShadow = "0 2px 8px #0007";
  closeBtn.style.display = "flex";
  closeBtn.style.alignItems = "center";
  closeBtn.style.justifyContent = "center";
  closeBtn.style.transition = "background 0.2s, color 0.2s, box-shadow 0.2s";
  closeBtn.onmouseenter = () => {
    closeBtn.style.background = "#ffd700";
    closeBtn.style.color = "#222";
    closeBtn.style.boxShadow = "0 4px 16px #ffd70088";
  };
  closeBtn.onmouseleave = () => {
    closeBtn.style.background = "rgba(30,40,60,0.95)";
    closeBtn.style.color = "#fff";
    closeBtn.style.boxShadow = "0 2px 8px #0007";
  };
  closeBtn.onclick = () => {
    overlay.classList.add("character-overlay-exit");
    overlay.style.opacity = "0";
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      inCustomization = false;
    }, 350);
  };
  overlay.appendChild(closeBtn);

  // Coluna esquerda: preview 3D
  const left = document.createElement("div");
  left.style.flex = "0 0 420px";
  left.style.height = "100%";
  left.style.display = "flex";
  left.style.flexDirection = "column";
  left.style.alignItems = "center";
  left.style.justifyContent = "center";
  left.style.background = "linear-gradient(145deg, #f8f9ff 0%, #e6ebff 100%)";
  left.style.borderRadius = "25px 0 0 25px";
  left.style.padding = "30px";
  left.style.boxShadow = "inset 0 0 30px rgba(0,0,0,0.05)";
  overlay.appendChild(left);

  // Container para canvas e cadeado
  const previewContainer = document.createElement("div");
  previewContainer.style.position = "relative";
  previewContainer.style.width = "320px";
  previewContainer.style.height = "380px";
  previewContainer.style.borderRadius = "20px";
  previewContainer.style.overflow = "hidden";
  previewContainer.style.boxShadow = "0 15px 35px rgba(0,0,0,0.1)";
  left.appendChild(previewContainer);

  // Canvas para personagem 
  const charCanvas = document.createElement("canvas");
  charCanvas.width = 320;
  charCanvas.height = 380;
  charCanvas.style.background = "radial-gradient(circle at 30% 20%, #a8edea 0%, #fed6e3 100%)";
  charCanvas.style.borderRadius = "20px";
  charCanvas.style.display = "block";
  previewContainer.appendChild(charCanvas);

  // Cadeado sobre o canvas (aparece se bloqueado)
  const lockIcon = document.createElement("div");
  lockIcon.innerText = "🔒";
  lockIcon.style.position = "absolute";
  lockIcon.style.top = "50%";
  lockIcon.style.left = "50%";
  lockIcon.style.transform = "translate(-50%, -50%)";
  lockIcon.style.fontSize = "5em";
  lockIcon.style.color = "#bfa100";
  lockIcon.style.pointerEvents = "none";
  lockIcon.style.display = "none";
  previewContainer.appendChild(lockIcon);

  // Nome da skin
  const skinName = document.createElement("div");
  skinName.style.fontSize = "1.3em";
  skinName.style.marginTop = "25px";
  skinName.style.color = "#4a5568";
  skinName.style.textShadow = "none";
  skinName.style.fontWeight = "bold";
  skinName.style.textAlign = "center";
  skinName.style.padding = "10px 20px";
  skinName.style.background = "rgba(255,255,255,0.8)";
  skinName.style.borderRadius = "15px";
  skinName.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
  left.appendChild(skinName);

  // Botões de navegação
  const arrows = document.createElement("div");
  arrows.style.display = "flex";
  arrows.style.justifyContent = "center";
  arrows.style.alignItems = "center";
  arrows.style.marginTop = "20px";
  arrows.style.gap = "15px";
  left.appendChild(arrows);

  const leftBtn = document.createElement("button");
  leftBtn.innerHTML = "&#8592;";
  leftBtn.style.fontSize = "1.8em";
  leftBtn.style.cursor = "pointer";
  leftBtn.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  leftBtn.style.color = "#fff";
  leftBtn.style.border = "none";
  leftBtn.style.borderRadius = "15px";
  leftBtn.style.width = "55px";
  leftBtn.style.height = "55px";
  leftBtn.style.boxShadow = "0 8px 20px rgba(102,126,234,0.3)";
  leftBtn.style.transition = "all 0.3s ease";
  arrows.appendChild(leftBtn);

  const rightBtn = document.createElement("button");
  rightBtn.innerHTML = "&#8594;";
  rightBtn.style.fontSize = "1.8em";
  rightBtn.style.cursor = "pointer";
  rightBtn.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  rightBtn.style.color = "#fff";
  rightBtn.style.border = "none";
  rightBtn.style.borderRadius = "15px";
  rightBtn.style.width = "55px";
  rightBtn.style.height = "55px";
  rightBtn.style.boxShadow = "0 8px 20px rgba(102,126,234,0.3)";
  rightBtn.style.transition = "all 0.3s ease";
  arrows.appendChild(rightBtn);

  // Coluna direita: lista de skins
  const right = document.createElement("div");
  right.style.flex = "1";
  right.style.height = "100%";
  right.style.overflowY = "auto";
  right.style.background = "linear-gradient(145deg, #ffffff 0%, #f7fafc 100%)";
  right.style.borderRadius = "0 25px 25px 0";
  right.style.display = "flex";
  right.style.flexDirection = "column";
  right.style.alignItems = "center";
  right.style.padding = "25px 20px";
  overlay.appendChild(right);

  // Título da loja
  const title = document.createElement("div");
  title.innerText = "Character Shop";
  title.style.fontSize = "1.6em";
  title.style.color = "#2d3748";
  title.style.fontWeight = "bold";
  title.style.marginBottom = "25px";
  title.style.textAlign = "center";
  title.style.padding = "15px 25px";
  title.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  title.style.color = "#fff";
  title.style.borderRadius = "20px";
  title.style.boxShadow = "0 10px 25px rgba(102,126,234,0.3)";
  title.style.textShadow = "0 2px 4px rgba(0,0,0,0.3)";
  right.appendChild(title);

  // Estado de skin selecionado
  const unlockedSkins = getUnlockedSkins();
  let selectedSkin = getSelectedSkinIndex(); 
  if (selectedSkin < 0) selectedSkin = 0;

  function renderSkinList() {
    // Limpa a lista de skins
    while (right.children.length > 1) {
      right.removeChild(right.lastChild);
    }
    
    playerSkins.forEach((skin, idx) => {
      const skinBox = document.createElement("div");
      skinBox.style.width = "95%";
      skinBox.style.margin = "8px 0";
      skinBox.style.padding = "18px 20px";
      skinBox.style.borderRadius = "18px";
      skinBox.style.background = unlockedSkins[idx] 
        ? "linear-gradient(135deg, #ffffff 0%, #f0fff4 100%)"
        : "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)";
      skinBox.style.display = "flex";
      skinBox.style.alignItems = "center";
      skinBox.style.cursor = "pointer";
      skinBox.style.transition = "all 0.3s ease";
      skinBox.style.position = "relative";
      skinBox.style.border = idx === selectedSkin 
        ? "3px solid #667eea"
        : unlockedSkins[idx] 
          ? "2px solid #e2e8f0" 
          : "2px solid #cbd5e0";
      skinBox.style.fontWeight = idx === selectedSkin ? "bold" : "normal";
      skinBox.style.boxShadow = idx === selectedSkin 
        ? "0 15px 35px rgba(102,126,234,0.25)"
        : "0 5px 15px rgba(0,0,0,0.08)";
      
      // Efeito hover
      skinBox.onmouseenter = () => {
        if (idx !== selectedSkin) {
          skinBox.style.transform = "translateY(-3px)";
          skinBox.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
          skinBox.style.border = unlockedSkins[idx] ? "2px solid #667eea" : "2px solid #a0aec0";
        }
      };
      skinBox.onmouseleave = () => {
        if (idx !== selectedSkin) {
          skinBox.style.transform = "translateY(0)";
          skinBox.style.boxShadow = "0 5px 15px rgba(0,0,0,0.08)";
          skinBox.style.border = unlockedSkins[idx] ? "2px solid #e2e8f0" : "2px solid #cbd5e0";
        }
      };
      
      // Nome e ícone da skin
      const iconName = document.createElement("div");
      iconName.style.display = "flex";
      iconName.style.alignItems = "center";
      iconName.style.flex = "1";
      iconName.innerHTML = `<span style="font-size:1.8em;margin-right:15px;">🎨</span> <span style="color:#2d3748;font-size:1.1em;font-weight:600;">${skin.name}</span>`;
      skinBox.appendChild(iconName);

      // Permitir clicar em qualquer skinBox para trocar o preview do boneco
      skinBox.onclick = () => selectSkin(idx);

      if (!unlockedSkins[idx]) {
        // Mostra o preço
        const price = document.createElement("span");
        price.innerText = `${skinPrices[idx]}🪙`;
        price.style.marginLeft = "auto";
        price.style.marginRight = "12px";
        price.style.color = "#f6ad55";
        price.style.fontWeight = "bold";
        price.style.fontSize = "1.1em";
        price.style.padding = "5px 10px";
        price.style.background = "rgba(246,173,85,0.1)";
        price.style.borderRadius = "10px";
        skinBox.appendChild(price);

        const buyBtn = document.createElement("button");
        buyBtn.innerText = "Buy";
        buyBtn.style.fontSize = "0.9em";
        buyBtn.style.padding = "10px 20px";
        buyBtn.style.borderRadius = "12px";
        buyBtn.style.background = "linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)";
        buyBtn.style.color = "#fff";
        buyBtn.style.fontWeight = "bold";
        buyBtn.style.border = "none";
        buyBtn.style.cursor = "pointer";
        buyBtn.style.transition = "all 0.3s ease";
        buyBtn.style.boxShadow = "0 5px 15px rgba(246,173,85,0.3)";
        buyBtn.onmouseenter = () => {
          buyBtn.style.transform = "translateY(-2px)";
          buyBtn.style.boxShadow = "0 8px 20px rgba(246,173,85,0.4)";
        };
        buyBtn.onmouseleave = () => {
          buyBtn.style.transform = "translateY(0)";
          buyBtn.style.boxShadow = "0 5px 15px rgba(246,173,85,0.3)";
        };
        buyBtn.onclick = (e) => {
          e.stopPropagation();
          if (tryBuySkin(idx)) {
            // Atualiza imediatamente o array de desbloqueadas e o índice selecionado
            unlockedSkins[idx] = true;
            setSelectedSkinIndex(idx);
            setPlayerSkin(idx);
            renderSkinList();
            renderCharacter();
            showSkinPurchaseConfirmation(playerSkins[idx], idx);
          }
        };
        skinBox.appendChild(buyBtn);

        const lock = document.createElement("span");
        lock.innerText = "🔒";
        lock.style.marginLeft = "8px";
        lock.style.fontSize = "1.3em";
        lock.style.opacity = "0.6";
        skinBox.appendChild(lock);
      } else {
        // Adiciona indicador de desbloqueada
        const unlockedIcon = document.createElement("span");
        unlockedIcon.innerText = "✓";
        unlockedIcon.style.marginLeft = "auto";
        unlockedIcon.style.fontSize = "1.8em";
        unlockedIcon.style.color = "#48bb78";
        unlockedIcon.style.fontWeight = "bold";
        unlockedIcon.style.padding = "5px";
        unlockedIcon.style.background = "rgba(72,187,120,0.1)";
        unlockedIcon.style.borderRadius = "50%";
        skinBox.appendChild(unlockedIcon);
      }
      right.appendChild(skinBox);
    });
  }

  // Mostra o preview de qualquer skin, mas só aplica ao player do jogo se desbloqueada
  function selectSkin(idx) {
    selectedSkin = idx;
    setSelectedSkinIndex(idx); 
    skinName.innerText = playerSkins[selectedSkin].name;
    renderSkinList();
    renderCharacter();

    // Se a skin está bloqueada, mostra cadeado e força o player do jogo para o clássico
    if (!unlockedSkins[selectedSkin]) {
      lockIcon.style.display = "block";
      setPlayerSkin(playerSkins[0]);
      setSelectedSkinIndex(0);
    } else {
      lockIcon.style.display = "none";
      setPlayerSkin(playerSkins[selectedSkin]);
    }
  }

  leftBtn.onclick = () => {
    selectedSkin = (selectedSkin - 1 + playerSkins.length) % playerSkins.length;
    selectSkin(selectedSkin);
  };
  rightBtn.onclick = () => {
    selectedSkin = (selectedSkin + 1) % playerSkins.length;
    selectSkin(selectedSkin);
  };

  // Fechar overlay ao pressionar ESC
  function escListener(e) {
    if (e.key === "Escape") {
      closeOverlayWithEffect();
    }
  }
  document.addEventListener("keydown", escListener);


  // Renderiza personagem 3D no canvas 
  let charScene, charCamera, charRenderer;
  function renderCharacter() {
    if (!charScene) {
      charScene = new THREE.Scene();
      charCamera = new THREE.PerspectiveCamera(45, 320/380, 0.1, 1000);
      charCamera.position.set(0, -60, 32);
      charCamera.lookAt(0, 0, 14);
      charRenderer = new THREE.WebGLRenderer({ canvas: charCanvas, alpha: true, antialias: true });
      charRenderer.setClearColor(0x000000, 0);
      charRenderer.setSize(320, 380);
      
      const light = new THREE.DirectionalLight(0xffffff, 1.2);
      light.position.set(0, -40, 60);
      charScene.add(light);
      charScene.add(new THREE.AmbientLight(0xffffff, 0.7));
    }
    // Limpa modelos antigos 
    charScene.children
      .filter(obj => obj.type !== "DirectionalLight" && obj.type !== "AmbientLight")
      .forEach(obj => charScene.remove(obj));
    // Adiciona smepre o modelo preview da skin selecionada
    const previewModel = createPlayerPreviewModel(playerSkins[selectedSkin]);
    charScene.add(previewModel);
    charRenderer.render(charScene, charCamera);
  }

  
  selectSkin(selectedSkin);
}

// Adicione  animação de entrada/saída do overlay
if (!document.getElementById("character-overlay-style")) {
  const style = document.createElement("style");
  style.id = "character-overlay-style";
  style.innerHTML = `
  .character-overlay-enter {
    animation: overlayIn 0.35s cubic-bezier(.4,2,.6,1) both;
  }
  .character-overlay-exit {
    animation: overlayOut 0.35s cubic-bezier(.4,2,.6,1) both;
  }
  @keyframes overlayIn {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.7);}
    100% { opacity: 1; transform: translate(-50%, -50%) scale(1);}
  }
  @keyframes overlayOut {
    0% { opacity: 1; transform: translate(-50%, -50%) scale(1);}
    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.7);}
  }
  `;
  document.head.appendChild(style);
}

// Bloqueia input enquanto overlay ativo
window.isStartOverlayActive = () => startActive;

// Ciclo de animação principal
function animate() {
  animateVehicles();
  animatePlayer();
  animateCoin();
  animatePortal();
  coinCatch();
  hitTest();
  updateShadowPosition();
  if (window.activeMagnetEffect) {
    window.activeMagnetEffect();
  }
  if (thirdPerson) {
    setThirdPersonCamera();
  } else if (player.position.y >= 0) {
    camera.position.x = player.position.x + 300;
    camera.position.y = player.position.y - 300;
    camera.position.z = 300;
    camera.lookAt(player.position.x, player.position.y, 0);
  } else {
    camera.position.set(300, -300, 300);
    camera.lookAt(0, 0, 0);
  }
  const currentRow = Math.round(player.position.y / 65);
  if (lastRow < 0 && currentRow === 0 && !startActive) {
    showStartOverlay();
    const charBtn = document.getElementById("change-character-btn");
    const puBtn = document.getElementById("powerup-btn");
    if (charBtn) {
      charBtn.disabled = true;
      charBtn.style.opacity = "0.5";
      charBtn.style.cursor = "not-allowed";
      charBtn.style.background = "#666";
    }
    if (puBtn) {
      puBtn.disabled = true;
      puBtn.style.opacity = "0.5";
      puBtn.style.cursor = "not-allowed";
      puBtn.style.background = "#666";
    }
    updateSuperpowerButtonStates(false);
  } else if (lastRow === 0 && currentRow < 0) {
    const charBtn = document.getElementById("change-character-btn");
    const puBtn = document.getElementById("powerup-btn");
    if (charBtn) {
      charBtn.disabled = false;
      charBtn.style.opacity = "1";
      charBtn.style.cursor = "pointer";
      charBtn.style.background = "#2196f3";
    }
    if (puBtn) {
      puBtn.disabled = false;
      puBtn.style.opacity = "1";
      puBtn.style.cursor = "pointer";
      puBtn.style.background = "#2196f3";
    }
    updateSuperpowerButtonStates(true);
  }
  lastRow = currentRow;
  renderer.render(scene, camera);
}

// Mostra overlay de início e inicia novo jogo
function showStartOverlay() {
  const startOverlay = document.getElementById("start-overlay");
  if (!startOverlay) return;
  startActive = true;
  startOverlay.style.visibility = "visible";
  startOverlay.style.opacity = "1";
  startGame();
  setTimeout(() => {
    startOverlay.style.opacity = "0";
    setTimeout(() => {
      startOverlay.style.visibility = "hidden";
      startActive = false;
    }, 400);
  }, 1000);
}

// Atualiza HUD score
export function updateScoreHUD(newScore) {
  let scoreDOM = document.getElementById("score-hud");
  if (scoreDOM) {
    scoreDOM.innerText = `🏁: ${newScore}`;
  }
  checkScoreBonus(newScore);
}
window.updateScoreHUD = updateScoreHUD;

// Adicione esta função utilitária para chamar o bônus manualmente
import { coinCatch as coinCatchModule } from "./CoinCatch";
function checkMilestoneBonusesAfterTeleport() {
  
  if (typeof coinCatchModule === "function") {
    coinCatchModule();
  }
}

// Verifica bônus de moedas após teleporte
window.checkMilestoneBonusesAfterTeleport = checkMilestoneBonusesAfterTeleport;

function saveCoinsOnGameOver() {
  endGame(); 
}

// Função para mostrar a tela de game over
window.showGameOverScreen = function() {
  saveCoinsOnGameOver();
  
  const result = document.getElementById("result-container");
  const finalScore = document.getElementById("final-score");
  if (result) {
    result.style.display = "flex";
    result.style.visibility = "visible";
    
    addRevivalButton(result);
  }
  // Atualize a pontuação final 
  if (finalScore && typeof window.position === "object" && typeof window.position.currentRow === "number") {
    finalScore.innerText = window.position.currentRow.toString();
  }
};

function addRevivalButton(resultContainer) {
  
  const existingPanel = document.getElementById("revival-panel");
  if (existingPanel) existingPanel.remove();
  const existingOverlay = document.getElementById("revival-blocker-overlay");
  if (existingOverlay) existingOverlay.remove();

  const extraLives = getExtraLives();
  if (extraLives <= 0) return;

  // Cria overlay transparente para bloquear interação
  const blocker = document.createElement("div");
  blocker.id = "revival-blocker-overlay";
  blocker.style.position = "fixed";
  blocker.style.top = "0";
  blocker.style.left = "0";
  blocker.style.width = "100vw";
  blocker.style.height = "100vh";
  blocker.style.background = "rgba(0,0,0,0.25)";
  blocker.style.zIndex = "10000";
  blocker.style.pointerEvents = "auto";
  document.body.appendChild(blocker);

  // Centraliza o resultContainer no ecrã
  resultContainer.style.position = "fixed";
  resultContainer.style.top = "50%";
  resultContainer.style.left = "50%";
  resultContainer.style.transform = "translate(-50%, -50%)";
  resultContainer.style.zIndex = "10000";
  resultContainer.style.display = "flex";
  resultContainer.style.flexDirection = "column";
  resultContainer.style.alignItems = "center";
  resultContainer.style.justifyContent = "center";

  // Cria o painel reviver 
  const revivalPanel = document.createElement("div");
  revivalPanel.id = "revival-panel";
  revivalPanel.style.position = "fixed";
  revivalPanel.style.top = "50%";
  revivalPanel.style.left = "50%";
  revivalPanel.style.transform = "translate(-50%, -50%)";
  revivalPanel.style.background = "#ff5ca7";
  revivalPanel.style.borderRadius = "18px";
  revivalPanel.style.padding = "32px 28px";
  revivalPanel.style.display = "flex";
  revivalPanel.style.flexDirection = "column";
  revivalPanel.style.alignItems = "center";
  revivalPanel.style.minWidth = "260px";
  revivalPanel.style.boxShadow = "0 4px 24px #0004";
  revivalPanel.style.zIndex = "10001";
  revivalPanel.style.transition = "transform 0.5s cubic-bezier(.4,2,.6,1)";
  // Barra de tempo 
  const duration = 7000; // ms
  const timerBar = document.createElement("div");
  timerBar.style.width = "100%";
  timerBar.style.height = "16px";
  timerBar.style.background = "#fff2";
  timerBar.style.borderRadius = "8px";
  timerBar.style.marginBottom = "18px";
  timerBar.style.overflow = "hidden";
  const timerFill = document.createElement("div");
  timerFill.style.height = "100%";
  timerFill.style.width = "100%";
  timerFill.style.background = "linear-gradient(90deg, #ffb6e6, #ff2e7e)";
  timerFill.style.transition = "width 0.2s linear";
  timerBar.appendChild(timerFill);
  revivalPanel.appendChild(timerBar);

  // Conteúdo reviver
  const content = document.createElement("div");
  content.style.display = "flex";
  content.style.flexDirection = "column";
  content.style.alignItems = "center";

  // Imagem de coração
  const heart = document.createElement("div");
  heart.innerHTML = "❤️";
  heart.style.fontSize = "3em";
  heart.style.marginBottom = "12px";
  content.appendChild(heart);

  // Texto reviver
  const text = document.createElement("div");
  text.innerText = "Revive Player?";
  text.style.fontFamily = '"Press Start 2P", cursive';
  text.style.color = "#fff";
  text.style.fontSize = "1.3em";
  text.style.fontWeight = "bold";
  text.style.marginBottom = "18px";
  text.style.textAlign = "center";
  text.style.textShadow = "1px 1px 2px #0005";
  content.appendChild(text);

  // Botões "Sim" e "Não"
  const btnRow = document.createElement("div");
  btnRow.style.display = "flex";
  btnRow.style.flexDirection = "row";
  btnRow.style.gap = "18px";
  btnRow.style.marginTop = "8px";

  // Botão verde "Sim"
  const btnSim = document.createElement("button");
  btnSim.innerText = "Yes";
  btnSim.style.background = "#2ecc40";
  btnSim.style.color = "#fff";
  btnSim.style.fontSize = "1.1em";
  btnSim.style.fontWeight = "bold";
  btnSim.style.border = "none";
  btnSim.style.borderRadius = "8px";
  btnSim.style.padding = "10px 36px";
  btnSim.style.cursor = "pointer";
  btnSim.style.boxShadow = "0 2px 8px #0002";
  btnSim.style.transition = "background 0.2s";
  btnSim.onmouseenter = () => btnSim.style.background = "#27ae38";
  btnSim.onmouseleave = () => btnSim.style.background = "#2ecc40";
  btnSim.onclick = () => {
    revivePlayer();
    if (revivalPanel.parentNode) revivalPanel.parentNode.removeChild(revivalPanel);
  };
  btnRow.appendChild(btnSim);

  // Botão vermelho "Não"
  const btnNao = document.createElement("button");
  btnNao.innerText = "No";
  btnNao.style.background = "#e74c3c";
  btnNao.style.color = "#fff";
  btnNao.style.fontSize = "1.1em";
  btnNao.style.fontWeight = "bold";
  btnNao.style.border = "none";
  btnNao.style.borderRadius = "8px";
  btnNao.style.padding = "10px 36px";
  btnNao.style.cursor = "pointer";
  btnNao.style.boxShadow = "0 2px 8px #0002";
  btnNao.style.transition = "background 0.2s";
  btnNao.onmouseenter = () => btnNao.style.background = "#c0392b";
  btnNao.onmouseleave = () => btnNao.style.background = "#e74c3c";
  btnNao.onclick = () => {
    if (revivalPanel.parentNode) revivalPanel.parentNode.removeChild(revivalPanel);
  };
  btnRow.appendChild(btnNao);

  content.appendChild(btnRow);
  revivalPanel.appendChild(content);

  // Adiciona o painel revival ao body (acima do overlay)
  document.body.appendChild(revivalPanel);

  // Barra de tempo decrescente
  let start = Date.now();
  let expired = false;
  function updateTimer() {
    let elapsed = Date.now() - start;
    let percent = Math.max(0, 1 - elapsed / duration);
    timerFill.style.width = (percent * 100) + "%";
    if (percent > 0 && !expired) {
      requestAnimationFrame(updateTimer);
    } else {
      btnSim.disabled = true;
      btnSim.style.opacity = 0.5;
      btnNao.disabled = true;
      btnNao.style.opacity = 0.5;
      expired = true;
      setTimeout(() => {
        if (revivalPanel.parentNode) revivalPanel.parentNode.removeChild(revivalPanel);
        if (blocker.parentNode) blocker.parentNode.removeChild(blocker);
      }, 600);
    }
  }
  updateTimer();

  // Ao clicar em Sim ou Não, remove o revivalPanel e o overlay
  btnSim.onclick = () => {
    revivePlayer();
    if (revivalPanel.parentNode) revivalPanel.parentNode.removeChild(revivalPanel);
    if (blocker.parentNode) blocker.parentNode.removeChild(blocker);
  };
  btnNao.onclick = () => {
    if (revivalPanel.parentNode) revivalPanel.parentNode.removeChild(revivalPanel);
    if (blocker.parentNode) blocker.parentNode.removeChild(blocker);
  };
}

// Função para exibir a animação de reviver
function showRevivalAnimation() {
  
  const revivalOverlay = document.createElement("div");
  revivalOverlay.style.position = "fixed";
  revivalOverlay.style.top = "0";
  revivalOverlay.style.left = "0";
  revivalOverlay.style.width = "100vw";
  revivalOverlay.style.height = "100vh";
  revivalOverlay.style.background = "radial-gradient(circle, rgba(255,64,129,0.8) 0%, rgba(233,30,99,0.4) 60%, rgba(0,0,0,0.1) 100%)";
  revivalOverlay.style.zIndex = "99999";
  revivalOverlay.style.display = "flex";
  revivalOverlay.style.alignItems = "center";
  revivalOverlay.style.justifyContent = "center";
  revivalOverlay.style.animation = "revivalPulse 2s ease-in-out";
  revivalOverlay.style.pointerEvents = "none";
  
  if (!document.getElementById("revival-animation-style")) {
    const style = document.createElement("style");
    style.id = "revival-animation-style";
    style.innerHTML = `
      @keyframes revivalPulse {
        0% { opacity: 0; transform: scale(0.5); }
        50% { opacity: 1; transform: scale(1.1); }
        100% { opacity: 0; transform: scale(0.7); }
      }
      @keyframes heartBeat {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3); }
      }
      @keyframes revivalGlow {
        0% { text-shadow: 0 0 10px #ff4081; }
        50% { text-shadow: 0 0  30px #ff4081, 0 0 40px #ff4081; }
        100% { text-shadow: 0 0 10px #ff4081; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Texto de reviver
  const revivalText = document.createElement("div");
  revivalText.innerHTML = "❤️ REVIVED ❤️";
  revivalText.style.fontSize = "4em";
  revivalText.style.color = "white";
  revivalText.style.fontFamily = '"Press Start 2P", cursive';
  revivalText.style.textShadow = "4px 4px 8px rgba(0,0,0,0.8)";
  revivalText.style.animation = "heartBeat 0.8s ease-in-out infinite, revivalGlow 1s ease-in-out infinite";
  revivalText.style.textAlign = "center";
  
  // Texto de escudo
  const shieldText = document.createElement("div");
  shieldText.innerHTML = "🛡️ SHIELD ACTIVATED 🛡️";
  shieldText.style.fontSize = "2em";
  shieldText.style.color = "#00ff88";
  shieldText.style.fontFamily = '"Press Start 2P", cursive';
  shieldText.style.textShadow = "2px 2px 4px rgba(0,0,0,0.8)";
  shieldText.style.marginTop = "20px";
  shieldText.style.animation = "revivalGlow 1.2s ease-in-out infinite";
  shieldText.style.textAlign = "center";
  
  // Container para os textos
  const textContainer = document.createElement("div");
  textContainer.style.display = "flex";
  textContainer.style.flexDirection = "column";
  textContainer.style.alignItems = "center";
  textContainer.appendChild(revivalText);
  textContainer.appendChild(shieldText);
  
  revivalOverlay.appendChild(textContainer);
  document.body.appendChild(revivalOverlay);
  
  // Remove overlay after animation
  setTimeout(() => {
    if (revivalOverlay.parentNode) {
      revivalOverlay.parentNode.removeChild(revivalOverlay);
    }
  }, 2000);
}

function revivePlayer() {
  const extraLives = getExtraLives();
  if (extraLives <= 0) {
    console.log("No extra lives available!");
    return;
  }
  
  // Usa uma vida extra
  if (!useExtraLife()) {
    console.log("Failed to use extra life!");
    return;
  }
  
  updateLifeHUD();
  
  // Faz reset do jogo
  import("./components/Player").then(({ setGameOver, player, position }) => {
    setGameOver(false);
    
    // Hide game over screen
    const result = document.getElementById("result-container");
    if (result) {
      result.style.display = "none";
      result.style.visibility = "hidden";
    }
    
    showRevivalAnimation();
    

    activateRevivalShield(player, scene, 3000);
    
    // Update score HUD
    if (typeof window.updateScoreHUD === "function") {
      window.updateScoreHUD(position.currentRow >= 0 ? position.currentRow : 0);
    }
    
    console.log(`Revived at position ${position.currentRow}! Lives remaining: ${getExtraLives()} - Shield active for 3 seconds`);
  });
}

function activateRevivalShield(player, scene, duration = 3000) {
  // Verifica se o jogador já tem um escudo ativo
  player.userData.hasShield = true;
  player.userData.shieldActive = true;
  
  // Cria o escudo visual
  const shieldGeometry = new THREE.SphereGeometry(25, 32, 32);
  const shieldMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide
  });
  const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
  shield.position.copy(player.position);
  shield.name = "revivalShield";
  scene.add(shield);
  
  // Animação do escudo
  let time = 0;
  const startTime = Date.now();
  
  function animateShield() {
    const elapsed = Date.now() - startTime;
    
    if (elapsed < duration && player.userData.shieldActive) {
      time += 0.15;
      shield.position.copy(player.position);
      shield.position.z += 15;
      shield.rotation.y += 0.03;
      shield.rotation.x += 0.02;
      
      
      const pulse = 1 + Math.sin(time) * 0.15;
      shield.scale.setScalar(pulse);
      

      if (elapsed > duration - 500) {
        const fadeProgress = (elapsed - (duration - 500)) / 500;
        shield.material.opacity = 0.4 * (1 - fadeProgress);
      }
      
      requestAnimationFrame(animateShield);
    } else {
      // Remove o escudo 
      scene.remove(shield);
      player.userData.hasShield = false;
      player.userData.shieldActive = false;
      console.log("Revival shield deactivated");
    }
  }
  
  animateShield();
  console.log(`Revival shield activated for ${duration/1000} seconds`);
}

// Efeito visual do portal 
window.showPortalTeleportEffect = function(duration = 1500) {
  // Remove overlay antigo se existir
  let overlay = document.getElementById("portal-teleport-overlay");
  if (overlay) {
    overlay.remove();
  }
  if (!duration || duration <= 0) return;

  overlay = document.createElement("div");
  overlay.id = "portal-teleport-overlay";
  overlay.style.position = "fixed";
  overlay.style.left = "0";
  overlay.style.top = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.zIndex = "99999";
  overlay.style.pointerEvents = "none";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 0.2s";
  overlay.style.background = "radial-gradient(ellipse at 50% 50%, rgba(124,77,255,0.7) 0%, rgba(33,150,243,0.4) 60%, rgba(0,0,0,0.01) 100%)";
  overlay.style.backdropFilter = "blur(8px)";
  document.body.appendChild(overlay);

  // Animação de opacidade 
  setTimeout(() => { overlay.style.opacity = "1"; }, 10);
  setTimeout(() => { overlay.style.opacity = "0"; }, duration - 200);
  setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, duration);

  // Onda animada 
  if (!document.getElementById("portal-teleport-effect-style")) {
    const style = document.createElement("style");
    style.id = "portal-teleport-effect-style";
    style.innerHTML = `
      #portal-teleport-overlay {
        animation: portalWave 1.5s cubic-bezier(.4,2,.6,1) infinite;
      }
      @keyframes portalWave {
        0% { filter: blur(8px) brightness(1); }
        50% { filter: blur(16px) brightness(1.2); }
        100% { filter: blur(8px) brightness(1); }
      }
    `;
       document.head.appendChild(style);
  }
 }

