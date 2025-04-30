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
    const now = new Date(); // Hora UTC en el servidor
    
    // Calcular tiempo 15 minutos atrás en UTC
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    
    // Formatear horas para la ventana de tiempo
    const currentTime = now.toISOString().substring(11, 19); // "HH:MM:SS" en UTC
    const previousTime = fifteenMinutesAgo.toISOString().substring(11, 19);
    
    console.log(`Checking tasks between UTC ${previousTime} and ${currentTime}`);
    
    // Obtener tareas que deberían ejecutarse en esta ventana de tiempo
    const tasks = await getTasksForTimeWindow(previousTime, currentTime);
    
    console.log(`Found ${tasks.length} tasks to notify`);
    
    let notifiedCount = 0;
    let failedCount = 0;

    for (const task of tasks) {
      // Personalizar mensaje según la hora programada vs hora actual
      let message = `Es hora de tu tarea: ${task.title}`;
      
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