import { query } from "@/lib/db";
import { Task, TaskInput, TaskUpdateInput } from "@/types";
import { v4 as uuidv4 } from "uuid";

/**
 * Obtiene todas las tareas de un usuario
 */
export async function getTasksByUserId(userId: string): Promise<Task[]> {
  const tasks = await query(
    "SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt DESC",
    [userId]
  ) as any[];
  
  return tasks.map(task => ({
    ...task,
    completed: !!task.completed, // Ensure boolean type
    isRecurring: !!task.isRecurring, // Ensure boolean type
    scheduledDays: task.scheduledDays ? JSON.parse(task.scheduledDays) : null,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
    lastCompleted: task.lastCompleted ? new Date(task.lastCompleted) : null
  }));
}

/**
 * Obtiene una tarea específica por su ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
  const tasks = await query("SELECT * FROM tasks WHERE id = ?", [id]) as any[];
  
  if (tasks.length === 0) return null;
  
  return {
    ...tasks[0],
    completed: !!tasks[0].completed, // Ensure boolean type
    isRecurring: !!tasks[0].isRecurring, // Ensure boolean type
    scheduledDays: tasks[0].scheduledDays ? JSON.parse(tasks[0].scheduledDays) : null,
    createdAt: new Date(tasks[0].createdAt),
    updatedAt: new Date(tasks[0].updatedAt),
    lastCompleted: tasks[0].lastCompleted ? new Date(tasks[0].lastCompleted) : null
  };
}

/**
 * Crea una nueva tarea
 */
