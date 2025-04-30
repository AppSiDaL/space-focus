"use server";

import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/getUser";

export async function checkAuthStatus() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    
    if (!token) {
      console.log("No se encontró token de autenticación");
      return { success: true, authenticated: false, user: null };
    }
    
    console.log("Verificando token...");
    const user = await getUserFromToken(token);
    console.log("Resultado de verificación:", user ? "Usuario encontrado" : "Usuario no encontrado");
    
    if (!user) {
      return { success: true, authenticated: false, user: null };
    }
    
    return { 
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        timezone: user.timezone || 'America/Mexico_City'
      }
    };
  } catch (error) {
    console.error("Error checking auth status:", error);
    return { success: true, authenticated: false, user: null, error: "Error checking authentication" };
  }
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("authToken")?.value;

  if (!sessionToken) {
    return null;
  }

  const user = await getUserFromToken(sessionToken);
  
  if (!user) {
    return null;
  }
  
  return user;
}