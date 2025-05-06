"use client";

import { useState, useEffect, useRef } from "react";
import { Monitor } from "lucide-react";
import { motion } from "framer-motion";

interface WakeLockSentinel extends EventTarget {
  released: boolean;
  type: "screen";
  release(): Promise<void>;
  addEventListener(type: "release", listener: () => void): void;
  removeEventListener(type: "release", listener: () => void): void;
}

interface WakeLock {
  request(type: "screen"): Promise<WakeLockSentinel>;
}

// Use module augmentation to extend the Navigator interface
declare global {
  interface Navigator {
    WakeLock: WakeLock;
  }
}

interface WakeLockManagerProps {
  isActive: boolean;
}

export default function WakeLockManager({ isActive }: WakeLockManagerProps) {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [enabled, setEnabled] = useState(true);

  // Ref para mantener un seguimiento estable de las props y el estado
  const stateRef = useRef({
    isActive,
    enabled,
    wakeLock,
  });

  // Actualizar el ref cuando cambian las props o el estado
  useEffect(() => {
    stateRef.current = {
      isActive,
      enabled,
      wakeLock,
    };
  }, [isActive, enabled, wakeLock]);

  // Función para solicitar el wake lock
  const requestWakeLock = async () => {
    // Usar los valores actuales desde el ref
    const { isActive, enabled } = stateRef.current;

    if (isActive && enabled && "wakeLock" in navigator) {
      try {
        console.log("Requesting wake lock");
        const wakeLockObj = await navigator.wakeLock.request("screen");

        // Listener de liberación
        const handleRelease = () => {
          console.log("Wake Lock was released");
          setWakeLock(null);
        };

        wakeLockObj.addEventListener("release", handleRelease);

        console.log("Wake Lock is active");
        setWakeLock(wakeLockObj);

        // Devolver una función para limpiar el wakeLock
        return () => {
          wakeLockObj.removeEventListener("release", handleRelease);
          if (!wakeLockObj.released) {
            wakeLockObj
              .release()
              .catch((err) => console.error("Error releasing wake lock:", err));
          }
        };
      } catch (err) {
        console.error("Wake Lock request failed:", err);
      }
    }

    return undefined;
  };

  // Efecto principal para gestionar el wake lock
  useEffect(() => {
    let cleanupFn: (() => void) | undefined;

    // Solo solicitamos el wake lock cuando cambian las condiciones necesarias
    if (isActive && enabled) {
      // Si ya tenemos un wake lock activo y las condiciones no han cambiado, no hacemos nada
      if (!wakeLock || wakeLock.released) {
        requestWakeLock().then((cleanup) => {
          cleanupFn = cleanup;
        });
      }
    } else if (wakeLock && !wakeLock.released) {
      // Si las condiciones han cambiado y tenemos un wake lock activo, lo liberamos
      wakeLock
        .release()
        .then(() => console.log("Wake lock released due to condition change"))
        .catch((err) => console.error("Error releasing wake lock:", err));
    }

    // Manejador para cambios de visibilidad
    const handleVisibilityChange = async () => {
      // Si el documento vuelve a ser visible y debemos tener wake lock
      if (document.visibilityState === "visible") {
        const { isActive, enabled, wakeLock } = stateRef.current;

        if (isActive && enabled && (!wakeLock || wakeLock.released)) {
          requestWakeLock().then((cleanup) => {
            if (cleanupFn) {
              cleanupFn(); // Limpiar el anterior si existe
            }
            cleanupFn = cleanup;
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Limpieza al desmontar
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [isActive, enabled, wakeLock   ]);

  const toggleEnabled = () => {
    setEnabled((prev) => !prev);
  };

  return (
    <motion.button
      className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
        enabled
          ? "bg-blue-500 hover:bg-blue-600 text-white"
          : "bg-transparent border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-gray-300"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleEnabled}
    >
      <Monitor className="w-5 h-5 mr-2" />
      {enabled ? "Pantalla activa" : "Pantalla inactiva"}
    </motion.button>
  );
}
