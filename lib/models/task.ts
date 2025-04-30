import { query } from "@/lib/db";
import { Task, TaskInput, TaskUpdateInput } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Tipos específicos para los resultados de la base de datos
type MySQLResultRow = Record<string, string | number | null | Buffer>;
type MySQLQueryResult = {
  affectedRows: number;
  insertId: number;
  warningStatus: number;
};

/**
 * Obtiene todas las tareas de un usuario
 */
export async function getTasksByUserId(userId: string): Promise<Task[]> {
  const tasks = await query(
    "SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt DESC",
    [userId]
  ) as MySQLResultRow[];
  
  return tasks.map(task => ({
    id: task.id as string,
    userId: task.userId as string,
    title: task.title as string,
    category: task.category as string | null,
    completed: !!task.completed, // Ensure boolean type
    durationMinutes: task.durationMinutes as number,
    isRecurring: !!task.isRecurring, // Ensure boolean type
    scheduledTime: task.scheduledTime as string | null,
    scheduledDays: task.scheduledDays ? JSON.parse(task.scheduledDays as string) : null,
    createdAt: new Date(task.createdAt as string),
    updatedAt: new Date(task.updatedAt as string),
    lastCompleted: task.lastCompleted ? new Date(task.lastCompleted as string) : null,
    lastNotified: task.lastNotified ? new Date(task.lastNotified as string) : null
  }));
}

/**
 * Obtiene una tarea específica por su ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
  const tasks = await query("SELECT * FROM tasks WHERE id = ?", [id]) as MySQLResultRow[];
  
  if (tasks.length === 0) return null;
  
  return {
    id: tasks[0].id as string,
    userId: tasks[0].userId as string,
    title: tasks[0].title as string,
    category: tasks[0].category as string | null,
    completed: !!tasks[0].completed, // Ensure boolean type
    durationMinutes: tasks[0].durationMinutes as number,
    isRecurring: !!tasks[0].isRecurring, // Ensure boolean type
    scheduledTime: tasks[0].scheduledTime as string | null,
    scheduledDays: tasks[0].scheduledDays ? JSON.parse(tasks[0].scheduledDays as string) : null,
    createdAt: new Date(tasks[0].createdAt as string),
    updatedAt: new Date(tasks[0].updatedAt as string),
    lastCompleted: tasks[0].lastCompleted ? new Date(tasks[0].lastCompleted as string) : null,
    lastNotified: tasks[0].lastNotified ? new Date(tasks[0].lastNotified as string) : null
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
     isRecurring, scheduledTime, scheduledDays, lastCompleted, lastNotified) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      null, // lastCompleted
      null  // lastNotified
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
    lastCompleted: null,
    lastNotified: null
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
  const values: (string | number | boolean | null)[] = [];
  
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
  
  if (data.lastNotified !== undefined) {
    updates.push("lastNotified = ?");
    values.push(data.lastNotified ? data.lastNotified.toISOString().slice(0, 19).replace('T', ' ') : null);
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
  
  return (result as MySQLQueryResult).affectedRows > 0;
}

/**
 * Elimina una tarea
 */
export async function deleteTask(id: string): Promise<boolean> {
  const result = await query("DELETE FROM tasks WHERE id = ?", [id]);
  return (result as MySQLQueryResult).affectedRows > 0;
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
  
  return (result as MySQLQueryResult).affectedRows;
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
  `, [currentTime, `"${currentDay}"`]) as MySQLResultRow[];
  
  return tasks.map(task => ({
    id: task.id as string,
    userId: task.userId as string,
    title: task.title as string,
    category: task.category as string | null,
    completed: !!task.completed,
    durationMinutes: task.durationMinutes as number,
    isRecurring: !!task.isRecurring,
    scheduledTime: task.scheduledTime as string | null,
    scheduledDays: task.scheduledDays ? JSON.parse(task.scheduledDays as string) : null,
    createdAt: new Date(task.createdAt as string),
    updatedAt: new Date(task.updatedAt as string),
    lastCompleted: task.lastCompleted ? new Date(task.lastCompleted as string) : null,
    lastNotified: task.lastNotified ? new Date(task.lastNotified as string) : null
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
    `, [startTime, endTime, `"${currentDay}"`]) as MySQLResultRow[];

    return tasks.map(task => ({
      id: task.id as string,
      userId: task.userId as string,
      title: task.title as string,
      category: task.category as string | null,
      completed: !!task.completed,
      durationMinutes: task.durationMinutes as number,
      isRecurring: !!task.isRecurring,
      scheduledTime: task.scheduledTime as string | null,
      scheduledDays: task.scheduledDays ? JSON.parse(task.scheduledDays as string) : null,
      createdAt: new Date(task.createdAt as string),
      updatedAt: new Date(task.updatedAt as string),
      lastCompleted: task.lastCompleted ? new Date(task.lastCompleted as string) : null,
      lastNotified: task.lastNotified ? new Date(task.lastNotified as string) : null
    }));
  } catch (error) {
    console.error("Error al obtener tareas para notificación:", error);
    throw error;
  }
}

