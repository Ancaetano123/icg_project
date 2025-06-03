import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Portal } from "./components/Portal";
import PortalTeleportEffect from "./components/PortalTeleportEffect";

export default function App() {
  const [teleportEffect, setTeleportEffect] = useState(false);

  function handlePortalTouch() {
    // 1. Teletransporta imediatamente
    teleportPlayerSomehow(); // <-- sua função de teletransporte
    // 2. Mostra o efeito visual
    setTeleportEffect(true);
  }

  function handleEffectFinish() {
    setTeleportEffect(false);
  }

  return (
    <Canvas>
      {/* ...outros componentes e lógica... */}
      <Portal tileIndex={0} onTouch={handlePortalTouch} />
      <PortalTeleportEffect visible={teleportEffect} onFinish={handleEffectFinish} />
    </Canvas>
  );
}