export async function createTask(
  userId: string,
  taskData: TaskInput
): Promise<Task> {
  const id = uuidv4();
  const now = new Date();
  const isoDate = now.toISOString().slice(0, 19).replace('T', ' ');
  
  const scheduledDaysString = taskData.scheduledDays ? JSON.stringify(taskData.scheduledDays) : null;
  
  await query(
    `INSERT INTO tasks 
    (id, userId, title, category, completed, durationMinutes, createdAt, updatedAt, 
     isRecurring, scheduledTime, scheduledDays, lastCompleted) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      userId,
      taskData.title,
      taskData.category || null,
      false, // completed
      taskData.durationMinutes || 25,
      isoDate,
      isoDate,
      taskData.isRecurring || false,
      taskData.scheduledTime || null,
      scheduledDaysString,
      null // lastCompleted
    ]
  );
  
  return {
    id,
    userId,
    title: taskData.title,
    category: taskData.category || null,
    completed: false,
    durationMinutes: taskData.durationMinutes || 25,
    createdAt: now,
    updatedAt: now,
    isRecurring: taskData.isRecurring || false,
    scheduledTime: taskData.scheduledTime || null,
    scheduledDays: taskData.scheduledDays || null,
    lastCompleted: null
  };
}

/**
 * Actualiza una tarea existente
 */
export async function updateTask(
  id: string,
  data: TaskUpdateInput
): Promise<boolean> {
  // Construir la consulta SQL de forma dinámica basada en los campos proporcionados
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.title !== undefined) {
    updates.push("title = ?");
    values.push(data.title);
  }
  
  if (data.category !== undefined) {
    updates.push("category = ?");
    values.push(data.category);
  }
  
  if (data.completed !== undefined) {
    updates.push("completed = ?");
    values.push(data.completed ? 1 : 0); // Convert to 0/1 for MySQL
    
    if (data.completed) {
      // If marking as completed, update lastCompleted date
      updates.push("lastCompleted = ?");
      values.push(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD format
    }
  }
  
  if (data.durationMinutes !== undefined) {
    updates.push("durationMinutes = ?");
    values.push(data.durationMinutes);
  }
  
  if (data.isRecurring !== undefined) {
    updates.push("isRecurring = ?");
    values.push(data.isRecurring ? 1 : 0);
  }
  
  if (data.scheduledTime !== undefined) {
    updates.push("scheduledTime = ?");
    values.push(data.scheduledTime);
  }
  
  if (data.scheduledDays !== undefined) {
    updates.push("scheduledDays = ?");
    values.push(data.scheduledDays ? JSON.stringify(data.scheduledDays) : null);
  }
  
  if (data.lastCompleted !== undefined) {
    updates.push("lastCompleted = ?");
    values.push(data.lastCompleted ? data.lastCompleted.toISOString().slice(0, 10) : null);
  }
  
  // Siempre actualizar updatedAt
  const now = new Date();
  const isoDate = now.toISOString().slice(0, 19).replace('T', ' ');
  updates.push("updatedAt = ?");
  values.push(isoDate);
  
  // Si no hay nada para actualizar, retornar temprano
  if (updates.length === 1) {
    return false;
  }
  
  // Añadir ID a los valores
  values.push(id);
  
  const result = await query(
    `UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`,
    values
  );
  
  return (result as any).affectedRows > 0;
}

/**
 * Elimina una tarea
 */
export async function deleteTask(id: string): Promise<boolean> {
  const result = await query("DELETE FROM tasks WHERE id = ?", [id]);
  return (result as any).affectedRows > 0;
}

/**
 * Marca una tarea como completada
 */
export async function completeTask(id: string): Promise<boolean> {
  return updateTask(id, {
    completed: true,
    lastCompleted: new Date()
  });
}

/**
 * Resetea las tareas recurrentes que deben ser restablecidas diariamente
 * Esta función sería llamada por un cron job diario
 */
export async function resetRecurringTasks(): Promise<number> {
  const result = await query(`
    UPDATE tasks 
    SET completed = 0 
    WHERE isRecurring = 1 
    AND (lastCompleted IS NULL OR DATE(lastCompleted) < CURDATE())
  `);
  
  return (result as any).affectedRows;
}

/**
 * Obtener tareas programadas para hoy y una hora específica
 */
export async function getScheduledTasksForNow(): Promise<Task[]> {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS
  
  const tasks = await query(`
    SELECT * FROM tasks 
    WHERE isRecurring = 1 
    AND scheduledTime = ? 
    AND JSON_CONTAINS(scheduledDays, ?)
  `, [currentTime, `"${currentDay}"`]) as any[];
  
  return tasks.map(task => ({
    ...task,
    completed: !!task.completed,
    isRecurring: !!task.isRecurring,
    scheduledDays: JSON.parse(task.scheduledDays),
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
    lastCompleted: task.lastCompleted ? new Date(task.lastCompleted) : null
  }));
}


/**
 * Obtener tareas para notificación basadas en el día y hora actuales
 */
export async function getTasksForNotification(currentDay: string, currentTime: string): Promise<Task[]> {
  try {
    const timeWithoutSeconds = currentTime.substring(0, 5); // "HH:MM" format
    const [hour, minute] = timeWithoutSeconds.split(':');
    const minuteNum = parseInt(minute, 10);
    
    // Redondear hacia abajo a múltiplos de 5 minutos
    const startMinute = Math.floor(minuteNum / 5) * 5;
    const endMinute = startMinute + 4;
    
    const startTime = `${hour}:${startMinute.toString().padStart(2, '0')}:00`;
    const endTime = `${hour}:${endMinute.toString().padStart(2, '0')}:59`;

    const tasks = await query(`
      SELECT t.*, u.id as userId 
      FROM tasks t
      JOIN users u ON t.userId = u.id
      WHERE t.isRecurring = 1
      AND t.scheduledTime BETWEEN ? AND ?
      AND JSON_CONTAINS(t.scheduledDays, ?)
    `, [startTime, endTime, `"${currentDay}"`]) as any[];

    return tasks.map(task => ({
      ...task,
      completed: !!task.completed,
      isRecurring: !!task.isRecurring,
      scheduledDays: task.scheduledDays ? JSON.parse(task.scheduledDays) : null,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      lastCompleted: task.lastCompleted ? new Date(task.lastCompleted) : null
    }));
  } catch (error) {
    console.error("Error al obtener tareas para notificación:", error);
    throw error;
  }
}