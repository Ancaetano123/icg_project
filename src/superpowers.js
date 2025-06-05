import * as THREE from "three";

// Saldo global 
export function getTotalCoins() {
  return parseInt(localStorage.getItem("totalCoins") || "0", 10);
}
export function setTotalCoins(val) {
  localStorage.setItem("totalCoins", String(Math.max(0, val)));
}

function getSessionCoins() {
  return window.currentSessionCoins || 0;
}

function setSessionCoins(val) {
  window.currentSessionCoins = Math.max(0, val);
  if (typeof window.updateCoinHUD === "function") {
    window.updateCoinHUD();
  }
}

function getTotalAvailableCoins() {
  return getTotalCoins() + getSessionCoins();
}

function deductCoins(amount) {
  let remaining = amount;
  const totalCoins = getTotalCoins();
  if (totalCoins >= remaining) {
    setTotalCoins(totalCoins - remaining);
  } else {
    setTotalCoins(0);
    remaining -= totalCoins;
    setSessionCoins(getSessionCoins() - remaining);
  }
}

// Superpoderes disponíveis
export const superpowers = [
  {
    key: "shield",
    name: "Shield",
    icon: "🛡️",
    price: 0,
    description: "Shield for 8s",
    effect: "protection",
    use: ({ player, scene, onComplete }) => {
      // Efeito visual do escudo 
      const shieldGeo = new THREE.SphereGeometry(25, 32, 32);
      const shieldMat = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff, 
        transparent: true, 
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      const shield = new THREE.Mesh(shieldGeo, shieldMat);
      shield.position.set(0, 0, 15);
      player.add(shield);

      // Partículas de energia à volta do escudo
      const particles = [];
      for (let i = 0; i < 24; i++) {
        const particleGeo = new THREE.SphereGeometry(1.5, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({ 
          color: Math.random() > 0.5 ? 0x00ffff : 0x0088ff,
          transparent: true,
          opacity: 0.8
        });
        const particle = new THREE.Mesh(particleGeo, particleMat);
        const angle = (i / 24) * Math.PI * 2;
        particle.position.set(
          Math.cos(angle) * 30,
          Math.sin(angle) * 30,
          15 + Math.random() * 10
        );
        particle.userData.angle = angle;
        particle.userData.radius = 30;
        particles.push(particle);
        player.add(particle);
      }

      player.userData.hasShield = true;
      player.userData.shieldActive = true;

      let elapsed = 0;
      let active = true;
      function animateShield() {
        if (!active) return;
        elapsed += 1 / 60;
        const pulse = 1 + Math.sin(elapsed * 8) * 0.15;
        shield.scale.setScalar(pulse);
        shield.material.opacity = 0.3 + Math.sin(elapsed * 12) * 0.15;
        shield.rotation.y += 0.02;
        shield.rotation.x += 0.01;
        particles.forEach((particle, i) => {
          particle.userData.angle += 0.05;
          particle.position.x = Math.cos(particle.userData.angle) * particle.userData.radius;
          particle.position.y = Math.sin(particle.userData.angle) * particle.userData.radius;
          particle.position.z = 15 + Math.sin(elapsed * 6 + i) * 5;
          particle.rotation.x += 0.1;
          particle.rotation.y += 0.15;
        });
        if (elapsed > 6) {
          const flashRate = elapsed > 7 ? 0.1 : 0.3;
          shield.material.opacity = Math.sin(elapsed * (1/flashRate)) > 0 ? 0.5 : 0.1;
        }
        if (elapsed < 8) {
          requestAnimationFrame(animateShield);
        } else {
          player.remove(shield);
          particles.forEach(p => player.remove(p));
          player.userData.hasShield = false;
          player.userData.shieldActive = false;
          active = false;
          if (onComplete) onComplete();
        }
      }
      animateShield();
    }
  },
  {
    key: "rocket",
    name: "Rocket",
    icon: "🚀",
    price: 0,
    description: "Advance 10 tiles",
    effect: "boostStart",
    use: ({ player, scene, onComplete }) => {
      // Animação do foguete 
      const rocketGeo = new THREE.CylinderGeometry(4, 4, 20, 16);
      const rocketMat = new THREE.MeshBasicMaterial({ color: 0xffee66 });
      const rocket = new THREE.Mesh(rocketGeo, rocketMat);
      rocket.position.copy(player.position);
      rocket.position.z += 25;
      scene.add(rocket);

      // Trilha de fogo do foguete
      const fireGeo = new THREE.ConeGeometry(4, 12, 16);
      const fireMat = new THREE.MeshBasicMaterial({ 
        color: 0xff6600, 
        transparent: true, 
        opacity: 0.8 
      });
      const fire = new THREE.Mesh(fireGeo, fireMat);
      fire.position.set(0, 0, -16);
      rocket.add(fire);

      const smokeParticles = [];
      let t = 0;
      function animateRocket() {
        t++;
        rocket.position.y += 8;
        rocket.position.z += Math.sin(t / 6) * 0.8;
        rocket.rotation.z += 0.1;
        fire.material.opacity = 0.8 - (t / 40);
        fire.scale.setScalar(1 + Math.sin(t * 0.3) * 0.2);
        if (t % 3 === 0) {
          const smokeGeo = new THREE.SphereGeometry(3, 8, 8);
          const smokeMat = new THREE.MeshBasicMaterial({ 
            color: 0x888888,
            transparent: true,
            opacity: 0.4
          });
          const smoke = new THREE.Mesh(smokeGeo, smokeMat);
          smoke.position.copy(rocket.position);
          smoke.position.z -= 20;
          smoke.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            -2,
            (Math.random() - 0.5) * 2
          );
          smokeParticles.push(smoke);
          scene.add(smoke);
        }
        smokeParticles.forEach(smoke => {
          smoke.position.add(smoke.velocity);
          smoke.scale.multiplyScalar(1.02);
          smoke.material.opacity *= 0.98;
        });
        if (t < 35) {
          requestAnimationFrame(animateRocket);
        } else {
          scene.remove(rocket);
          smokeParticles.forEach(s => scene.remove(s));
          import("./components/Player").then(({ position }) => {
            import("./constants").then(({ tileSize }) => {
              position.currentRow += 10;
              player.position.y = position.currentRow * tileSize;
              if (typeof window.updateScoreHUD === "function") {
                window.updateScoreHUD(position.currentRow >= 0 ? position.currentRow : 0);
              }
              if (onComplete) onComplete();
            });
          });
        }
      }
      animateRocket();
    }
  },
  {
    key: "magnet",
    name: "Magnet",
    icon: "🧲",
    price: 0,
    description: "Attracts coins for 10s",
    effect: "coinMagnet",
    use: ({ player, scene, onComplete }) => {
      // Campo magnético animado
      const magnetGeo = new THREE.RingGeometry(20, 24, 32);
      const magnetMat = new THREE.MeshBasicMaterial({ 
        color: 0x44baff, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.6 
      });
      const magnetField = new THREE.Mesh(magnetGeo, magnetMat);
      magnetField.position.set(0, 0, 18);
      magnetField.rotation.x = Math.PI / 2;
      player.add(magnetField);

      const magnetGeo2 = new THREE.RingGeometry(28, 32, 32);
      const magnetMat2 = new THREE.MeshBasicMaterial({ 
        color: 0x6699ff, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.3 
      });
      const magnetField2 = new THREE.Mesh(magnetGeo2, magnetMat2);
      magnetField2.position.set(0, 0, 18);
      magnetField2.rotation.x = Math.PI / 2;
      player.add(magnetField2);

      // Iman com raio e velocidade aumentados
      const MAGNET_RADIUS = 500;
      const MAGNET_SPEED = 8.0;
      const COLLECT_DISTANCE = 40;
      let elapsed = 0;
      let active = true;
      let coinsBeingAttracted = new Set();
      function animateMagnet() {
        if (!active) return;
        elapsed += 1 / 60;
        const pulse = 1 + Math.sin(elapsed * 6) * 0.15;
        magnetField.scale.setScalar(pulse);
        magnetField2.scale.setScalar(pulse * 0.8);
        magnetField.rotation.z += 0.02;
        magnetField2.rotation.z -= 0.015;
        magnetField.material.opacity = 0.6 + Math.sin(elapsed * 8) * 0.2;
        magnetField2.material.opacity = 0.3 + Math.sin(elapsed * 6) * 0.1;
        const playerWorldPos = new THREE.Vector3();
        player.getWorldPosition(playerWorldPos);
        import("./components/Map").then(({ metadata }) => {
          for (let i = 0; i < metadata.length; i++) {
            const row = metadata[i];
            if (row && row.coin && row.coin.ref && row.coin.ref.parent) {
              const coin = row.coin.ref;
              const coinWorldPos = new THREE.Vector3();
              coin.getWorldPosition(coinWorldPos);
              const dx = coinWorldPos.x - playerWorldPos.x;
              const dy = coinWorldPos.y - playerWorldPos.y;
              const dist2D = Math.sqrt(dx * dx + dy * dy);
              if (dist2D > 0 && dist2D < MAGNET_RADIUS) {
                coinsBeingAttracted.add(coin);
                const dirX = (playerWorldPos.x - coinWorldPos.x) / dist2D;
                const dirY = (playerWorldPos.y - coinWorldPos.y) / dist2D;
                const speed = dist2D > 100 ? MAGNET_SPEED * 1.5 : MAGNET_SPEED;
                coin.position.x += dirX * speed;
                coin.position.y += dirY * speed;
                coin.position.z = 28 + Math.sin(elapsed * 20 + i) * 8;
                coin.scale.setScalar(1.2 + Math.sin(elapsed * 10) * 0.3);
                if (dist2D < COLLECT_DISTANCE) {
                  if (coin.parent) coin.parent.remove(coin);
                  row.coin.ref = null;
                  coinsBeingAttracted.delete(coin);
                  if (typeof window.collectCoin === "function") {
                    window.collectCoin();
                  }
                }
              }
            }
          }
        });
        if (elapsed < 10) {
          requestAnimationFrame(animateMagnet);
        } else {
          coinsBeingAttracted.forEach(coin => {
            if (coin.parent) coin.scale.setScalar(1);
          });
          player.remove(magnetField);
          player.remove(magnetField2);
          active = false;
          coinsBeingAttracted.clear();
          if (onComplete) onComplete();
        }
      }
      animateMagnet();
      // Aumenta probabilidade de moedas temporariamente
      import("./utilities/generateRows").then(({ setCoinProbability, coinProbability }) => {
        const originalProb = coinProbability;
        setCoinProbability(Math.min(1.0, coinProbability * 4));
        setTimeout(() => setCoinProbability(originalProb), 10000);
      });
    }
  }
];

