const THREE = window.THREE;
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
scene.add(player);
scene.add(map);

// Luz ambiente branca, equilibrada
const ambientLight = new THREE.AmbientLight(0xffffff, 0.74); // intensidade média
scene.add(ambientLight);

// Luz direcional branca, inclinada, com sombras
const dirLight = DirectionalLight();
scene.add(dirLight);

const camera = Camera();
scene.add(camera); // Sempre adiciona ao scene, nunca ao player

const scoreDOM = document.getElementById("score");
const resultDOM = document.getElementById("result-container");

// Preços das skins (primeira é grátis)
const skinPrices = [0, 30, 50, 80];

// Preços e lista de power-ups (valores mais realistas)
const powerUps = [
  { 
    name: superpowers[0]?.name || "Speed Boost",
    description: superpowers[0]?.description || "Increases movement speed",
    icon: superpowers[0]?.icon || "⚡",
    effect: superpowers[0]?.effect || "speedBoost",
    key: superpowers[0]?.key || 'speedBoost',
    price: 0
  },
  { 
    name: superpowers[1]?.name || "Jump",
    description: superpowers[1]?.description || "Allows jumping over obstacles",
    icon: superpowers[1]?.icon || "🦘",
    effect: superpowers[1]?.effect || "jump",
    key: superpowers[1]?.key || 'jump',
    price: 0
  },
  { 
    name: superpowers[2]?.name || "Shield",
    description: superpowers[2]?.description || "Protects from damage",
    icon: superpowers[2]?.icon || "🛡️",
    effect: superpowers[2]?.effect || "shield",
    key: superpowers[2]?.key || 'shield',
    price: 0
  },
  { 
    name: "Extra Life",
    description: "Adds one extra life for revival",
    icon: "❤️",
    effect: "extraLife",
    key: 'extraLife',
    price: 0
  }
];

// Controle de moedas (localStorage para total, sessão para partida atual)
window.currentSessionCoins = 0;     // Moedas ganhas na partida atual
window.bonusGiven = { 100: false, 200: false }; // Para controlar os bónus

// Funções para gerenciar saldo total (localStorage)
function getTotalCoins() {
  return parseInt(localStorage.getItem("totalCoins") || "0", 10);
}
function setTotalCoins(val) {
  localStorage.setItem("totalCoins", String(Math.max(0, val)));
}

// Carrega skins desbloqueadas (localStorage para unlocked, e para skin escolhida)
function getUnlockedSkins() {
  const saved = localStorage.getItem("unlockedSkins");
  return saved ? JSON.parse(saved) : [true, false, false, false];
}
function setUnlockedSkins(arr) {
  localStorage.setItem("unlockedSkins", JSON.stringify(arr));
}

// NOVO: Guardar e obter skin escolhida
function getSelectedSkinIndex() {
  const idx = localStorage.getItem("selectedSkinIndex");
  return idx !== null ? parseInt(idx, 10) : 0;
}
function setSelectedSkinIndex(idx) {
  localStorage.setItem("selectedSkinIndex", String(idx));
}

// Função getCoinScore agora retorna total + partida atual
function getCoinScore() {
  return getTotalCoins() + window.currentSessionCoins;
}

// Função para iniciar nova partida (reseta moedas da partida)
function startGame() {
  // Reinicia o contador de moedas da partida
  window.currentSessionCoins = 0;
  window.bonusGiven = { 100: false, 200: false };
  
  // Atualiza HUD das moedas
  updateCoinHUD();
}

// Função para terminar o jogo (soma moedas da partida ao total guardado)
function endGame() {
  // Soma as moedas ganhas nesta partida ao saldo total guardado
  if (window.currentSessionCoins > 0) {
    const newTotal = getTotalCoins() + window.currentSessionCoins;
    setTotalCoins(newTotal);
    
    // Opcional: mostrar popup de moedas ganhas
    console.log(`You earned ${window.currentSessionCoins} coins! Total balance: ${newTotal}`);
  }
  
  // Reinicia o contador da partida para próxima vez
  window.currentSessionCoins = 0;
  
  // Atualiza HUD se necessário
  updateCoinHUD();
}

// Função para coletar moeda durante o jogo
function collectCoin() {
  window.currentSessionCoins += 1;
  updateCoinHUD();
}

// Função para verificar bônus por score
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

