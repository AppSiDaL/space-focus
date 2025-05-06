"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, X, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Definir tipos
type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

// Crear contexto
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Componente individual de toast
function Toast({
  id,
  message,
  type,
  onClose,
}: ToastProps & { onClose: (id: string) => void }) {
  // Definir estilos y colores según el tipo
  const styles = {
    success: {
      bg: "bg-green-800/20",
      border: "border-green-600/60",
      icon: <Check className="text-green-400 w-5 h-5" />,
    },
    error: {
      bg: "bg-red-800/20",
      border: "border-red-600/60",
      icon: <X className="text-red-400 w-5 h-5" />,
    },
    info: {
      bg: "bg-blue-800/20",
      border: "border-blue-600/60",
      icon: <Info className="text-blue-400 w-5 h-5" />,
    },
    warning: {
      bg: "bg-amber-800/20",
      border: "border-amber-600/60",
      icon: <AlertCircle className="text-amber-400 w-5 h-5" />,
    },
  };

  const style = styles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`${style.bg} backdrop-blur-sm border ${style.border} px-4 py-3 rounded-md shadow-lg flex items-center max-w-md w-full`}
    >
      <div className="mr-3 flex-shrink-0">{style.icon}</div>
      <div className="flex-1 text-white">{message}</div>
      <button
        onClick={() => onClose(id)}
        className="ml-3 text-gray-300 hover:text-white flex-shrink-0"
      >
        <X size={18} />
      </button>
    </motion.div>
  );
}

// Proveedor del contexto
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Manejar la hidratación del cliente
  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);

      setToasts((prevToasts) => [
        ...prevToasts,
        { id, message, type, duration },
      ]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "success", duration);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "error", duration);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "info", duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "warning", duration);
    },
    [showToast]
  );

  const value = {
    showToast,
    success,
    error,
    info,
    warning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {isMounted &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end">
            <AnimatePresence>
              {toasts.map((toast) => (
                <Toast
                  key={toast.id}
                  id={toast.id}
                  message={toast.message}
                  type={toast.type}
                  duration={toast.duration}
                  onClose={removeToast}
                />
              ))}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

// Hook para usar el contexto
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
