import * as THREE from "three";

// SALDO GLOBAL (usa localStorage para persistir)
export function getTotalCoins() {
  return parseInt(localStorage.getItem("totalCoins") || "0", 10);
}
export function setTotalCoins(val) {
  localStorage.setItem("totalCoins", String(Math.max(0, val)));
}

// Get session coins from main game
function getSessionCoins() {
  return window.currentSessionCoins || 0;
}

function setSessionCoins(val) {
  window.currentSessionCoins = Math.max(0, val);
  if (typeof window.updateCoinHUD === "function") {
    window.updateCoinHUD();
  }
}

// Get total available coins (saved + session)
function getTotalAvailableCoins() {
  return getTotalCoins() + getSessionCoins();
}

// Deduct coins (from total first, then session)
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
    description: "Protective shield for 8s",
    effect: "protection",
    use: ({ player, scene, onComplete }) => {
      // Create shield visual effect
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

      // Energy particles around shield
      const particles = [];
      for (let i = 0; i < 24; i++) {
        const particleGeo = new THREE.SphereGeometry(1.5, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({ 
          color: Math.random() > 0.5 ? 0x00ffff : 0x0088ff,
          transparent: true,
          opacity: 0.8
        });
        const particle = new THREE.Mesh(particleGeo, particleMat);
        
        // Position particles in a circle around player
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

      // Activate shield protection
      player.userData.hasShield = true;
      player.userData.shieldActive = true;

      let elapsed = 0;
      let active = true;
      
      function animateShield() {
        if (!active) return;
        elapsed += 1 / 60;
        
        // Pulse shield
        const pulse = 1 + Math.sin(elapsed * 8) * 0.15;
        shield.scale.setScalar(pulse);
        shield.material.opacity = 0.3 + Math.sin(elapsed * 12) * 0.15;
        shield.rotation.y += 0.02;
        shield.rotation.x += 0.01;
        
        // Animate particles orbiting around player
        particles.forEach((particle, i) => {
          particle.userData.angle += 0.05;
          particle.position.x = Math.cos(particle.userData.angle) * particle.userData.radius;
          particle.position.y = Math.sin(particle.userData.angle) * particle.userData.radius;
          particle.position.z = 15 + Math.sin(elapsed * 6 + i) * 5;
          particle.rotation.x += 0.1;
          particle.rotation.y += 0.15;
        });
        
        // Warning flash when shield is about to expire
        if (elapsed > 6) {
          const flashRate = elapsed > 7 ? 0.1 : 0.3;
          shield.material.opacity = Math.sin(elapsed * (1/flashRate)) > 0 ? 0.5 : 0.1;
        }
        
        if (elapsed < 8) {
          requestAnimationFrame(animateShield);
        } else {
          // Remove shield and particles
          player.remove(shield);
          particles.forEach(p => player.remove(p));
          
          // Deactivate shield protection
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
    description: "Advance 10 tiles quickly",
    effect: "boostStart",
    use: ({ player, scene, onComplete }) => {
      // Animação de foguete
      const rocketGeo = new THREE.CylinderGeometry(4, 4, 20, 16);
      const rocketMat = new THREE.MeshBasicMaterial({ color: 0xffee66 });
      const rocket = new THREE.Mesh(rocketGeo, rocketMat);
      rocket.position.copy(player.position);
      rocket.position.z += 25;
      scene.add(rocket);

      // Trilha de fogo
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
          
          // Move player forward 10 tiles using proper function
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

      // Magnet settings - MUCH LARGER AND FASTER
      const MAGNET_RADIUS = 500; // Massive radius to catch many coins
      const MAGNET_SPEED = 8.0;   // Super fast attraction speed
      const COLLECT_DISTANCE = 40; // Slightly larger collection area
      
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
        
        // Get player world position for accurate distance calculation
        const playerWorldPos = new THREE.Vector3();
        player.getWorldPosition(playerWorldPos);
        
        // Find and attract coins from metadata rows - CHECK ALL ROWS
        import("./components/Map").then(({ metadata }) => {
          for (let i = 0; i < metadata.length; i++) {
            const row = metadata[i];
            if (row && row.coin && row.coin.ref && row.coin.ref.parent) {
              const coin = row.coin.ref;
              const coinWorldPos = new THREE.Vector3();
              coin.getWorldPosition(coinWorldPos);
              
              // Calculate 2D distance (ignore Z axis for game logic)
              const dx = coinWorldPos.x - playerWorldPos.x;
              const dy = coinWorldPos.y - playerWorldPos.y;
              const dist2D = Math.sqrt(dx * dx + dy * dy);

              // If within MASSIVE magnet radius, attract the coin FAST
              if (dist2D > 0 && dist2D < MAGNET_RADIUS) {
                coinsBeingAttracted.add(coin);
                
                // Calculate direction towards player (2D movement)
                const dirX = (playerWorldPos.x - coinWorldPos.x) / dist2D;
                const dirY = (playerWorldPos.y - coinWorldPos.y) / dist2D;
                
                // Move coin towards player SUPER FAST
                const speed = dist2D > 100 ? MAGNET_SPEED * 1.5 : MAGNET_SPEED; // Even faster for distant coins
                coin.position.x += dirX * speed;
                coin.position.y += dirY * speed;
                
                // Add dramatic floating effect for visual feedback
                coin.position.z = 28 + Math.sin(elapsed * 20 + i) * 8;
                
                // Scale up coins being attracted for visual effect
                coin.scale.setScalar(1.2 + Math.sin(elapsed * 10) * 0.3);
                
                // If close enough, collect the coin
                if (dist2D < COLLECT_DISTANCE) {
                  // Remove coin from scene
                  if (coin.parent) coin.parent.remove(coin);
                  
                  // Clear from metadata
                  row.coin.ref = null;
                  
                  // Remove from tracking set
                  coinsBeingAttracted.delete(coin);
                  
                  // Collect coin using global function
                  if (typeof window.collectCoin === "function") {
                    window.collectCoin();
                  }
                  
                  console.log("MAGNET POWER! Coin collected!");
                }
              }
            }
          }
        });
        
        if (elapsed < 10) {
          requestAnimationFrame(animateMagnet);
        } else {
          // Reset any scaled coins that weren't collected
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

      // Also increase coin probability for newly generated rows MASSIVELY
      import("./utilities/generateRows").then(({ setCoinProbability, coinProbability }) => {
        const originalProb = coinProbability;
        setCoinProbability(Math.min(1.0, coinProbability * 4)); // Even more coins!
        setTimeout(() => setCoinProbability(originalProb), 10000);
      });
    }
  }
];

// Separate life system for revival
export const lifeSystem = {
  key: "life",
  name: "Extra Life",
  icon: "❤️",
  price: 0,
  description: "Gain an extra life to revive",
  effect: "extraLife"
};

// Life management functions
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

// Contadores de compras e usos separados
const superpowerPurchases = {}; // Quantas vezes comprou na loja
const superpowerUses = {}; // Quantas vezes usou (não decrementa)
superpowers.forEach(sp => {
  superpowerPurchases[sp.key] = 0;
  superpowerUses[sp.key] = 0;
});

// Load counters from localStorage
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

// Save counters to localStorage
function saveCounters() {
  localStorage.setItem("superpowerPurchases", JSON.stringify(superpowerPurchases));
  localStorage.setItem("superpowerUses", JSON.stringify(superpowerUses));
}

// Initialize counters
loadCounters();

// Function to activate superpower (for shop purchases only)
export function activateSuperpower(effect, { player, scene, onComplete }) {
  const sp = superpowers.find(s => s.effect === effect);
  if (sp) {
    superpowerPurchases[sp.key]++; // Apenas incrementa compras (adiciona ao inventário)
    saveCounters();
    updateCounterDisplays();
    showPurchaseConfirmation(sp);
    // Remove sp.use() - não usa o poder imediatamente
    if (onComplete) onComplete();
  }
}

// Function to use superpower without counting (for bottom buttons)
export function useSuperpower(key, { player, scene, onComplete }) {
  const sp = superpowers.find(s => s.key === key);
  if (sp) {
    superpowerPurchases[sp.key]--; // Decrementa compras (consome)
    superpowerUses[sp.key]++; // Incrementa usos
    saveCounters();
    updateCounterDisplays();
    showUsageConfirmation(sp); // Show green confirmation when using from buttons
    sp.use({ player, scene, onComplete });
  }
}

// Get purchase count
export function getPurchaseCount(key) {
  return superpowerPurchases[key] || 0;
}

// Get usage count
export function getUsageCount(key) {
  return superpowerUses[key] || 0;
}

// Update counter displays
function updateCounterDisplays() {
  superpowers.forEach(sp => {
    const counter = document.getElementById(`counter-${sp.key}`);
    if (counter) {
      // Mostra: compras disponíveis / total de usos
      counter.innerText = superpowerPurchases[sp.key];
    }
  });
}

// Show purchase confirmation
function showPurchaseConfirmation(superpower) {
  const existing = document.getElementById("purchase-confirmation");
  if (existing) existing.remove();

  const confirmation = document.createElement("div");
  confirmation.id = "purchase-confirmation";
  confirmation.style.position = "fixed";
  confirmation.style.top = "120px"; // Below coin display
  confirmation.style.right = "20px"; // Top-right corner
  confirmation.style.transform = "none"; // Remove center transform
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

  // Slide in from right
  setTimeout(() => {
    confirmation.style.opacity = "1";
    confirmation.style.transform = "translateX(0)";
  }, 10);
  
  // Slide out and remove
  setTimeout(() => {
    confirmation.style.opacity = "0";
    confirmation.style.transform = "translateX(100px)";
    setTimeout(() => {
      if (confirmation.parentNode) confirmation.parentNode.removeChild(confirmation);
    }, 300);
  }, 2000);
}

// Show usage confirmation (green) when using from bottom buttons
function showUsageConfirmation(superpower) {
  const existing = document.getElementById("usage-confirmation");
  if (existing) existing.remove();

  const confirmation = document.createElement("div");
  confirmation.id = "usage-confirmation";
  confirmation.style.position = "fixed";
  confirmation.style.top = "120px"; // Below coin display
  confirmation.style.right = "20px"; // Top-right corner
  confirmation.style.transform = "none"; // Remove center transform
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
    <div style="color: #00ff00; font-weight: bold; font-size: 0.8em;">USADO!</div>
    <div style="font-size: 0.6em; margin-top: 6px;">${superpower.name}</div>
  `;

  document.body.appendChild(confirmation);

  // Slide in from right
  setTimeout(() => {
    confirmation.style.opacity = "1";
    confirmation.style.transform = "translateX(0)";
  }, 10);
  
  // Slide out and remove
  setTimeout(() => {
    confirmation.style.opacity = "0";
    confirmation.style.transform = "translateX(100px)";
    setTimeout(() => {
      if (confirmation.parentNode) confirmation.parentNode.removeChild(confirmation);
    }, 300);
  }, 2000);
}

// Função para criar botões flutuantes no centro inferior
export function createSuperpowerButtons({ player, scene }) {
  let container = document.getElementById("superpower-btns");
  if (container) container.remove();
  
  container = document.createElement("div");
  container.id = "superpower-btns";
  container.style.position = "fixed";
  container.style.bottom = "10px"; // Changed from default positioning to be at very bottom
  container.style.left = "50%";
  container.style.transform = "translateX(-50%)";
  container.style.display = "flex";
  container.style.flexDirection = "row";
  container.style.gap = "20px"; // Increased from 15px
  container.style.zIndex = "999"; // Lower z-index so it appears below game over
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.padding = "20px 30px"; // Increased padding
  container.style.background = "rgba(30, 40, 60, 0.9)";
  container.style.borderRadius = "25px"; // Slightly larger radius
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
    
    // Emoji icon
    const icon = document.createElement("div");
    icon.innerText = sp.icon;
    icon.style.fontSize = "1.6em";
    icon.style.lineHeight = "1";
    btn.appendChild(icon);
    
    // Counter below emoji (shows shop purchases only)
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
      // Check if button is disabled
      if (btn.disabled) return;
      
      // Check if player has purchased this superpower from shop
      if (superpowerPurchases[sp.key] > 0) {
        // Use superpower and decrement counter
        useSuperpower(sp.key, { player, scene, onComplete: null });
        
        // Visual feedback
        btn.style.animation = "sp-buyflash 0.4s";
        setTimeout(() => btn.style.animation = "", 410);
      } else {
        // Show message that they need to buy from shop first
        showNeedToBuyMessage(sp);
      }
    };
    
    container.appendChild(btn);
  });

  // Add CSS for animation
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

// Add function to update superpower button states
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

// Function to show message when trying to use unpurchased superpower
function showNeedToBuyMessage(superpower) {
  const existing = document.getElementById("need-to-buy-message");
  if (existing) existing.remove();

  const message = document.createElement("div");
  message.id = "need-to-buy-message";
  message.style.position = "fixed";
  message.style.top = "120px"; // Below coin display, same as green confirmation
  message.style.right = "20px"; // Top-right corner
  message.style.transform = "none"; // Remove center transform
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
    <div style="color: #ff0000; font-weight: bold; font-size: 0.8em;">NÃO TENHO!</div>
    <div style="font-size: 0.6em; margin-top: 6px;">${superpower.name}</div>
    <div style="font-size: 0.5em; margin-top: 4px; color: #ccc;">Compre na loja primeiro</div>
  `;

  document.body.appendChild(message);

  // Slide in from right
  setTimeout(() => {
    message.style.opacity = "1";
    message.style.transform = "translateX(0)";
  }, 10);
  
  // Slide out and remove
  setTimeout(() => {
    message.style.opacity = "0";
    message.style.transform = "translateX(100px)";
    setTimeout(() => {
      if (message.parentNode) message.parentNode.removeChild(message);
    }, 300);
  }, 2000);
}

// Function to update counter when purchasing from shop
export function updateSuperpowerCounters() {
  updateCounterDisplays();
}

// Make functions globally available
window.createSuperpowerButtons = createSuperpowerButtons;
window.updatePurchaseCounters = updateCounterDisplays;