// Sistema de vidas extra
export const lifeSystem = {
  key: "life",
  name: "Extra Life",
  icon: "❤️",
  price: 0,
  description: "Gain an extra life",
  effect: "extraLife"
};

export function getExtraLives() {
  return parseInt(localStorage.getItem("extraLives") || "0", 10);
}

export function setExtraLives(count) {
  localStorage.setItem("extraLives", String(Math.max(0, count)));
}

export function useExtraLife() {
  const current = getExtraLives();
  if (current > 0) {
    setExtraLives(current - 1);
    return true;
  }
  return false;
}

export function addExtraLife() {
  const current = getExtraLives();
  setExtraLives(current + 1);
}

// Contadores de compras e usos
const superpowerPurchases = {};
const superpowerUses = {};
superpowers.forEach(sp => {
  superpowerPurchases[sp.key] = 0;
  superpowerUses[sp.key] = 0;
});

// Carregar contadores do localStorage
function loadCounters() {
  const savedPurchases = localStorage.getItem("superpowerPurchases");
  const savedUses = localStorage.getItem("superpowerUses");
  if (savedPurchases) {
    Object.assign(superpowerPurchases, JSON.parse(savedPurchases));
  }
  if (savedUses) {
    Object.assign(superpowerUses, JSON.parse(savedUses));
  }
}

