import React, { useEffect, useRef, useState } from "react";

export default function PortalTeleportEffect({ visible, duration = 1000, onFinish }) {
  const [show, setShow] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const animRef = useRef();

  useEffect(() => {
    if (visible) {
      setShow(true);
      setOpacity(0);
      let start;
      function animate(ts) {
        if (!start) start = ts;
        const elapsed = ts - start;
        let progress = Math.min(elapsed / duration, 1);
        // Fade in (primeiros 20%), depois fade out (últimos 20%)
        let op;
        if (progress < 0.2) {
          op = progress / 0.2;
        } else if (progress > 0.8) {
          op = (1 - progress) / 0.2;
        } else {
          op = 1;
        }
        setOpacity(op);
        if (progress < 1) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          setShow(false);
          setOpacity(0);
          if (onFinish) onFinish();
        }
      }
      animRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animRef.current);
    } else {
      setShow(false);
      setOpacity(0);
    }
  }, [visible, duration, onFinish]);

  if (!show) return null;

  return (
    <div
      style={{
        pointerEvents: "none",
        position: "fixed",
        zIndex: 9999,
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        opacity,
        transition: "opacity 0.1s",
        background: "radial-gradient(ellipse at 50% 50%, rgba(124,77,255,0.7) 0%, rgba(33,150,243,0.4) 60%, rgba(0,0,0,0.01) 100%)",
        backdropFilter: "blur(8px)",
      }}
    />
  );
}
