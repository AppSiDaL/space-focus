"use server";

import {  getTasksToNotify } from '../models/task';
import { sendTaskNotification } from './subscriptions';
import { createTask, getTasksByUserId, updateTask, deleteTask } from "@/lib/models/task";
import { revalidatePath } from "next/cache";
import { TaskInput, TaskUpdateInput } from "@/types";
import { getSession } from "@/lib/auth/session";
import { getTaskByIdAndUserId, markTaskAsCompleted } from '../models/task';

// Get all tasks for the authenticated user
export async function getTasksAction() {
  try {
    const user = await getSession();
    
    if (!user) {
      return { 
        success: false, 
        error: "authentication_required"
      };
    }
    
    const tasks = await getTasksByUserId(user.id);
    return { 
      success: true, 
      tasks 
    };
  } catch (error) {
    console.error("Failed to get tasks:", error);
    return { 
      success: false, 
      error: "server_error"
    };
  }
}

// Create a new task for the authenticated user
export async function createTaskAction(taskData: TaskInput) {
  try {
    const user = await getSession();
    
    if (!user) {
      return { 
        success: false, 
        error: "authentication_required"
      };
    }
    
    const task = await createTask(user.id, taskData);
    
    // Revalidate the tasks list path
    revalidatePath('/');
    revalidatePath('/tasks');
    
    return {
      success: true,
      task
    };
  } catch (error) {
    console.error("Failed to create task:", error);
    return { 
      success: false, 
      error: "server_error"
    };
  }
}

// Update a task
export async function updateTaskAction(id: string, data: TaskUpdateInput) {
  try {
    const user = await getSession();
    
    if (!user) {
      return { 
        success: false, 
        error: "authentication_required"
      };
    }
    
    const updated = await updateTask(id, data);
    
    // Revalidate paths
    revalidatePath('/');
    revalidatePath('/tasks');
    
    return {
      success: true,
      updated
    };
  } catch (error) {
    console.error("Failed to update task:", error);
    return { 
      success: false, 
      error: "server_error"
    };
  }
}

// Delete a task
export async function deleteTaskAction(id: string) {
  try {
    const user = await getSession();
    
    if (!user) {
      return { 
        success: false, 
        error: "authentication_required"
      };
    }
    
    const deleted = await deleteTask(id);
    
    revalidatePath('/');
    
    return {
      success: true,
      deleted
    };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return { 
      success: false, 
      error: "server_error"
    };
  }
}

export async function checkScheduledTasks() {
  try {
    const now = new Date();
    
    // Usar la nueva función específica para notificaciones
    const tasks = await getTasksToNotify();
    
    console.log(`Found ${tasks.length} tasks to notify based on user time zones`);
    
    let notifiedCount = 0;
    let failedCount = 0;

    for (const task of tasks) {
      // Personalizar mensaje según la tarea y añadir emojis según prioridad/categoría
      const emoji = getTaskEmoji(task.category || 'default');

      const message = `${emoji} ¡Es hora de tu tarea: ${task.title}! ${getRandomMotivation()}`;
      
      // Enviar notificación con mejor formato
      const notification = await sendTaskNotification(
        task.id, 
        task.userId,
        message
      );
      
      if (notification.success) {
        notifiedCount++;
      } else {
        failedCount++;
      }
    }
    
    return { 
      processed: tasks.length,
      notified: notifiedCount,
      failed: failedCount,
      timestamp: now.toISOString()
    };
  } catch (error) {
    console.error("Error al verificar tareas programadas:", error);
    throw error;
  }
}

// Funciones de apoyo para mejorar las notificaciones
function getTaskEmoji(category: string): string {
  // Devolver emoji según categoría
  const emojiMap: Record<string, string> = {
    work: "💼",
    study: "📚",
    fitness: "💪",
    family: "👨‍👩‍👧",
    default: "✅"
  };
  return emojiMap[category] || emojiMap.default;
}

function getRandomMotivation(): string {
  const phrases = [
    "¡Tú puedes lograrlo!",
    "¡A por ello!",
    "Un paso más hacia tus metas",
    "Enfócate y triunfa",
    "El momento es ahora"
  ];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

/**
 * Marcar una tarea como completada (Server Action)
 */
export async function completeTask(taskId: string) {
  try {
    const user = await getSession();
    if (!user?.id) {
      return { success: false, error: "No autorizado" };
    }
    
    // Verificar que la tarea pertenece al usuario
    const task = await getTaskByIdAndUserId(taskId, user.id);
    
    if (!task) {
      return { success: false, error: "Tarea no encontrada" };
    }
    
    // Actualizar la tarea a completada
    const updated = await markTaskAsCompleted(taskId);
    
    if (!updated) {
      return { success: false, error: "Error al actualizar la tarea" };
    }
    
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Error al completar la tarea:", error);
    return { success: false, error: "Error al completar la tarea" };
  }
}