// Guardar contadores no localStorage
function saveCounters() {
  localStorage.setItem("superpowerPurchases", JSON.stringify(superpowerPurchases));
  localStorage.setItem("superpowerUses", JSON.stringify(superpowerUses));
}

loadCounters();

// Ativar superpoder (compra na loja)
export function activateSuperpower(effect, { player, scene, onComplete }) {
  const sp = superpowers.find(s => s.effect === effect);
  if (sp) {
    superpowerPurchases[sp.key]++;
    saveCounters();
    updateCounterDisplays();
    showPurchaseConfirmation(sp);
    if (onComplete) onComplete();
  }
}

// Usar superpoder (botões inferiores)
export function useSuperpower(key, { player, scene, onComplete }) {
  const sp = superpowers.find(s => s.key === key);
  if (sp) {
    superpowerPurchases[sp.key]--;
    superpowerUses[sp.key]++;
    saveCounters();
    updateCounterDisplays();
    showUsageConfirmation(sp);
    sp.use({ player, scene, onComplete });
  }
}

export function getPurchaseCount(key) {
  return superpowerPurchases[key] || 0;
}

export function getUsageCount(key) {
  return superpowerUses[key] || 0;
}

// Atualizar contadores no HUD
function updateCounterDisplays() {
  superpowers.forEach(sp => {
    const counter = document.getElementById(`counter-${sp.key}`);
    if (counter) {
      counter.innerText = superpowerPurchases[sp.key];
    }
  });
}

