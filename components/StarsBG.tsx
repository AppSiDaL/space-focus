"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./StarsBG.css";

// Constantes configurables para la animación estelar
const STAR_ANIMATION = {
  // Tiempos de parpadeo (segundos)
  TWINKLE_SPEED_MIN: 1.2,
  TWINKLE_SPEED_MAX: 3.0,

  // Rangos de opacidad
  OPACITY_MIN_RANGE: { MIN: 0.05, MAX: 0.2 },
  OPACITY_MAX_RANGE: { MIN: 0.8, MAX: 1.0 },
};

// Constantes para cometas
const COMET_CONFIG = {
  // Número de cometas que pueden aparecer
  COUNT: 8,

  // Tamaños
  WIDTH_MIN: 50,
  WIDTH_MAX: 200,

  // Tiempos (segundos)
  DURATION_MIN: 2,
  DURATION_MAX: 7,

  // Intervalos entre apariciones (segundos)
  MIN_INTERVAL: 30, // Mínimo tiempo entre cometas
  MAX_REPEAT_DELAY: 60, // Máximo tiempo adicional de espera
  BASE_REPEAT_DELAY: 50, // Tiempo base de espera

  // Opacidad
  OPACITY_MIN: 0.7,
  OPACITY_MAX: 1.0,
};

// Array de colores para los cometas
const COMET_COLORS = [
  "#ffffff", // Blanco
  "#8be9fd", // Celeste
  "#ffb86c", // Naranja
  "#ff79c6", // Rosa
  "#bd93f9", // Púrpura
  "#50fa7b", // Verde
];

// Tipos para los props y estado
interface CometProps {
  color: string;
  delay: number;
  duration: number;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  width: number;
  opacity: number;
  index: number;
}

interface CometState {
  id: number;
  color: string;
  delay: number;
  duration: number;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  width: number;
  opacity: number;
}

// Componente para el cometa
const Comet: React.FC<CometProps> = ({
  color,
  delay,
  duration,
  startPosition,
  endPosition,
  width,
  opacity,
  index,
}) => {
  // Calcular el ángulo de la trayectoria
  const angle =
    (Math.atan2(
      endPosition.y - startPosition.y,
      endPosition.x - startPosition.x
    ) *
      180) /
    Math.PI;

  // Calcular el retardo adicional basado en el índice para escalonar las apariciones
  const staggeredDelay = delay + index * COMET_CONFIG.MIN_INTERVAL;

  return (
    <motion.div
      className="comet"
      initial={{
        x: startPosition.x,
        y: startPosition.y,
        rotate: angle,
        opacity: 0,
        width: `${width}px`,
      }}
      animate={{
        x: endPosition.x,
        y: endPosition.y,
        opacity: [0, opacity, opacity, 0],
      }}
      transition={{
        duration: duration,
        delay: staggeredDelay,
        repeat: Infinity,
        repeatDelay:
          COMET_CONFIG.BASE_REPEAT_DELAY +
          Math.random() * COMET_CONFIG.MAX_REPEAT_DELAY,
        ease: "easeInOut",
      }}
      style={
        {
          "--comet-color": color,
        } as React.CSSProperties
      }
    />
  );
};

export default function StarsBG(): React.ReactElement {
  const bgRef = useRef<HTMLDivElement>(null);
  const [comets, setComets] = useState<CometState[]>([]);

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
    for (let i = 1; i <= 6; i++) {
      const speed =
        STAR_ANIMATION.TWINKLE_SPEED_MIN +
        Math.random() *
          (STAR_ANIMATION.TWINKLE_SPEED_MAX - STAR_ANIMATION.TWINKLE_SPEED_MIN);
      root.style.setProperty(`--twinkle-speed-${i}`, `${speed}s`);
    }

    // Opacidades mínimas aleatorias
    for (let i = 1; i <= 6; i++) {
      const minOpacity =
        STAR_ANIMATION.OPACITY_MIN_RANGE.MIN +
        Math.random() *
          (STAR_ANIMATION.OPACITY_MIN_RANGE.MAX -
            STAR_ANIMATION.OPACITY_MIN_RANGE.MIN);
      root.style.setProperty(`--opacity-min-${i}`, `${minOpacity}`);
    }

    // Opacidades máximas aleatorias
    for (let i = 1; i <= 6; i++) {
      const maxOpacity =
        STAR_ANIMATION.OPACITY_MAX_RANGE.MIN +
        Math.random() *
          (STAR_ANIMATION.OPACITY_MAX_RANGE.MAX -
            STAR_ANIMATION.OPACITY_MAX_RANGE.MIN);
      root.style.setProperty(`--opacity-max-${i}`, `${maxOpacity}`);
    }

    // Generar cometas con trayectorias aleatorias
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Funciones para generar puntos de inicio y fin aleatorios
    const generateRandomTrajectory = (): {
      start: { x: number; y: number };
      end: { x: number; y: number };
    } => {
      // Determinar tipo de trayectoria (0-3)
      const trajectoryType = Math.floor(Math.random() * 4);

      switch (trajectoryType) {
        case 0: // Izquierda a derecha
          return {
            start: { x: -200, y: Math.random() * windowHeight },
            end: { x: windowWidth + 200, y: Math.random() * windowHeight },
          };
        case 1: // Derecha a izquierda
          return {
            start: { x: windowWidth + 200, y: Math.random() * windowHeight },
            end: { x: -200, y: Math.random() * windowHeight },
          };
        case 2: // Arriba a abajo (diagonal)
          return {
            start: { x: Math.random() * windowWidth, y: -200 },
            end: {
              x: Math.random() * windowWidth * 1.5 - windowWidth * 0.25,
              y: windowHeight + 200,
            },
          };
        case 3: // Abajo a arriba (diagonal)
          return {
            start: { x: Math.random() * windowWidth, y: windowHeight + 200 },
            end: {
              x: Math.random() * windowWidth * 1.5 - windowWidth * 0.25,
              y: -200,
            },
          };
        default:
          return {
            start: { x: -200, y: Math.random() * windowHeight },
            end: { x: windowWidth + 200, y: Math.random() * windowHeight },
          };
      }
    };

    const newComets = Array.from(
      { length: COMET_CONFIG.COUNT },
      (_, i): CometState => {
        const trajectory = generateRandomTrajectory();
        return {
          id: i,
          color: COMET_COLORS[Math.floor(Math.random() * COMET_COLORS.length)],
          delay: Math.random() * 5, // Retraso inicial aleatorio reducido (0-5 segundos)
          duration:
            COMET_CONFIG.DURATION_MIN +
            Math.random() *
              (COMET_CONFIG.DURATION_MAX - COMET_CONFIG.DURATION_MIN),
          startPosition: trajectory.start,
          endPosition: trajectory.end,
          width:
            COMET_CONFIG.WIDTH_MIN +
            Math.random() * (COMET_CONFIG.WIDTH_MAX - COMET_CONFIG.WIDTH_MIN),
          opacity:
            COMET_CONFIG.OPACITY_MIN +
            Math.random() *
              (COMET_CONFIG.OPACITY_MAX - COMET_CONFIG.OPACITY_MIN),
        };
      }
    );

    setComets(newComets);
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
      {comets.map((comet, index) => (
        <Comet
          key={comet.id}
          color={comet.color}
          delay={comet.delay}
          duration={comet.duration}
          startPosition={comet.startPosition}
          endPosition={comet.endPosition}
          width={comet.width}
          opacity={comet.opacity}
          index={index} // Pasar el índice para escalonar las apariciones
        />
      ))}
    </div>
  );
}
