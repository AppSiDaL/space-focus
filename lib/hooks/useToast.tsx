import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { v4 as uuidv4 } from "uuid";
import React from "react";

// Tipos - Añadimos la variante "destructive"
export type ToastVariant =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "destructive";

// El resto de las interfaces se mantienen igual
export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface AddToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

// Componente Toast - Actualizamos para incluir la variante destructive
const Toast = ({
  toast,
  onClose,
}: {
  toast: ToastProps;
  onClose: (id: string) => void;
}) => {
  const variantStyles = {
    default: "bg-slate-800 text-white border-slate-700",
    success: "bg-green-800/80 text-white border-green-700",
    error: "bg-red-800/80 text-white border-red-700",
    warning: "bg-amber-800/80 text-white border-amber-700",
    info: "bg-blue-800/80 text-white border-blue-700",
    destructive: "bg-red-900/90 text-white border-red-800 animate-pulse", // Nuevo estilo para destructive
  };

  const variantIcons = {
    default: null,
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h.01a1 1 0 100-2H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
    // Nuevo icono para destructive
    destructive: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  // El resto del componente se mantiene igual
  return (
    <div
      className={`flex items-start space-x-2 p-4 rounded-lg border shadow-lg backdrop-blur-md animate-slide-in ${
        variantStyles[toast.variant || "default"]
      }`}
    >
      {variantIcons[toast.variant || "default"] && (
        <div className="shrink-0 pt-0.5">
          {variantIcons[toast.variant || "default"]}
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <h3 className="font-medium">{toast.title}</h3>
        {toast.description && (
          <p className="text-sm opacity-90">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 rounded-full p-1 transition-colors hover:bg-white/10"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

// El resto del archivo se mantiene igual
const ToastContainer = ({
  toasts,
  removeToast,
}: {
  toasts: ToastProps[];
  removeToast: (id: string) => void;
}) => {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed top-0 right-0 z-50 p-4 md:p-6 max-w-sm w-full space-y-4 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={removeToast} />
        </div>
      ))}
    </div>,
    document.body
  );
};

// Hook useToast
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({
      title,
      description,
      variant = "default",
      duration = 5000,
    }: AddToastProps) => {
      const id = uuidv4();
      const newToast = { id, title, description, variant, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration !== Infinity) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  // Provee el componente y la función
  const ToastProvider = useCallback(() => {
    return <ToastContainer toasts={toasts} removeToast={removeToast} />;
  }, [toasts, removeToast]);

  return {
    toast,
    ToastProvider,
  };
}

// Exportar el hook por defecto
export default useToast;
