import React, { useEffect, useRef } from "react";

export default function PortalOverlay({ visible, duration = 2000, onFinish }) {
  const overlayRef = useRef();

  useEffect(() => {
    if (!visible) return;
    let start;
    function animate(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      // Efeito de opacidade pulsante e distorção
      const progress = Math.min(elapsed / duration, 1);
      const opacity = 0.45 + 0.35 * Math.sin(progress * Math.PI * 2);
      if (overlayRef.current) {
        overlayRef.current.style.opacity = opacity;
        overlayRef.current.style.backdropFilter = `blur(${8 * progress}px)`;
        overlayRef.current.style.background = `radial-gradient(ellipse at 50% 50%, rgba(124,77,255,${0.45 + 0.4 * progress}) 0%, rgba(33,150,243,${0.18 + 0.2 * progress}) 70%, rgba(0,0,0,0.01) 100%)`;
      }
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (onFinish) {
        onFinish();
      }
    }
    requestAnimationFrame(animate);
  }, [visible, duration, onFinish]);

  return (
    <div
      ref={overlayRef}
      style={{
        pointerEvents: "none",
        position: "fixed",
        zIndex: 9999,
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        opacity: 0,
        transition: "opacity 0.2s",
        background: "radial-gradient(ellipse at 50% 50%, rgba(124,77,255,0.45) 0%, rgba(33,150,243,0.18) 70%, rgba(0,0,0,0.01) 100%)",
        backdropFilter: "blur(0px)",
      }}
    />
  );
}
