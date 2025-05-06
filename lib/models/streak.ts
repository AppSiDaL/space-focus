import { query } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { Streak } from "@/types";

// Define tipos para los resultados de MySQL
type MySQLResultRow = Record<string, string | number | null | Buffer>;

/**
 * Obtiene la racha de un usuario
 */
export async function getStreakByUserId(userId: string): Promise<Streak | null> {
  const results = await query(
    "SELECT * FROM streaks WHERE userId = ?",
    [userId]
  ) as MySQLResultRow[];
  
  if (!results.length) return null;
  
  return results[0] as unknown as Streak;
}

/**
 * Crea una nueva racha para un usuario
 */
export async function createStreak(userId: string): Promise<Streak> {
  const id = uuidv4();
  const today = new Date().toISOString().split('T')[0];
  
  await query(
    "INSERT INTO streaks (id, userId, currentStreak, longestStreak, startDate) VALUES (?, ?, ?, ?, ?)",
    [id, userId, 0, 0, today]
  );
  
  const streak = await getStreakByUserId(userId);
  return streak as Streak;
}

/**
 * Obtiene o crea una racha para un usuario
 */
export async function getOrCreateStreak(userId: string): Promise<Streak> {
  const streak = await getStreakByUserId(userId);
  if (streak) return streak;
  
  return await createStreak(userId);
}
/**
 * Actualiza la racha de un usuario después de completar una tarea
 */
export async function updateStreakAfterCompletion(userId: string): Promise<Streak> {
  // Get today's date in user's local timezone
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const streak = await getOrCreateStreak(userId);
  
  console.log(`Debug - Today's date: ${today}, Last activity date: ${streak.lastActivityDate}`);
  
  // Si es el primer día de actividad
  if (!streak.lastActivityDate) {
    console.log("Case 1: First activity");
    await query(
      "UPDATE streaks SET currentStreak = 1, lastActivityDate = ? WHERE userId = ?",
      [today, userId]
    );
  } 
  // Si ya completó una actividad hoy, no hacemos nada
  else {
    // Convert to string format if it's a Date object
    const lastActivityDateStr = typeof streak.lastActivityDate === 'string' 
      ? streak.lastActivityDate 
      : `${(streak.lastActivityDate as Date).getFullYear()}-${String((streak.lastActivityDate as Date).getMonth() + 1).padStart(2, '0')}-${String((streak.lastActivityDate as Date).getDate()).padStart(2, '0')}`;
      
    if (lastActivityDateStr === today) {
      console.log("Case 2: Already completed today");
      // No se actualiza la racha
      return streak;
    }
    
    // Create date objects for comparison
    const lastDate = new Date(
      typeof streak.lastActivityDate === 'string' 
        ? streak.lastActivityDate 
        : streak.lastActivityDate
    );
    
    const todayDate = new Date(today);
    
    // Set hours to midnight for consistent comparison
    lastDate.setHours(0, 0, 0, 0);
    todayDate.setHours(0, 0, 0, 0);
    
    // Calcular diferencia en días
    const diffTime = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    console.log(`Debug - Diff days: ${diffDays}, Last date: ${lastDate.toDateString()}, Today date: ${todayDate.toDateString()}`);
    
    if (diffDays === 1) {
      console.log("Case 3: Consecutive day");
      // Día consecutivo - incrementar racha
      const newCurrentStreak = streak.currentStreak + 1;
      const newLongestStreak = Math.max(newCurrentStreak, streak.longestStreak);
      
      await query(
        "UPDATE streaks SET currentStreak = ?, longestStreak = ?, lastActivityDate = ? WHERE userId = ?",
        [newCurrentStreak, newLongestStreak, today, userId]
      );
    } else if (diffDays > 1) {
      console.log("Case 4: Streak broken");
      // La racha se rompió - reiniciar a 1
      await query(
        "UPDATE streaks SET currentStreak = 1, lastActivityDate = ? WHERE userId = ?",
        [today, userId]
      );
    } else {
      // This handles the case where diffDays might be 0 or negative due to timezone issues
      console.log(`Case 5: Unexpected scenario - diffDays: ${diffDays}`);
      // Always update the lastActivityDate and increment streak when the user completes a task
      const newCurrentStreak = streak.currentStreak + 1;
      const newLongestStreak = Math.max(newCurrentStreak, streak.longestStreak);
      
      await query(
        "UPDATE streaks SET currentStreak = ?, longestStreak = ?, lastActivityDate = ? WHERE userId = ?",
        [newCurrentStreak, newLongestStreak, today, userId]
      );
    }
  }
  
  // Obtener la racha actualizada
  return await getStreakByUserId(userId) as Streak;
}

/**
 * Verifica si la racha del usuario se ha perdido
 */
export async function checkLostStreak(userId: string): Promise<boolean> {
  const streak = await getStreakByUserId(userId);
  if (!streak || !streak.lastActivityDate || streak.currentStreak === 0) return false;
  
  const lastDate = new Date(streak.lastActivityDate);
  const today = new Date();
  
  // Resetear la hora para comparar solo fechas
  today.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Si han pasado 2 o más días, la racha se ha perdido
  if (diffDays >= 2) {
    await query(
      "UPDATE streaks SET currentStreak = 0 WHERE userId = ?",
      [userId]
    );
    return true;
  }
  
  return false;
}


