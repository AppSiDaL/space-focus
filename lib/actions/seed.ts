"use server";

import { initDatabase } from "@/lib/db";
import { countUsers, createUser } from "@/lib/models/user";
import { createTask } from "@/lib/models/task";
import { TaskInput } from "@/types";

export async function seedDatabase() {
  try {
    await initDatabase();
    
    const userCount = await countUsers();

    if (userCount === 0) {
      // Create test user
      const user = await createUser("test@example.com", "password123", "test");
      
      // Create some sample tasks for the test user
      const sampleTasks: TaskInput[] = [
        {
          title: "Completar documentación del proyecto",
          category: "Reading",
          durationMinutes: 25,
        },
        {
          title: "Implementar nueva funcionalidad",
          category: "Coding",
          durationMinutes: 25,
        },
        {
          title: "Revisar código existente",
          category: "Exercise",
          durationMinutes: 25,
        },
        {
          title: "Ejercicio matutino",
          category: "Exercise",
          durationMinutes: 30,
          isRecurring: true,
          scheduledTime: "08:00:00",
          scheduledDays: ["monday", "wednesday", "friday"]
        },
        {
          title: "Meditación diaria",
          category: "Meditation",
          durationMinutes: 15,
          isRecurring: true,
          scheduledTime: "20:00:00",
          scheduledDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        }
      ];

      // Use the task model to create tasks
      for (const taskData of sampleTasks) {
        await createTask(user.id, taskData);
      }
      
      return { success: true, message: "Base de datos inicializada con datos de prueba" };
    }

    return { success: true, message: "La base de datos ya tiene datos" };
  } catch (error) {
    console.error("Error al seedear la base de datos:", error);
    return { success: false, message: "Error al seedear la base de datos" };
  }
}