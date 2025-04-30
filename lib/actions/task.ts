"use server";

import { getTasksForTimeWindow } from '../models/task';
import { sendAlarmNotification } from './subscriptions';
import { createTask, getTasksByUserId, updateTask, deleteTask } from "@/lib/models/task";
import { revalidatePath } from "next/cache";
import { TaskInput, TaskUpdateInput } from "@/types";
import { getAuthenticatedUser } from "./auth";

// Get all tasks for the authenticated user
export async function getTasksAction() {
  try {
    const user = await getAuthenticatedUser();
    
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
    const user = await getAuthenticatedUser();
    
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
    const user = await getAuthenticatedUser();
    
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
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return { 
        success: false, 
        error: "authentication_required"
      };
    }
    
    const deleted = await deleteTask(id);
    
    // Revalidate paths
    revalidatePath('/');
    revalidatePath('/tasks');
    
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
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Obtener la hora actual en formato HH:MM:SS
    const currentTime = now.toTimeString().substring(0, 8);
    
    // Calcular tiempo 15 minutos atrás
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    const previousTime = fifteenMinutesAgo.toTimeString().substring(0, 8);
    
    // Obtener tareas programadas entre hace 15 minutos y ahora
    const tasks = await getTasksForTimeWindow(currentDay, previousTime, currentTime);
    
    console.log(`Verificando ${tasks.length} tareas programadas entre ${previousTime} y ${currentTime}`);
    
    let notifiedCount = 0;
    let failedCount = 0;

    for (const task of tasks) {
      // Determinar si la tarea está programada para ahora o es de una ventana anterior
      const scheduledTime = task.scheduledTime || "00:00:00";
      const isDelayed = scheduledTime < currentTime;
      
      // Personalizar mensaje según si la notificación está retrasada o no
      let message = `Es hora de tu tarea: ${task.title}`;
      
      if (isDelayed) {
        // Calcular minutos de retraso (simplificado)
        const taskHours = parseInt(scheduledTime.split(':')[0], 10);
        const taskMinutes = parseInt(scheduledTime.split(':')[1], 10);
        const nowHours = now.getHours();
        const nowMinutes = now.getMinutes();
        
        let minutesAgo = (nowHours - taskHours) * 60 + (nowMinutes - taskMinutes);
        if (minutesAgo < 0) minutesAgo = 1; // Caso edge por cambio de hora
        
        message = `Hace ${minutesAgo} minutos era hora de tu tarea: ${task.title}`;
      }
      
      // Enviar notificación
      const notification = await sendAlarmNotification(
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
      timeWindow: `${previousTime} - ${currentTime}`
    };
  } catch (error) {
    console.error("Error al verificar tareas programadas:", error);
    throw error;
  }
}