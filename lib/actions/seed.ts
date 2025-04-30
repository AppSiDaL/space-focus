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
      // Crear usuarios de prueba con diferentes zonas horarias
      const users = [
        await createUser("test@example.com", "password123", "Usuario Prueba", "America/Mexico_City"),
        await createUser("user1@example.com", "password123", "Usuario NYC", "America/New_York"),
        await createUser("user2@example.com", "password123", "Usuario LA", "America/Los_Angeles")
      ];
      
      // Create some sample tasks for each user
      const sampleTaskTemplates: Omit<TaskInput, "scheduledTime">[] = [
        {
          title: "Completar documentación del proyecto",
          category: "Work",
          durationMinutes: 25,
        },
        {
          title: "Implementar nueva funcionalidad",
          category: "Coding",
          durationMinutes: 25,
        },
        {
          title: "Revisar código existente",
          category: "Coding",
          durationMinutes: 25,
        },
        {
          title: "Ejercicio matutino",
          category: "Exercise",
          durationMinutes: 30,
          isRecurring: true,
          // scheduledTime se ajustará según la zona horaria
          scheduledDays: ["monday", "wednesday", "friday"]
        },
        {
          title: "Meditación diaria",
          category: "Meditation",
          durationMinutes: 15,
          isRecurring: true,
          // scheduledTime se ajustará según la zona horaria
          scheduledDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        }
      ];

      // Crear tareas para cada usuario con horarios adaptados a su zona horaria
      for (const user of users) {
        // Adaptar horarios según zona horaria del usuario
        let morningHour = "08:00:00";
        let eveningHour = "20:00:00";
        
        // Pequeño ajuste para simular diferentes horarios según zona horaria
        if (user.timezone === "America/New_York") {
          morningHour = "07:30:00";
          eveningHour = "21:00:00";
        } else if (user.timezone === "America/Los_Angeles") {
          morningHour = "06:45:00";
          eveningHour = "19:30:00";
        }
        
        // Crear tareas específicas para este usuario
        for (const taskTemplate of sampleTaskTemplates) {
          // Crear copia para no modificar el template original
          const taskData: TaskInput = { ...taskTemplate };
          
          // Asignar hora según el tipo de tarea
          if (taskData.title.includes("Ejercicio")) {
            taskData.scheduledTime = morningHour;
          } else if (taskData.title.includes("Meditación")) {
            taskData.scheduledTime = eveningHour;
          }
          
          // Crear la tarea para este usuario
          await createTask(user.id, taskData);
        }
        
        // Añadir una tarea específica para cada usuario según su zona horaria
        await createTask(user.id, {
          title: `Tarea específica para zona ${user.timezone}`,
          category: "Timezone Test",
          durationMinutes: 15,
          isRecurring: true,
          scheduledTime: "12:00:00", // Mediodía en su zona horaria
          scheduledDays: ["monday", "wednesday", "friday"]
        });
      }
      
      return { 
        success: true, 
        message: "Base de datos inicializada con datos de prueba y usuarios con diferentes zonas horarias",
        users: users.length
      };
    }

    return { success: true, message: "La base de datos ya tiene datos" };
  } catch (error) {
    console.error("Error al seedear la base de datos:", error);
    return { success: false, message: `Error al seedear la base de datos: ${error}` };
  }
}