// Confirmação de compra 
function showPurchaseConfirmation(superpower) {
  const existing = document.getElementById("purchase-confirmation");
  if (existing) existing.remove();
  const confirmation = document.createElement("div");
  confirmation.id = "purchase-confirmation";
  confirmation.style.position = "fixed";
  confirmation.style.top = "120px";
  confirmation.style.right = "20px";
  confirmation.style.transform = "none";
  confirmation.style.background = "rgba(0, 0, 0, 0.9)";
  confirmation.style.color = "#fff";
  confirmation.style.padding = "15px 20px";
  confirmation.style.borderRadius = "12px";
  confirmation.style.fontSize = "1.2em";
  confirmation.style.fontFamily = '"Press Start 2P", cursive';
  confirmation.style.textAlign = "center";
  confirmation.style.zIndex = "99999";
  confirmation.style.boxShadow = "0 0 20px rgba(0, 255, 0, 0.4)";
  confirmation.style.border = "2px solid #00ff00";
  confirmation.style.opacity = "0";
  confirmation.style.transition = "opacity 0.3s, transform 0.3s";
  confirmation.style.minWidth = "180px";
  confirmation.innerHTML = `
    <div style="font-size: 1.5em; margin-bottom: 8px;">${superpower.icon}</div>
    <div style="color: #00ff00; font-weight: bold; font-size: 0.8em;">PURCHASED!</div>
    <div style="font-size: 0.6em; margin-top: 6px;">${superpower.name}</div>
    <div style="font-size: 0.5em; margin-top: 4px; color: #ccc;">Available: ${superpowerPurchases[superpower.key]}</div>
  `;
  document.body.appendChild(confirmation);
  setTimeout(() => {
    confirmation.style.opacity = "1";
    confirmation.style.transform = "translateX(0)";
  }, 10);
  setTimeout(() => {
    confirmation.style.opacity = "0";
    confirmation.style.transform = "translateX(100px)";
    setTimeout(() => {
      if (confirmation.parentNode) confirmation.parentNode.removeChild(confirmation);
    }, 300);
  }, 2000);
}

