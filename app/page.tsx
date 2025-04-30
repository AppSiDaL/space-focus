"use client";

import StarsBG from "@/components/StarsBG";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import NotificationPermission from "@/components/NotificationPermission";

const TimerView = dynamic(() => import("@/components/TimerView/TimerView"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse text-white text-center p-8">
      Cargando interfaz...
    </div>
  ),
});

export default function Page() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    console.log("Auth state:", { isAuthenticated, isLoading });

    if (!isLoading && !isAuthenticated) {
      setIsRedirecting(true);

      const redirectTimeout = setTimeout(() => {
        router.push("/login");
      }, 100);

      return () => clearTimeout(redirectTimeout);
    }
  }, [isAuthenticated, isLoading, router]);

  // Función para reiniciar manualmente la sesión si hay problemas
  const handleResetSession = () => {
    logout();
    window.localStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    router.push("/login");
  };

  if (isLoading || isRedirecting) {
    return (
      <>
        <div className="relative min-h-screen flex items-center justify-center">
          <StarsBG />
          <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 ios-safe-top flex-shrink-0">
            <div className="flex justify-between items-center p-2">
              <h1 className="text-xl font-bold gradient-text">Space Focus</h1>
            </div>
          </header>
          <div className="relative z-10 text-white flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-4">
              <Loader className="animate-spin" size={20} />
              <div className="animate-pulse">Verificando sesión...</div>
            </div>

            {isLoading && !isRedirecting && (
              <button
                onClick={handleResetSession}
                className="mt-4 px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded-md text-sm"
              >
                Reiniciar sesión
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <StarsBG />
        <div className="relative z-10 text-white text-center">
          <p className="mb-4">Sesión no válida. Redirigiendo al login...</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded-md text-sm"
          >
            Ir al login manualmente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <StarsBG />
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 ios-safe-top flex-shrink-0">
        <div className="flex justify-between items-center p-2">
          <h1 className="text-xl font-bold gradient-text">Space Focus</h1>
        </div>
      </header>
      <main className="relative z-10">
        <NotificationPermission />
        <div>
          <div className="container mx-auto px-2 pb-2 ios-safe-bottom">
            <div
              className="space-y-3"
              id="focus-panel"
              role="tabpanel"
              aria-labelledby="focus-tab"
            >
              <TimerView />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
