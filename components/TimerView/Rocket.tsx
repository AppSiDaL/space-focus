"use client";

import { motion } from "framer-motion";

interface RocketProps {
  state: "ready" | "flying";
}

export default function Rocket({ state }: RocketProps) {
  return (
    <div className="relative">
      {state === "ready" ? (
        <motion.div
          initial={{ y: 10 }}
          animate={{ y: [10, 0, 10] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <svg
            width="80"
            height="120"
            viewBox="0 0 80 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Rocket Base */}
            <motion.path
              d="M40 10C25 10 15 30 15 60V90H65V60C65 30 55 10 40 10Z"
              fill="#3B82F6"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            />

            {/* Rocket Window */}
            <circle cx="40" cy="40" r="10" fill="#1E3A8A" />
            <circle cx="40" cy="40" r="7" fill="#93C5FD" />

            {/* Rocket Bottom */}
            <path d="M15 90H65L60 100H20L15 90Z" fill="#2563EB" />

            {/* Rocket Fins */}
            <path d="M15 60L5 80V90H15V60Z" fill="#2563EB" />
            <path d="M65 60L75 80V90H65V60Z" fill="#2563EB" />

            {/* Rocket Top */}
            <path d="M40 10L25 30H55L40 10Z" fill="#2563EB" />

            {/* Flame when ready */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
            >
              <path d="M30 100L40 120L50 100H30Z" fill="#F59E0B" />
            </motion.g>
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 0.6,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0.1,
              }}
            >
              <path d="M35 100L40 115L45 100H35Z" fill="#F97316" />
            </motion.g>
          </svg>
        </motion.div>
      ) : (
        <motion.div
          animate={{
            rotate: [-5, 5, -3, 3, 0],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <svg
            width="80"
            height="120"
            viewBox="0 0 80 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Rocket Base */}
            <motion.path
              d="M40 10C25 10 15 30 15 60V90H65V60C65 30 55 10 40 10Z"
              fill="#3B82F6"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            />

            {/* Rocket Window */}
            <circle cx="40" cy="40" r="10" fill="#1E3A8A" />
            <circle cx="40" cy="40" r="7" fill="#93C5FD" />

            {/* Rocket Bottom */}
            <path d="M15 90H65L60 100H20L15 90Z" fill="#2563EB" />

            {/* Rocket Fins */}
            <path d="M15 60L5 80V90H15V60Z" fill="#2563EB" />
            <path d="M65 60L75 80V90H65V60Z" fill="#2563EB" />

            {/* Rocket Top */}
            <path d="M40 10L25 30H55L40 10Z" fill="#2563EB" />

            {/* Enhanced Flame when flying */}
            <motion.g
              initial={{ opacity: 0, scaleY: 0.5 }}
              animate={{
                opacity: [0.7, 1, 0.7],
                scaleY: [0.8, 1.4, 0.8],
              }}
              transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
            >
              <path d="M30 100L40 140L50 100H30Z" fill="#F59E0B" />
            </motion.g>
            <motion.g
              initial={{ opacity: 0, scaleY: 0.5 }}
              animate={{
                opacity: [0.7, 1, 0.7],
                scaleY: [0.8, 1.5, 0.8],
              }}
              transition={{
                duration: 0.3,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0.1,
              }}
            >
              <path d="M35 100L40 125L45 100H35Z" fill="#F97316" />
            </motion.g>

            {/* Flame particles */}
            <motion.g
              animate={{
                y: [0, 15, 30],
                opacity: [1, 0.5, 0],
                scale: [1, 0.8, 0.5],
              }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            >
              <circle cx="37" cy="110" r="2" fill="#FBBF24" />
              <circle cx="43" cy="115" r="1.5" fill="#FBBF24" />
              <circle cx="40" cy="120" r="2" fill="#FBBF24" />
            </motion.g>

            {/* Additional flame trail */}
            <motion.g
              animate={{
                y: [5, 25, 45],
                opacity: [0.7, 0.3, 0],
                scale: [0.8, 0.6, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 0.2,
              }}
            >
              <circle cx="38" cy="130" r="1.5" fill="#FBBF24" />
              <circle cx="42" cy="135" r="1" fill="#FBBF24" />
              <circle cx="40" cy="140" r="1.5" fill="#FBBF24" />
            </motion.g>
          </svg>
        </motion.div>
      )}
    </div>
  );
}