// HUD das moedas (mostra saldo total e moedas da partida)
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
  // Show total coins and session coins separately
  const totalCoins = getTotalCoins();
  const sessionCoins = window.currentSessionCoins;
  coinDOM.innerHTML = `🪙: ${totalCoins}<br> S: +${sessionCoins}`;
}

// Function to update life HUD
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

// Função para comprar power-up (usa saldo total primeiro, depois da partida)
function buyPowerUp(idx) {
  const pu = powerUps[idx];
  const price = pu.price || 0;
  
  // Check if player has enough coins
  let availableTotal = getTotalCoins();
  let availableSession = window.currentSessionCoins;
  const totalAvailable = availableTotal + availableSession;
  
  if (totalAvailable < price) {
    console.log(`Insufficient coins! Need ${price} coins, you have ${totalAvailable}.`);
    return false;
  }
  
  // Deduct coins (first from total, then from session)
  let remaining = price;
  if (availableTotal >= remaining) {
    setTotalCoins(availableTotal - remaining);
  } else {
    setTotalCoins(0);
    remaining -= availableTotal;
    window.currentSessionCoins = Math.max(0, availableSession - remaining);
  }
  
  // Update coin HUD after purchase
  updateCoinHUD();
  
  // Handle extra life purchase differently
  if (pu.effect === "extraLife") {
    addExtraLife();
    updateLifeHUD();
    console.log(`Purchased ${pu.name} for ${price} coins! Lives: ${getExtraLives()}`);
  } else {
    // Use activateSuperpower which increments counter and shows confirmation
    activateSuperpower(pu.effect, { 
      player, 
      scene, 
      onComplete: () => {
        console.log(`${pu.name} effect completed!`);
        // Update the bottom button counters after purchase
        updateSuperpowerCounters();
      }
    });
    console.log(`Purchased ${pu.name} for ${price} coins!`);
  }
  
  return true;
}

// Função para comprar skin (usa saldo total primeiro, depois da partida)
function tryBuySkin(skinIndex) {
  const price = skinPrices[skinIndex];
  const unlocked = getUnlockedSkins();
  
  // Verifica se já está desbloqueada
  if (unlocked[skinIndex]) {
    console.log("Skin já desbloqueada!");
    return false;
  }
  
  // Verifica se tem moedas suficientes
  let availableTotal = getTotalCoins();
  let availableSession = window.currentSessionCoins;
  const totalAvailable = availableTotal + availableSession;
  
  if (totalAvailable < price) {
    console.log(`Moedas insuficientes! Precisa de ${price} moedas, tens ${totalAvailable}.`);
    return false;
  }
  
  // Deduz moedas (primeiro do total, depois da sessão)
  let remaining = price;
  if (availableTotal >= remaining) {
    setTotalCoins(availableTotal - remaining);
  } else {
    setTotalCoins(0);
    remaining -= availableTotal;
    window.currentSessionCoins = Math.max(0, availableSession - remaining);
  }
  
  // Desbloqueia a skin
  const newUnlocked = getUnlockedSkins();
  newUnlocked[skinIndex] = true;
  setUnlockedSkins(newUnlocked);

  // Aplica a skin comprada
  setPlayerSkin(skinIndex);
  setSelectedSkinIndex(skinIndex); // <-- guardar como selecionada

  // Atualiza UI
  updateCoinHUD();
  
  console.log(`Skin "${playerSkins[skinIndex].name}" comprada por ${price} moedas!`);
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
let startActive = false; // Controle do overlay de início
let lastRow = -2; // Garante que a primeira transição funcione
let inCustomization = false; // Inicialize como false

// Adicione a criação do renderer e o loop de animação principal
const renderer = Renderer();
renderer.setClearColor(0xffffff, 1); // fundo branco puro
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better shadow quality

// Attach renderer to DOM properly
document.body.appendChild(renderer.domElement);
renderer.domElement.className = "game";

// Set initial canvas size
function resizeRenderer() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

// Initialize canvas size
resizeRenderer();
window.addEventListener('resize', resizeRenderer);

// Separate animation loop function
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

  // Initialize UI
  setupScoreHUD();
  setupCoinHUD();
  updateLifeHUD(); // Initialize life HUD
  
  // Initialize superpower buttons (centered at bottom) - start disabled since player starts in green zone
  createSuperpowerButtons({ player, scene });
  updateSuperpowerButtonStates(true); // Start disabled
  
  // Esconde completamente o result-container ao iniciar
  if (resultDOM) {
    resultDOM.style.display = "none";
    resultDOM.style.visibility = "hidden";
  }
  
  // Ensure canvas is visible and properly sized
  resizeRenderer();
  
  // Inicia nova partida
  startGame();
  
  // Aplica a skin guardada ao iniciar o jogo
  const idx = getSelectedSkinIndex();
  const unlocked = getUnlockedSkins();
  if (unlocked[idx]) {
    setPlayerSkin(playerSkins[idx]);
  } else {
    setPlayerSkin(playerSkins[0]);
    setSelectedSkinIndex(0);
  }

  // Start the animation loop
  startAnimationLoop();
}

