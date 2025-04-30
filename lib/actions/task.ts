"use server";

import { getTasksForNotification } from '../models/task';
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
    // Obtener la fecha y hora actuales
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().substring(0, 8); // "HH:MM:SS" format
    
    // Obtener tareas que deberían notificarse ahora (con 5 minutos de margen)
    const tasks = await getTasksForNotification(currentDay, currentTime);
    
    let notifiedCount = 0;
    let failedCount = 0;

    // Enviar notificación para cada tarea
    for (const task of tasks) {
      const notification = await sendAlarmNotification(
        task.id, 
        task.userId,
        `Es hora de tu tarea: ${task.title}`
      );
      
      if (notification.success) {
        notifiedCount++;
      } else {
        failedCount++;
      }
    }

    console.log(`Tareas procesadas: ${tasks.length}, Notificadas: ${notifiedCount}, Fallidas: ${failedCount}`);
    
    return { 
      processed: tasks.length,
      notified: notifiedCount,
      failed: failedCount
    };
  } catch (error) {
    console.error("Error al verificar tareas programadas:", error);
    throw error;
  }
}