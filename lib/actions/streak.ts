"use server";

import { 
  getStreakByUserId, 
  getOrCreateStreak, 
  updateStreakAfterCompletion, 
  checkLostStreak, 
} from "@/lib/models/streak";
import { Streak } from "@/types";
import { getSession } from "@/lib/auth/session";

/**
 * Obtiene la racha del usuario actual
 */
export async function getUserStreak(): Promise<Streak | null> {
  const user = await getSession();
  if (!user) {
    throw new Error("No autenticado");
  }
  
  return await getStreakByUserId(user.id);
}

/**
 * Inicializa la racha del usuario si no existe
 */
export async function initUserStreak(): Promise<Streak> {
  const user = await getSession();
  if (!user?.id) {
    throw new Error("No autenticado");
  }
  
  return await getOrCreateStreak(user.id);
}

/**
 * Actualiza la racha del usuario después de completar una tarea
 * y devuelve la racha actualizada
 */
export async function updateStreakOnTaskCompletion() {
    const user = await getSession();
    if (!user?.id) {
      throw new Error("No autenticado");
    }
    
    const updatedStreak = await updateStreakAfterCompletion(user.id);
    
    return {
      currentStreak: updatedStreak.currentStreak,
      longestStreak: updatedStreak.longestStreak,
      lastActivityDate: updatedStreak.lastActivityDate
    };
  }
/**
 * Verifica si la racha del usuario se ha perdido y la actualiza si es necesario
 */
export async function verifyUserStreak(): Promise<{ 
  streakLost: boolean, 
  streak: Streak | null 
}> {
  const user = await getSession();
  if (!user?.id) {
    throw new Error("No autenticado");
  }
  
  const streakLost = await checkLostStreak(user.id);
  const updatedStreak = await getStreakByUserId(user.id);
  
  return {
    streakLost,
    streak: updatedStreak
  };
}

/**
 * Obtiene estadísticas de la racha del usuario
 */
export async function getStreakStats(): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  daysUntilLost: number | null;
}> {
  const user = await getSession();
  if (!user?.id) {
    throw new Error("No autenticado");
  }
  
  const streak = await getStreakByUserId(user.id);
  if (!streak) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      daysUntilLost: null
    };
  }
  
  let daysUntilLost = null;
  if (streak.lastActivityDate && streak.currentStreak > 0) {
    const lastDate = new Date(streak.lastActivityDate);
    const today = new Date();
    
    // Resetear la hora para comparar solo fechas
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Si la actividad fue hoy o ayer, aún puede mantener la racha
    if (diffDays <= 1) {
      daysUntilLost = 1 - diffDays;
    }
  }
  
  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastActivityDate: streak.lastActivityDate,
    daysUntilLost
  };
}

/**
 * Obtiene la racha actual del usuario
 */
export async function getCurrentStreak(): Promise<Streak | null> {
    const user = await getSession();
    if (!user?.id) {
      return null;
    }
    
    const streak = await getStreakByUserId(user.id);
    return streak
  }