/**
 * Obtener tareas para notificación basadas en una ventana de tiempo
 * teniendo en cuenta las zonas horarias de los usuarios
 */
export async function getTasksForTimeWindow(
  startTime: string,  // UTC time "HH:MM:SS"
  endTime: string     // UTC time "HH:MM:SS"
): Promise<Task[]> {
  try {
    // Consulta teniendo en cuenta las zonas horarias
    const tasks = await query(`
      SELECT t.*, u.id as userId, u.timezone 
      FROM tasks t
      JOIN users u ON t.userId = u.id
      WHERE t.isRecurring = 1
      AND (t.lastNotified IS NULL OR DATE(t.lastNotified) < CURDATE())
    `) as (MySQLResultRow & { timezone: string })[];
    
    // Filtrar las tareas que deberían ejecutarse en este período
    // según la zona horaria de cada usuario
    const now = new Date();
    const matchingTasks = tasks.filter(task => {
      // Verificamos si el día actual en la zona horaria del usuario coincide con los días programados
      const userTz = task.timezone || 'America/Mexico_City'; // Zona por defecto
      const userLocalTime = new Date(now.toLocaleString('en-US', { timeZone: userTz }));
      const userDay = userLocalTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      // Verificar si la tarea está programada para este día
      const scheduledDays = task.scheduledDays ? JSON.parse(task.scheduledDays as string) : [];
      if (!scheduledDays.includes(userDay)) return false;
      
      // Verificar si la hora programada cae en la ventana actual
      if (!task.scheduledTime) return false;
      
      // Convertir la hora programada a tiempo UTC
      const [taskHour, taskMinute] = (task.scheduledTime as string).split(':');
      const taskTimeInUserTz = new Date(userLocalTime);
      taskTimeInUserTz.setHours(parseInt(taskHour, 10), parseInt(taskMinute, 10), 0, 0);
      
      // Convertir a UTC para comparar con nuestra ventana
      const taskTimeUTC = new Date(taskTimeInUserTz.toLocaleString('en-US', { timeZone: 'UTC' }));
      const taskTimeStr = taskTimeUTC.toTimeString().substring(0, 8); // "HH:MM:SS"
      
      // Verificar si cae en nuestra ventana de tiempo
      return taskTimeStr >= startTime && taskTimeStr <= endTime;
    });
    
    // Marcar estas tareas como notificadas
    if (matchingTasks.length > 0) {
      const nowStr = now.toISOString().slice(0, 19).replace('T', ' ');
      
      for (const task of matchingTasks) {
        // Convertir el ID a string si es un Buffer
        const taskId = Buffer.isBuffer(task.id) ? task.id.toString() : task.id as string;
        
        await query(
          `UPDATE tasks SET lastNotified = ? WHERE id = ?`,
          [nowStr, taskId]
        );
      }
    }

    // Devolver las tareas en formato Task[]
    return matchingTasks.map(task => ({
      id: Buffer.isBuffer(task.id) ? task.id.toString() : task.id as string,
      userId: Buffer.isBuffer(task.userId) ? task.userId.toString() : task.userId as string,
      title: task.title as string,
      category: task.category as string | null,
      completed: !!task.completed,
      durationMinutes: task.durationMinutes as number,
      isRecurring: !!task.isRecurring,
      scheduledTime: task.scheduledTime as string | null,
      scheduledDays: task.scheduledDays ? JSON.parse(task.scheduledDays as string) : null,
      createdAt: new Date(task.createdAt as string),
      updatedAt: new Date(task.updatedAt as string),
      lastCompleted: task.lastCompleted ? new Date(task.lastCompleted as string) : null,
      lastNotified: task.lastNotified ? new Date(task.lastNotified as string) : null
    }));
  } catch (error) {
    console.error("Error al obtener tareas para ventana de tiempo:", error);
    throw error;
  }
}