// NOVA FUNÇÃO: HUD da pontuação principal
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

// NOVA FUNÇÃO: HUD das moedas (garante que está sempre visível)
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
  // Initialize with current values
  const totalCoins = getTotalCoins();
  coinDOM.innerHTML = `🪙 Total: ${totalCoins}<br>Session: +0`;
}

// NOVO: seletor de skins visuais
function setupSkinSelector() {
  const skinDOM = document.getElementById("skin-selector");
  if (skinDOM) skinDOM.remove();
}

function setThirdPersonCamera() {
  // Posição atrás do jogador
  camera.position.x = player.position.x;
  camera.position.y = player.position.y - 120;
  camera.position.z = player.position.z + 60;
  camera.lookAt(player.position.x, player.position.y, player.position.z + 20);
}

// Pequena janela de troca de personagem (retângulo maior, preview centralizado)
function showSmallCharacterWindow() {
  if (inCustomization) return;
  inCustomization = true;

  // Overlay maior e centralizado
  let overlay = document.createElement("div");
  overlay.id = "character-small-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "50%";
  overlay.style.left = "50%";
  overlay.style.transform = "translate(-50%, -50%)";
  overlay.style.width = "420px";
  overlay.style.height = "320px";
  overlay.style.background = "#fff";
  overlay.style.borderRadius = "18px";
  overlay.style.boxShadow = "0 0 32px #0005";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "row";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "99999";
  overlay.style.fontFamily = '"Press Start 2P", cursive';
  document.body.appendChild(overlay);

  // Coluna esquerda: canvas do personagem
  const left = document.createElement("div");
  left.style.flex = "0 0 260px";
  left.style.display = "flex";
  left.style.flexDirection = "column";
  left.style.alignItems = "center";
  left.style.justifyContent = "center";
  overlay.appendChild(left);

  // Canvas para personagem (maior)
  const charCanvas = document.createElement("canvas");
  charCanvas.width = 240;
  charCanvas.height = 240;
  charCanvas.style.background = "radial-gradient(circle, #b2e0ff 60%, #3a8dde 100%)";
  charCanvas.style.borderRadius = "16px";
  charCanvas.style.boxShadow = "0 0 16px #0004";
  left.appendChild(charCanvas);

  // Setas
  const arrows = document.createElement("div");
  arrows.style.display = "flex";
  arrows.style.justifyContent = "center";
  arrows.style.alignItems = "center";
  arrows.style.marginTop = "18px";
  left.appendChild(arrows);

  const leftBtn = document.createElement("button");
  leftBtn.innerText = "←";
  leftBtn.style.fontSize = "1.5em";
  leftBtn.style.margin = "0 18px";
  leftBtn.style.cursor = "pointer";
  leftBtn.style.background = "#2196f3";
  leftBtn.style.color = "#fff";
  leftBtn.style.border = "none";
  leftBtn.style.borderRadius = "6px";
  leftBtn.style.width = "40px";
  leftBtn.style.height = "40px";
  arrows.appendChild(leftBtn);

  const rightBtn = document.createElement("button");
  rightBtn.innerText = "→";
  rightBtn.style.fontSize = "1.5em";
  rightBtn.style.margin = "0 18px";
  rightBtn.style.cursor = "pointer";
  rightBtn.style.background = "#2196f3";
  rightBtn.style.color = "#fff";
  rightBtn.style.border = "none";
  rightBtn.style.borderRadius = "6px";
  rightBtn.style.width = "40px";
  rightBtn.style.height = "40px";
  arrows.appendChild(rightBtn);

  // Coluna direita: nome e fechar
  const right = document.createElement("div");
  right.style.flex = "1";
  right.style.display = "flex";
  right.style.flexDirection = "column";
  right.style.alignItems = "flex-start";
  right.style.justifyContent = "center";
  right.style.height = "100%";
  right.style.marginLeft = "18px";
  overlay.appendChild(right);

  // Nome do skin
  const skinName = document.createElement("div");
  skinName.style.fontSize = "1.2em";
  skinName.style.marginTop = "40px";
  skinName.style.marginBottom = "12px";
  skinName.style.color = "#222";
  skinName.style.textShadow = "1px 1px 0 #fff";
  right.appendChild(skinName);

  // Botão de fechar (X)
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✕";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "12px";
  closeBtn.style.right = "18px";
  closeBtn.style.fontSize = "1.5em";
  closeBtn.style.background = "transparent";
  closeBtn.style.color = "#222";
  closeBtn.style.border = "none";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.zIndex = "100001";
  overlay.appendChild(closeBtn);

  // Estado de skin selecionado
  let selectedSkin = playerSkins.findIndex(s => s.name === player.currentSkin?.name);
  if (selectedSkin < 0) selectedSkin = 0;
  function selectSkin(idx) {
    if (!getUnlockedSkins()[idx]) return;
    selectedSkin = idx;
    setPlayerSkin(idx); // <-- sempre usar o índice
    setSelectedSkinIndex(idx);
    skinName.innerText = playerSkins[selectedSkin].name;
    renderSkinList();
    renderCharacter();
  }

  leftBtn.onclick = () => {
    selectedSkin = (selectedSkin - 1 + playerSkins.length) % playerSkins.length;
    selectSkin(selectedSkin);
  };
  rightBtn.onclick = () => {
    selectedSkin = (selectedSkin + 1) % playerSkins.length;
    selectSkin(selectedSkin);
  };

  closeBtn.onclick = () => {
    overlay.remove();
    inCustomization = false;
  };

  // Renderiza personagem 3D no canvas (ajuste de câmera para cabeça/corpo)
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
    // Limpa modelos antigos (exceto luzes)
    charScene.children
      .filter(obj => obj.type !== "DirectionalLight" && obj.type !== "AmbientLight")
      .forEach(obj => charScene.remove(obj));
    // Adiciona SEMPRE o modelo preview da skin selecionada
    const previewModel = createPlayerPreviewModel(playerSkins[selectedSkin]);
    charScene.add(previewModel);
    charRenderer.render(charScene, charCamera);
  }

  // Função para selecionar skin no overlay
  function selectSkin(idx) {
    selectedSkin = idx;
    skinName.innerText = playerSkins[selectedSkin].name;
    renderSkinList();
    renderCharacter();

    // Se a skin está bloqueada, mostra cadeado e força o player do jogo para a clássica:
    if (!unlockedSkins[selectedSkin]) {
      lockIcon.style.display = "block";
      setPlayerSkin(0); // Sempre força o player real para a clássica
      // NÃO chama setSelectedSkinIndex(0) aqui!
    } else {
      lockIcon.style.display = "none";
      setPlayerSkin(selectedSkin); // Só permite aplicar skin desbloqueada
      setSelectedSkinIndex(selectedSkin); // Só guarda se for desbloqueada!
    }
  }

  // Inicializa
  selectSkin(selectedSkin);
}

