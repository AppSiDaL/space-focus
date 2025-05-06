"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useSpring } from "framer-motion";
import { Pause, X } from "lucide-react";
import Rocket from "./Rocket";
import { Task } from "@/types";
import StarsBG from "../StarsBG";
import WakeLockManager from "./WakeLockManager";

const FOCUS_QUOTES = [
  "Focus is the art of knowing what to ignore.",
  "The successful warrior is the average person with laser-like focus.",
  "Where focus goes, energy flows.",
  "Stay focused, go after your dreams, and keep moving toward your goals.",
  "Focus on the journey, not the destination.",
  "Your focus determines your reality.",
  "Concentrate all your thoughts on the task at hand.",
  "It's not that I'm so smart, it's just that I stay with problems longer.",
  "The more intensely we feel about an idea or a goal, the more assuredly the idea will become reality.",
  "Lack of direction, not lack of time, is the problem. We all have 24-hour days.",
  "Focus on being productive instead of busy.",
  "Starve your distractions, feed your focus.",
  "The sun's rays do not burn until brought to a focus.",
  "What you stay focused on will grow.",
  "Focus is a matter of deciding what things you're not going to do.",
];

interface FocusViewProps {
  activity: Task | null;
  initialTime: number;
  onExit: (remainingTime: number) => void;
}

export default function FocusView({
  activity,
  initialTime,
  onExit,
}: FocusViewProps) {
  const [remainingTime, setRemainingTime] = useState(initialTime);
  const [isPaused, setIsPaused] = useState(false);
  const [quote, setQuote] = useState("");
  const [, setIsComplete] = useState(false);

  // Use spring physics for smoother motion
  const rocketX = useSpring(0, { stiffness: 100, damping: 30 });
  const rocketY = useSpring(-80, { stiffness: 100, damping: 30 }); // Start slightly above center

  // Track the virtual position (for continuous movement effect)
  const virtualPositionRef = useRef({ x: 0, y: 0 });

  // Create a reference for the animation frame
  const animationRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);

  // Function to get a random quote
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * FOCUS_QUOTES.length);
    return FOCUS_QUOTES[randomIndex];
  };

  // Set initial quote and change it every minute
  useEffect(() => {
    // Set initial quote
    setQuote(getRandomQuote());

    // Change quote every minute
    const quoteInterval = setInterval(() => {
      setQuote(getRandomQuote());
    }, 60000); // 60000ms = 1 minute

    return () => clearInterval(quoteInterval);
  }, []);

  // Set up the rocket movement with smoother animation
  useEffect(() => {
    let lastTimestamp = 0;

    const animateRocket = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Increment time more slowly for smoother movement
      timeRef.current += deltaTime * 0.0005;

      // Complex movement pattern with different frequencies for horizontal movement
      const x =
        Math.sin(timeRef.current * 0.5) * 80 +
        Math.sin(timeRef.current * 1.3) * 40;

      // For vertical movement, we'll keep the rocket visible but create the illusion of continuous upward movement
      // by updating the virtual position for parallax effect
      virtualPositionRef.current.y -= 0.5; // Continuous virtual upward movement

      // The actual rocket stays within a visible range with gentle oscillation
      const oscillationY =
        Math.cos(timeRef.current * 0.7) * 30 +
        Math.cos(timeRef.current * 1.1) * 20;
      const visibleY = -80 + oscillationY; // Keep rocket in upper portion of screen with oscillation

      // Set spring targets for smooth animation
      rocketX.set(x);
      rocketY.set(visibleY);

      // Update the virtual position for parallax (continuous movement effect)
      virtualPositionRef.current.x = x;

      animationRef.current = requestAnimationFrame(animateRocket);
    };

    animationRef.current = requestAnimationFrame(animateRocket);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [rocketX, rocketY]);

  // Inside the useEffect for the timer:
  const [timerFinished, setTimerFinished] = useState(false);

  useEffect(() => {
    if (!activity || isPaused) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsComplete(true);
          setTimerFinished(true); // Marca que el timer ha terminado
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activity, isPaused]);

  // Efecto separado para manejar la salida
  useEffect(() => {
    if (timerFinished) {
      // Pequeño delay antes de salir
      const exitTimeout = setTimeout(() => onExit(remainingTime), 1000);
      return () => clearTimeout(exitTimeout);
    }
  }, [timerFinished, onExit, remainingTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  if (!activity) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-[#070b1a] flex flex-col items-center justify-between overflow-hidden z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <StarsBG />
      </div>

      <div className="flex flex-col items-center justify-center flex-1 w-full z-10">
        <div className="relative mb-16">
          <motion.div
            className="absolute"
            style={{
              top: "-120px",
              left: "50%",
              x: rocketX,
              y: rocketY,
            }}
          >
            <Rocket state="flying" />
          </motion.div>

          <motion.h1
            className="text-white text-8xl font-bold"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {formatTime(remainingTime)}
          </motion.h1>

          <motion.div
            className="flex flex-col items-center mt-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h2 className="text-white text-xl mb-2">{activity.title}</h2>
          </motion.div>
        </div>

        <motion.div
          className="text-center max-w-md mx-auto z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={quote} // Key changes with quote to trigger animation
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p className="text-gray-400 italic">&ldquo;{quote}&rdquo;</p>
        </motion.div>
      </div>

      <div className="flex space-x-4 z-10 pb-12">
        <motion.button
          className="flex items-center justify-center px-4 py-2 bg-[#1A2547] hover:bg-[#253366] text-white rounded-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePause}
        >
          <Pause className="w-5 h-5 mr-2" /> Pausar
        </motion.button>

        {/* Inserto el WakeLockManager aquí */}
        <WakeLockManager isActive={!isPaused} />

        <motion.button
          className="flex items-center justify-center px-4 py-2 bg-transparent border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-gray-300 rounded-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onExit(remainingTime)}
        >
          <X className="w-5 h-5 mr-2" /> Salir
        </motion.button>
      </div>
    </motion.div>
  );
}
