"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  width: number;
  height: number;
  shape: "rect" | "circle";
  opacity: number;
}

// GoDaddy brand palette + accents
const COLORS = [
  "#00a4a6",
  "#007c7e",
  "#00e0d0",
  "#ffffff",
  "#d8efef",
  "#ffe6d0",
  "#ece7fb",
  "#111111",
];

function newParticle(canvasWidth: number): Particle {
  return {
    x: Math.random() * canvasWidth,
    y: -20,
    vx: (Math.random() - 0.5) * 5,
    vy: Math.random() * 3.5 + 1.5,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    width: Math.random() * 10 + 6,
    height: Math.random() * 6 + 3,
    shape: Math.random() > 0.6 ? "circle" : "rect",
    opacity: 1,
  };
}

export function CongratsAnimation({ onDismiss }: { onDismiss?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter");

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("show"), 80);
    const exitTimer = setTimeout(() => setPhase("exit"), 4800);
    const doneTimer = setTimeout(() => onDismiss?.(), 5600);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onDismiss]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    let raf: number;
    let frame = 0;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (frame < 150) {
        for (let i = 0; i < 6; i++) particles.push(newParticle(canvas.width));
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.rotation += p.rotationSpeed;
        if (p.y > canvas.height * 0.72) p.opacity -= 0.025;

        if (p.y > canvas.height + 20 || p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        }
        ctx.restore();
      }

      frame++;
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const dismiss = () => {
    setPhase("exit");
    setTimeout(() => onDismiss?.(), 600);
  };

  return (
    <div
      className={`congrats-overlay congrats-overlay--${phase}`}
      onClick={dismiss}
      aria-modal="true"
      role="dialog"
      aria-label="Congratulations"
    >
      <canvas ref={canvasRef} className="congrats-canvas" />

      <div className={`congrats-card congrats-card--${phase}`}>
        <div className="congrats-badge">Investor-Ready</div>

        <div className="congrats-emoji" aria-hidden="true">🎉</div>

        <h1 className="congrats-headline">Congrats!</h1>
        <p className="congrats-sub">You&apos;re Investor-Ready</p>

        <div className="congrats-divider" />

        <p className="congrats-hint">Tap anywhere to continue</p>
      </div>
    </div>
  );
}