// Botão azul com ícone de pessoa no canto esquerdo
function setupChangeCharacterButton() {
  let btn = document.getElementById("change-character-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "change-character-btn";
    btn.title = "Change Character";
    btn.innerHTML = "👤";
    btn.style.position = "absolute";
    btn.style.top = "100px";
    btn.style.left = "20px";
    btn.style.zIndex = "1002";
    btn.style.fontSize = "2.2em";
    btn.style.background = "#2196f3";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "50%";
    btn.style.width = "56px";
    btn.style.height = "56px";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.boxShadow = "0 2px 8px #0003";
    btn.style.cursor = "pointer";
    document.body.appendChild(btn);
    btn.addEventListener("click", showBigCharacterWindow);
  }
}

// Adicione esta função para criar uma barra vertical de botões no lado esquerdo
function setupSidebarButtons() {
  let sidebar = document.getElementById("sidebar-btns");
  if (!sidebar) {
    sidebar = document.createElement("div");
    sidebar.id = "sidebar-btns";
    sidebar.style.position = "absolute";
    sidebar.style.top = "140px"; // Increased from 90px to avoid overlap with life HUD
    sidebar.style.left = "0";
    sidebar.style.width = "95px"; // Slightly wider
    sidebar.style.background = "rgba(30,40,60,0.85)";
    sidebar.style.borderRadius = "0 28px 28px 0"; // Increased radius
    sidebar.style.boxShadow = "2px 0 16px #0003";
    sidebar.style.display = "flex";
    sidebar.style.flexDirection = "column";
    sidebar.style.alignItems = "center";
    sidebar.style.padding = "28px 0"; // Increased padding
    sidebar.style.gap = "28px"; // Increased gap
    sidebar.style.zIndex = "1002";
    document.body.appendChild(sidebar);
  }

  // Botão personagem (estilo redondo)
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
    charBtn.style.width = "60px"; // Increased from 56px
    charBtn.style.height = "60px"; // Increased from 56px
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

// Função para exibir a loja de power-ups em um retângulo similar ao seletor de personagem.
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

  // Efeito de entrada (fade in)
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

  // Botão de fechar (X) - mesmo estilo da janela de personagens
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

  // Coluna esquerda: preview e informações
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

  // Saldo de moedas (mesmo estilo da janela de personagens)
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
    // Clear everything except the title
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
      
      // Enhanced hover effect
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
      
      // Icon and name
      const iconName = document.createElement("div");
      iconName.style.display = "flex";
      iconName.style.alignItems = "center";
      iconName.style.flex = "1";
      iconName.innerHTML = `<span style="font-size:1.8em;margin-right:15px;">${pu.icon}</span> <span style="color:#2d3748;font-size:1.1em;font-weight:600;">${pu.name}</span>`;
      powerUpBox.appendChild(iconName);

      // Permitir clicar para selecionar
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
            renderPowerUpList(); // Re-render to update affordability
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

  // Inicializar
  selectPowerUp(0);

  // Função para fechar overlay
  function closePowerUpOverlay() {
    overlay.classList.add("character-overlay-exit");
    overlay.style.opacity = "0";
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 350);
    cleanupListeners();
  }

  // Assign to window for external access
  window.closePowerUpOverlay = closePowerUpOverlay;
}

