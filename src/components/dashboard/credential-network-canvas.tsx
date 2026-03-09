"use client";

import { useEffect, useRef, useCallback } from "react";

interface Node {
  x: number;
  y: number;
  z: number; // 0 (far) to 1 (near)
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  phase: number;
  phaseSpeed: number;
}

interface CredentialNetworkCanvasProps {
  nodeCount?: number;
}

export function CredentialNetworkCanvas({ nodeCount = 120 }: CredentialNetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const frameRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  const initNodes = useCallback((w: number, h: number) => {
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const z = Math.random();
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z,
        vx: (Math.random() - 0.5) * (0.3 + z * 0.5),
        vy: (Math.random() - 0.5) * (0.3 + z * 0.5),
        radius: 3 + z * 5, // 3–8px based on z
        opacity: 0.06 + z * 0.09, // 0.06–0.15 — very subtle on light bg
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.008 + Math.random() * 0.012,
      });
    }
    nodesRef.current = nodes;
  }, [nodeCount]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = sizeRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    ctx.clearRect(0, 0, w * dpr, h * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);

    const nodes = nodesRef.current;
    const mouse = mouseRef.current;

    // Update positions + mouse attract
    for (const node of nodes) {
      node.phase += node.phaseSpeed;

      // Gentle mouse attract within 80px
      const dx = mouse.x - node.x;
      const dy = mouse.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80 && dist > 0) {
        const force = (80 - dist) / 80 * 0.3;
        node.vx += (dx / dist) * force * 0.05;
        node.vy += (dy / dist) * force * 0.05;
      }

      // Orbital drift — slight speed cap
      const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      if (speed > 1.2) {
        node.vx = (node.vx / speed) * 1.2;
        node.vy = (node.vy / speed) * 1.2;
      }

      node.x += node.vx;
      node.y += node.vy;

      // Wrap edges
      if (node.x < -20) node.x = w + 20;
      if (node.x > w + 20) node.x = -20;
      if (node.y < -20) node.y = h + 20;
      if (node.y > h + 20) node.y = -20;
    }

    // Draw connections — 8% opacity warm rose
    // oklch(0.70 0.08 15) ≈ rgb(185, 140, 140) at 8% opacity
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const alpha = (1 - dist / 100) * 0.08;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(160, 110, 110, ${alpha})`;
          ctx.lineWidth = 0.75;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes — muted burgundy at low opacity
    // oklch(0.42 0.12 15) ≈ rgb(120, 55, 55) at 15% opacity
    for (const node of nodes) {
      const pulse = Math.sin(node.phase) * 0.3;
      const r = node.radius + pulse;
      const alpha = node.opacity;

      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(118, 50, 50, ${alpha})`;
      ctx.fill();
    }

    ctx.restore();

    frameRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        sizeRef.current = { w: width, h: height };
        initNodes(width, height);
      }
    });
    observer.observe(canvas.parentElement ?? canvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.parentElement?.addEventListener("mousemove", handleMouseMove);

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      canvas.parentElement?.removeEventListener("mousemove", handleMouseMove);
    };
  }, [draw, initNodes]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