// Confirmação de uso 
function showUsageConfirmation(superpower) {
  const existing = document.getElementById("usage-confirmation");
  if (existing) existing.remove();
  const confirmation = document.createElement("div");
  confirmation.id = "usage-confirmation";
  confirmation.style.position = "fixed";
  confirmation.style.top = "120px";
  confirmation.style.right = "20px";
  confirmation.style.transform = "none";
  confirmation.style.background = "rgba(0, 0, 0, 0.9)";
  confirmation.style.color = "#fff";
  confirmation.style.padding = "15px 20px";
  confirmation.style.borderRadius = "12px";
  confirmation.style.fontSize = "1.2em";
  confirmation.style.fontFamily = '"Press Start 2P", cursive';
  confirmation.style.textAlign = "center";
  confirmation.style.zIndex = "99999";
  confirmation.style.boxShadow = "0 0 20px rgba(0, 255, 0, 0.4)";
  confirmation.style.border = "2px solid #00ff00";
  confirmation.style.opacity = "0";
  confirmation.style.transition = "opacity 0.3s, transform 0.3s";
  confirmation.style.minWidth = "180px";
  confirmation.innerHTML = `
    <div style="font-size: 1.5em; margin-bottom: 8px;">${superpower.icon}</div>
    <div style="color: #00ff00; font-weight: bold; font-size: 0.8em;">USED!</div>
    <div style="font-size: 0.6em; margin-top: 6px;">${superpower.name}</div>
  `;
  document.body.appendChild(confirmation);
  setTimeout(() => {
    confirmation.style.opacity = "1";
    confirmation.style.transform = "translateX(0)";
  }, 10);
  setTimeout(() => {
    confirmation.style.opacity = "0";
    confirmation.style.transform = "translateX(100px)";
    setTimeout(() => {
      if (confirmation.parentNode) confirmation.parentNode.removeChild(confirmation);
    }, 300);
  }, 2000);
}

// Botões flutuantes de superpoderes 
export function createSuperpowerButtons({ player, scene }) {
  let container = document.getElementById("superpower-btns");
  if (container) container.remove();
  container = document.createElement("div");
  container.id = "superpower-btns";
  container.style.position = "fixed";
  container.style.bottom = "10px";
  container.style.left = "50%";
  container.style.transform = "translateX(-50%)";
  container.style.display = "flex";
  container.style.flexDirection = "row";
  container.style.gap = "20px";
  container.style.zIndex = "999";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.padding = "20px 30px";
  container.style.background = "rgba(30, 40, 60, 0.9)";
  container.style.borderRadius = "25px";
  container.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.4)";
  container.style.backdropFilter = "blur(10px)";
  container.style.border = "2px solid rgba(255, 255, 255, 0.1)";
  document.body.appendChild(container);

  superpowers.forEach(sp => {
    const btn = document.createElement("button");
    btn.id = `sp-btn-${sp.key}`;
    btn.style.background = "#2196f3";
    btn.style.color = "#fff";
    btn.style.border = "2px solid #1976d2";
    btn.style.borderRadius = "15px";
    btn.style.padding = "12px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "1.8em";
    btn.style.fontFamily = '"Press Start 2P", cursive';
    btn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    btn.style.transition = "all 0.2s";
    btn.style.width = "70px";
    btn.style.height = "70px";
    btn.style.display = "flex";
    btn.style.flexDirection = "column";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.position = "relative";
    const icon = document.createElement("div");
    icon.innerText = sp.icon;
    icon.style.fontSize = "1.6em";
    icon.style.lineHeight = "1";
    btn.appendChild(icon);
    const counter = document.createElement("div");
    counter.id = `counter-${sp.key}`;
    counter.innerText = superpowerPurchases[sp.key];
    counter.style.fontSize = "0.35em";
    counter.style.marginTop = "3px";
    counter.style.background = "rgba(255,255,255,0.95)";
    counter.style.color = "#333";
    counter.style.padding = "2px 5px";
    counter.style.borderRadius = "6px";
    counter.style.fontWeight = "bold";
    counter.style.minWidth = "18px";
    counter.style.textAlign = "center";
    counter.style.lineHeight = "1";
    btn.appendChild(counter);
    btn.onmouseenter = () => {
      btn.style.background = "#1976d2";
      btn.style.transform = "scale(1.1)";
      btn.style.boxShadow = "0 6px 16px rgba(0,0,0,0.4)";
    };
    btn.onmouseleave = () => {
      btn.style.background = "#2196f3";
      btn.style.transform = "scale(1)";
      btn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    };
    btn.onclick = () => {
      if (btn.disabled) return;
      if (superpowerPurchases[sp.key] > 0) {
        useSuperpower(sp.key, { player, scene, onComplete: null });
        btn.style.animation = "sp-buyflash 0.4s";
        setTimeout(() => btn.style.animation = "", 410);
      } else {
        showNeedToBuyMessage(sp);
      }
    };
    container.appendChild(btn);
  });

 
  if (!document.getElementById("sp-buyflash-style")) {
    const style = document.createElement("style");
    style.id = "sp-buyflash-style";
    style.innerHTML = `
    @keyframes sp-buyflash {
      0% { background: #4caf50; transform: scale(1.15); }
      50% { background: #66bb6a; transform: scale(1.2); box-shadow: 0 0 20px rgba(76, 175, 80, 0.6); }
      100% { background: #2196f3; transform: scale(1); }
    }
    `;
    document.head.appendChild(style);
  }
}