// Fixed character selection window
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

  // Efeito de entrada (fade in)
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

  // Canvas para personagem (grande)
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

  // Nome do skin
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

  // Add Character Shop title to the right column
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
  let selectedSkin = getSelectedSkinIndex(); // <-- usar sempre o guardado
  if (selectedSkin < 0) selectedSkin = 0;

  function renderSkinList() {
    // Clear everything except the title
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
      
      // Enhanced hover effect
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
      
      // Icon and name
      const iconName = document.createElement("div");
      iconName.style.display = "flex";
      iconName.style.alignItems = "center";
      iconName.style.flex = "1";
      iconName.innerHTML = `<span style="font-size:1.8em;margin-right:15px;">🎨</span> <span style="color:#2d3748;font-size:1.1em;font-weight:600;">${skin.name}</span>`;
      skinBox.appendChild(iconName);

      // Permitir clicar em qualquer skinBox para trocar o preview do boneco
      skinBox.onclick = () => selectSkin(idx);

      if (!unlockedSkins[idx]) {
        // Mostra preço
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
            renderSkinList();
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
    setSelectedSkinIndex(idx); // <-- guardar sempre a escolha
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

  // Remove listeners ao fechar
  function cleanupListeners() {
    document.removeEventListener("keydown", escListener);
    overlay.removeEventListener("mousedown", handleOverlayClick);
  }

  // Substitua closeBtn.onclick e overlay.remove por:
  function closeOverlayWithEffectAndCleanup() {
    closeOverlayWithEffect();
    cleanupListeners();
  }

  // Renderiza personagem 3D no canvas (ajuste de câmera para corpo/cabeça, mais próximo)
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
    // Limpa modelos antigos (exceto luzes)
    charScene.children
      .filter(obj => obj.type !== "DirectionalLight" && obj.type !== "AmbientLight")
      .forEach(obj => charScene.remove(obj));
    // Adiciona SEMPRE o modelo preview da skin selecionada
    const previewModel = createPlayerPreviewModel(playerSkins[selectedSkin]);
    charScene.add(previewModel);
    charRenderer.render(charScene, charCamera);
  }

  // Inicializa
  selectSkin(selectedSkin);
}

// Adicione CSS para animação de entrada/saída do overlay
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

// Bloqueia input enquanto o overlay está ativo
window.isStartOverlayActive = () => startActive;

