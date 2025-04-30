"use server";

import { initDatabase } from "@/lib/db";
import { countUsers, createUser, migrateTimezoneField } from "@/lib/models/user";
import { createTask } from "@/lib/models/task";
import { TaskInput } from "@/types";

export async function seedDatabase() {
  try {
    // Inicializar la base de datos
    await initDatabase();
    
    // Asegurarse de que exista la columna timezone
    await migrateTimezoneField();
    
    const userCount = await countUsers();

    if (userCount === 0) {
      // Crear usuarios de prueba con diferentes zonas horarias
      const users = [
        await createUser("cdmx@example.com", "password123", "Usuario CDMX", "America/Mexico_City"),
        await createUser("nyc@example.com", "password123", "Usuario NYC", "America/New_York"),
        await createUser("la@example.com", "password123", "Usuario LA", "America/Los_Angeles")
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
        }
      ];

      // Crear tareas para cada usuario
      for (const user of users) {
        // Tareas regulares no recurrentes
        for (const taskTemplate of sampleTaskTemplates) {
          await createTask(user.id, { ...taskTemplate });
        }
        
        // TAREAS DE PRUEBA: Crear una tarea para cada hora del día
        // Esto permitirá probar el sistema de notificaciones completamente
        const allDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        
        // Crear tareas para cada hora del día (24 tareas)
        for (let hour = 0; hour < 24; hour++) {
          const formattedHour = hour.toString().padStart(2, '0');
          const timeStr = `${formattedHour}:00:00`;
          
          await createTask(user.id, {
            title: `Tarea ${user.name} - ${formattedHour}:00h`,
            category: "Timezone Test",
            durationMinutes: 15,
            isRecurring: true,
            scheduledTime: timeStr,
            // Incluir el día actual y mañana para asegurar que algunas tareas se activen
            scheduledDays: allDays
          });
          
          // También crear algunas tareas a horas y minutos específicos para pruebas más precisas
          if (hour % 3 === 0) {
            // Cada 3 horas, crear tareas adicionales a los 15, 30 y 45 minutos
            for (const minute of [15, 30, 45]) {
              const timeWithMinute = `${formattedHour}:${minute.toString().padStart(2, '0')}:00`;
              
              await createTask(user.id, {
                title: `Tarea ${user.name} - ${formattedHour}:${minute}h`,
                category: "Timezone Test - Minutos",
                durationMinutes: 15,
                isRecurring: true,
                scheduledTime: timeWithMinute,
                scheduledDays: allDays
              });
            }
          }
        }
        
        // Crear una tarea especial para la hora actual (debería activarse inmediatamente)
        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, '0');
        const currentMinute = Math.floor(now.getMinutes() / 5) * 5; // Redondear a múltiplos de 5
        const currentTimeStr = `${currentHour}:${currentMinute.toString().padStart(2, '0')}:00`;
        
        await createTask(user.id, {
          title: `🔔 TAREA ACTUAL ${user.name} - ${currentHour}:${currentMinute}h`,
          category: "PRUEBA INMEDIATA",
          durationMinutes: 5,
          isRecurring: true,
          scheduledTime: currentTimeStr,
          scheduledDays: allDays
        });
        
        console.log(`Creadas tareas de prueba para ${user.name} (${user.timezone})`);
      }
      
      return { 
        success: true, 
        message: "Base de datos inicializada con datos de prueba para todas las horas del día",
        users: users.length
      };
    }

    return { success: true, message: "La base de datos ya tiene datos" };
  } catch (error) {
    console.error("Error al seedear la base de datos:", error);
    return { success: false, message: `Error al seedear la base de datos: ${error}` };
  }
}

// Función adicional para crear tareas de prueba para un usuario existente
export async function seedTestTasksForUser(userId: string) {
  try {
    // Crear tareas para cada hora del día para este usuario
    const allDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    
    for (let hour = 0; hour < 24; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      const timeStr = `${formattedHour}:00:00`;
      
      await createTask(userId, {
        title: `Prueba Hora ${formattedHour}:00`,
        category: "Test Notificaciones",
        durationMinutes: 15,
        isRecurring: true,
        scheduledTime: timeStr,
        scheduledDays: allDays
      });
    }
    
    // Crear tarea para la hora actual (debería notificarse pronto)
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = Math.floor(now.getMinutes() / 5) * 5; // Redondear a múltiplos de 5
    const nextFiveMinutes = (Math.floor(now.getMinutes() / 5) * 5 + 5) % 60;
    
    // Tarea para la hora actual
    await createTask(userId, {
      title: `🔔 AHORA - ${currentHour}:${currentMinute}`,
      category: "PRUEBA INMEDIATA",
      durationMinutes: 5,
      isRecurring: true,
      scheduledTime: `${currentHour}:${currentMinute.toString().padStart(2, '0')}:00`,
      scheduledDays: allDays
    });
    
    // Tarea para los próximos 5 minutos
    await createTask(userId, {
      title: `⏰ PRÓXIMO - ${currentHour}:${nextFiveMinutes}`,
      category: "PRUEBA INMEDIATA",
      durationMinutes: 5,
      isRecurring: true,
      scheduledTime: `${currentHour}:${nextFiveMinutes.toString().padStart(2, '0')}:00`,
      scheduledDays: allDays
    });
    
    return { 
      success: true,
      message: "Tareas de prueba creadas para todas las horas del día"
    };
  } catch (error) {
    console.error("Error al crear tareas de prueba:", error);
    return { 
      success: false,
      message: `Error al crear tareas de prueba: ${error}`
    };
  }
}