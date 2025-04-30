"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkAuthStatus } from "@/lib/actions/auth";
import { logoutUser } from "@/lib/actions/logoutUser";

interface User {
  id: string;
  email: string;
  name: string;
  timezone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      console.log("Iniciando verificación de autenticación...");

      // Crear una promesa con timeout para evitar bloqueos
      const authPromise = checkAuthStatus();
      const timeoutPromise = new Promise<{
        success: false;
        authenticated: false;
        timeout: true;
      }>((resolve) => {
        setTimeout(() => {
          console.log("Timeout en verificación de autenticación");
          resolve({ success: false, authenticated: false, timeout: true });
        }, 3000); // 3 segundos de timeout
      });

      const result = await Promise.race([authPromise, timeoutPromise]);

      if ("timeout" in result) {
        console.warn("La verificación de autenticación tardó demasiado");
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }

      console.log("Resultado de autenticación:", result);

      if (result.success && result.authenticated && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        return true;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const result = await logoutUser();
      if (result.success) {
        setUser(null);
        setIsAuthenticated(false);
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on initial load
  useEffect(() => {
    let isMounted = true;

    const authTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn("Initial auth check timed out");
        setIsLoading(false);
        setIsAuthenticated(false);
      }
    }, 5000); // 5 segundos máximo para la verificación inicial

    checkAuth().finally(() => {
      if (authTimeout) clearTimeout(authTimeout);
    });

    return () => {
      isMounted = false;
      clearTimeout(authTimeout);
    };
  }, [isLoading]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, checkAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