function animate() {
  animateVehicles();
  animatePlayer();
  animateCoin();
  animatePortal();
  coinCatch();
  hitTest();

  // Removido: updateShadowPosition(); // Não é mais necessário, sombra é fixa

  // Update magnet effects if active
  if (window.activeMagnetEffect) {
    window.activeMagnetEffect();
  }

  // Atualize o comportamento da câmera
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

  // Detecta transição de qualquer linha < 0 para linha 0 (linha de partida)
  const currentRow = Math.round(player.position.y / 65); // tileSize fixo
  if (lastRow < 0 && currentRow === 0 && !startActive) {
    showStartOverlay();

    // Desabilita os botões ao cruzar a linha de partida
    const charBtn = document.getElementById("change-character-btn");
    const puBtn = document.getElementById("powerup-btn");
    if (charBtn) {
      charBtn.disabled = true;
      charBtn.style.opacity = "0.5";
      charBtn.style.cursor = "not-allowed";
      charBtn.style.background = "#666"; // Cinza desabilitado
    }
    if (puBtn) {
      puBtn.disabled = true;
      puBtn.style.opacity = "0.5";
      puBtn.style.cursor = "not-allowed";
      puBtn.style.background = "#666"; // Cinza desabilitado
    }
    
    // Habilita os botões de superpoderes
    updateSuperpowerButtonStates(false);
    
  } else if (lastRow === 0 && currentRow < 0) {
    // Reabilita os botões ao voltar para antes da linha de partida
    const charBtn = document.getElementById("change-character-btn");
    const puBtn = document.getElementById("powerup-btn");
    if (charBtn) {
      charBtn.disabled = false;
      charBtn.style.opacity = "1";
      charBtn.style.cursor = "pointer";
      charBtn.style.background = "#2196f3"; // Azul habilitado
    }
    if (puBtn) {
      puBtn.disabled = false;
      puBtn.style.opacity = "1";
      puBtn.style.cursor = "pointer";
      puBtn.style.background = "#2196f3"; // Azul habilitado
    }
    
    // Desabilita os botões de superpoderes
    updateSuperpowerButtonStates(true);
  }
  lastRow = currentRow;

  renderer.render(scene, camera);
}

// Corrija a função showStartOverlay para salvar moedas antes de começar novo jogo
function showStartOverlay() {
  const startOverlay = document.getElementById("start-overlay");
  if (!startOverlay) return;
  startActive = true;
  startOverlay.style.visibility = "visible";
  startOverlay.style.opacity = "1";
  // Inicia nova partida quando o overlay aparece (isso vai salvar moedas da partida anterior)
  startGame();
  setTimeout(() => {
    startOverlay.style.opacity = "0";
    setTimeout(() => {
      startOverlay.style.visibility = "hidden";
      startActive = false;
    }, 400);
  }, 1000); // Mostra por 1 segundo
}

// Atualize o HUD da pontuação sempre que o score mudar
export function updateScoreHUD(newScore) {
  let scoreDOM = document.getElementById("score-hud");
  if (scoreDOM) {
    scoreDOM.innerText = `🏁: ${newScore}`;
  }
  // Verifica bônus por score
  checkScoreBonus(newScore);
}
window.updateScoreHUD = updateScoreHUD;

// Adicione esta função utilitária para chamar o bônus manualmente
import { coinCatch as coinCatchModule } from "./CoinCatch";
function checkMilestoneBonusesAfterTeleport() {
  // Chama a função de bônus de moedas (ela é idempotente)
  if (typeof coinCatchModule === "function") {
    coinCatchModule();
  }
}

// No animatePlayer.js, após teletransporte, chame checkMilestoneBonusesAfterTeleport
// Mas como não temos acesso direto, faça isso via window no animatePlayer.js
window.checkMilestoneBonusesAfterTeleport = checkMilestoneBonusesAfterTeleport;

// --- Ao terminar o jogo, salve as moedas coletadas ---
function saveCoinsOnGameOver() {
  endGame(); // Soma moedas da sessão ao total guardado
}

// Enhanced game over screen with revival option
window.showGameOverScreen = function() {
  // PRIMEIRO salva as moedas antes de mostrar o game over
  saveCoinsOnGameOver();

  const result = document.getElementById("result-container");
  const finalScore = document.getElementById("final-score");
  const reviveBtn = document.getElementById("revive");
  if (result) {
    result.style.display = "flex";
    result.style.visibility = "visible";
    // Exibe o botão revive se houver vidas extras
    if (reviveBtn) {
      if (getExtraLives() > 0) {
        reviveBtn.style.display = "block";
        reviveBtn.innerHTML = `❤️ Revive (${getExtraLives()} lives)`;
      } else {
        reviveBtn.style.display = "none";
      }
    }
  }
  // Atualize a pontuação final se possível
  if (finalScore && typeof window.position === "object" && typeof window.position.currentRow === "number") {
    finalScore.innerText = window.position.currentRow.toString();
  }
};

