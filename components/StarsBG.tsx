"use client";

import React, { useEffect, useRef } from "react";
import "./StarsBG.css";

export default function StarsBG() {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bgRef.current) return;

    // Crear valores CSS personalizados aleatorios
    const root = bgRef.current;

    // Posiciones para estrellas pequeñas
    root.style.setProperty("--small-x-1", `${Math.random() * 550}px`);
    root.style.setProperty("--small-y-1", `${Math.random() * 550}px`);
    root.style.setProperty("--small-x-2", `${Math.random() * 550}px`);
    root.style.setProperty("--small-y-2", `${Math.random() * 550}px`);

    // Posiciones para estrellas medianas
    root.style.setProperty("--medium-x-1", `${Math.random() * 400}px`);
    root.style.setProperty("--medium-y-1", `${Math.random() * 400}px`);
    root.style.setProperty("--medium-x-2", `${Math.random() * 400}px`);
    root.style.setProperty("--medium-y-2", `${Math.random() * 400}px`);

    // Posiciones para estrellas grandes
    root.style.setProperty("--large-x-1", `${Math.random() * 600}px`);
    root.style.setProperty("--large-y-1", `${Math.random() * 600}px`);
    root.style.setProperty("--large-x-2", `${Math.random() * 600}px`);
    root.style.setProperty("--large-y-2", `${Math.random() * 600}px`);

    // Velocidades de parpadeo individualizadas
    root.style.setProperty(
      "--twinkle-speed-1",
      `${1.2 + Math.random() * 1.3}s`
    );
    root.style.setProperty(
      "--twinkle-speed-2",
      `${1.5 + Math.random() * 1.2}s`
    );
    root.style.setProperty(
      "--twinkle-speed-3",
      `${1.7 + Math.random() * 1.3}s`
    );
    root.style.setProperty(
      "--twinkle-speed-4",
      `${1.3 + Math.random() * 1.1}s`
    );
    root.style.setProperty(
      "--twinkle-speed-5",
      `${1.6 + Math.random() * 1.4}s`
    );
    root.style.setProperty(
      "--twinkle-speed-6",
      `${1.4 + Math.random() * 1.2}s`
    );

    // Opacidades mínimas aleatorias
    root.style.setProperty("--opacity-min-1", `${0.1 + Math.random() * 0.2}`);
    root.style.setProperty("--opacity-min-2", `${0.15 + Math.random() * 0.15}`);
    root.style.setProperty("--opacity-min-3", `${0.05 + Math.random() * 0.15}`);
    root.style.setProperty("--opacity-min-4", `${0.1 + Math.random() * 0.1}`);
    root.style.setProperty("--opacity-min-5", `${0.2 + Math.random() * 0.1}`);
    root.style.setProperty("--opacity-min-6", `${0.15 + Math.random() * 0.15}`);

    // Opacidades máximas aleatorias
    root.style.setProperty("--opacity-max-1", `${0.85 + Math.random() * 0.15}`);
    root.style.setProperty("--opacity-max-2", `${0.8 + Math.random() * 0.15}`);
    root.style.setProperty("--opacity-max-3", `${0.9 + Math.random() * 0.1}`);
    root.style.setProperty("--opacity-max-4", `${0.85 + Math.random() * 0.1}`);
    root.style.setProperty("--opacity-max-5", `${0.8 + Math.random() * 0.2}`);
    root.style.setProperty("--opacity-max-6", `${0.9 + Math.random() * 0.1}`);
  }, []);

  return (
    <div className="starry-background" ref={bgRef}>
      <div className="stars stars-small-1"></div>
      <div className="stars stars-small-2"></div>
      <div className="stars stars-small-3"></div>
      <div className="stars stars-medium-1"></div>
      <div className="stars stars-medium-2"></div>
      <div className="stars stars-medium-3"></div>
      <div className="stars stars-large-1"></div>
      <div className="stars stars-large-2"></div>
      <div className="stars stars-large-3"></div>
    </div>
  );
}