// Atualizar estado dos botões 
export function updateSuperpowerButtonStates(disabled) {
  superpowers.forEach(sp => {
    const btn = document.getElementById(`sp-btn-${sp.key}`);
    if (btn) {
      btn.disabled = disabled;
      btn.style.opacity = disabled ? "0.5" : "1";
      btn.style.cursor = disabled ? "not-allowed" : "pointer";
      btn.style.background = disabled ? "#666" : "#2196f3";
    }
  });
}

// Mensagem se tentar usar sem comprar 
function showNeedToBuyMessage(superpower) {
  const existing = document.getElementById("need-to-buy-message");
  if (existing) existing.remove();
  const message = document.createElement("div");
  message.id = "need-to-buy-message";
  message.style.position = "fixed";
  message.style.top = "120px";
  message.style.right = "20px";
  message.style.transform = "none";
  message.style.background = "rgba(0, 0, 0, 0.9)";
  message.style.color = "#fff";
  message.style.padding = "15px 20px";
  message.style.borderRadius = "12px";
  message.style.fontSize = "1.2em";
  message.style.fontFamily = '"Press Start 2P", cursive';
  message.style.textAlign = "center";
  message.style.zIndex = "99999";
  message.style.boxShadow = "0 0 20px rgba(255, 0, 0, 0.4)";
  message.style.border = "2px solid #ff0000";
  message.style.opacity = "0";
  message.style.transition = "opacity 0.3s, transform 0.3s";
  message.style.minWidth = "180px";
  message.innerHTML = `
    <div style="font-size: 1.5em; margin-bottom: 8px;">${superpower.icon}</div>
    <div style="color: #ff0000; font-weight: bold; font-size: 0.8em;">NOT OWNED!</div>
    <div style="font-size: 0.6em; margin-top: 6px;">${superpower.name}</div>
    <div style="font-size: 0.5em; margin-top: 4px; color: #ccc;">Buy in the shop first</div>
  `;
  document.body.appendChild(message);
  setTimeout(() => {
    message.style.opacity = "1";
    message.style.transform = "translateX(0)";
  }, 10);
  setTimeout(() => {
    message.style.opacity = "0";
    message.style.transform = "translateX(100px)";
    setTimeout(() => {
      if (message.parentNode) message.parentNode.removeChild(message);
    }, 300);
  }, 2000);
}

// Atualizar contadores após compra 
export function updateSuperpowerCounters() {
  updateCounterDisplays();
}

// Disponibilizar funções globalmente 
window.createSuperpowerButtons = createSuperpowerButtons;
window.updatePurchaseCounters = updateCounterDisplays;