// Lógica do botão revive
document.addEventListener("DOMContentLoaded", () => {
  const reviveBtn = document.getElementById("revive");
  if (reviveBtn) {
    reviveBtn.onclick = () => {
      revivePlayer();
      reviveBtn.style.display = "none";
    };
  }
});

// Remova a função addRevivalButton e chamadas relacionadas

function showRevivalAnimation() {
  // Create revival effect overlay
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
  
  // Add CSS animation if not exists
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
  
  // Add revival text with heart animation
  const revivalText = document.createElement("div");
  revivalText.innerHTML = "❤️ REVIVED ❤️";
  revivalText.style.fontSize = "4em";
  revivalText.style.color = "white";
  revivalText.style.fontFamily = '"Press Start 2P", cursive';
  revivalText.style.textShadow = "4px 4px 8px rgba(0,0,0,0.8)";
  revivalText.style.animation = "heartBeat 0.8s ease-in-out infinite, revivalGlow 1s ease-in-out infinite";
  revivalText.style.textAlign = "center";
  
  // Add shield activation text
  const shieldText = document.createElement("div");
  shieldText.innerHTML = "🛡️ SHIELD ACTIVATED 🛡️";
  shieldText.style.fontSize = "2em";
  shieldText.style.color = "#00ff88";
  shieldText.style.fontFamily = '"Press Start 2P", cursive';
  shieldText.style.textShadow = "2px 2px 4px rgba(0,0,0,0.8)";
  shieldText.style.marginTop = "20px";
  shieldText.style.animation = "revivalGlow 1.2s ease-in-out infinite";
  shieldText.style.textAlign = "center";
  
  // Container for text
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
  
  // Use one extra life
  if (!useExtraLife()) {
    console.log("Failed to use extra life!");
    return;
  }
  
  // Update life HUD
  updateLifeHUD();
  
  // Reset game state first
  import("./components/Player").then(({ setGameOver, player, position }) => {
    // Reset game over state
    setGameOver(false);
    
    // Hide game over screen
    const result = document.getElementById("result-container");
    if (result) {
      result.style.display = "none";
      result.style.visibility = "hidden";
    }
    
    // Show revival animation immediately
    showRevivalAnimation();
    
    // Activate shield protection for revival (3 seconds) - start imediatamente
    activateRevivalShield(player, scene, 3000);
    
    // Update score HUD
    if (typeof window.updateScoreHUD === "function") {
      window.updateScoreHUD(position.currentRow >= 0 ? position.currentRow : 0);
    }
    
    console.log(`Revived at position ${position.currentRow}! Lives remaining: ${getExtraLives()} - Shield active for 3 seconds`);
  });
}

function activateRevivalShield(player, scene, duration = 3000) {
  // Set shield state
  player.userData.hasShield = true;
  player.userData.shieldActive = true;
  
  // Create shield visual effect
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
  
  // Shield animation
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
      
      // Pulsing effect
      const pulse = 1 + Math.sin(time) * 0.15;
      shield.scale.setScalar(pulse);
      
      // Fade out in last 500ms
      if (elapsed > duration - 500) {
        const fadeProgress = (elapsed - (duration - 500)) / 500;
        shield.material.opacity = 0.4 * (1 - fadeProgress);
      }
      
      requestAnimationFrame(animateShield);
    } else {
      // Remove shield
      scene.remove(shield);
      player.userData.hasShield = false;
      player.userData.shieldActive = false;
      console.log("Revival shield deactivated");
    }
  }
  
  animateShield();
  console.log(`Revival shield activated for ${duration/1000} seconds`);
}

// --- EFEITO VISUAL DO PORTAL (overlay roxo ondulado) ---
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

  // Animação de opacidade (fade in/out)
  setTimeout(() => { overlay.style.opacity = "1"; }, 10);
  setTimeout(() => { overlay.style.opacity = "0"; }, duration - 200);
  setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, duration);

  // Onda animada (opcional, para dar efeito ondulado)
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
};