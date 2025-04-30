// Notification Manager - Maneja la programación y envío de notificaciones

// Verificar si las notificaciones están disponibles en el navegador
export const areNotificationsSupported = () => {
  return "Notification" in window;
};

// Verificar si el Service Worker está disponible
export const isServiceWorkerSupported = () => {
  return "serviceWorker" in navigator;
};

// Solicitar permiso para mostrar notificaciones
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!areNotificationsSupported()) {
    console.warn("Notifications are not supported in this browser");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

// Verificar si tenemos permiso para mostrar notificaciones
export const hasNotificationPermission = (): boolean => {
  if (!areNotificationsSupported()) return false;
  return Notification.permission === "granted";
};

// Almacén para los IDs de los temporizadores de notificación
const notificationTimers: Record<string, NodeJS.Timeout> = {};

// Function to schedule a notification
export const scheduleNotification = (
  taskId: string,
  title: string,
  time: string,
  days: number[],
  category = "Task"
): string => {
  // Generate a unique ID for this notification
  const notificationId = `notification_${taskId}_${Date.now()}`;

  // Cancel any timer existing for this task
  if (notificationTimers[taskId]) {
    clearTimeout(notificationTimers[taskId]);
    delete notificationTimers[taskId];
  }

  // Programar la notificación
  const checkAndSchedule = () => {
    try {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, etc.

      // Verificar si hoy es uno de los días programados
      if (days.includes(currentDay)) {
        const [hours, minutes] = time.split(":").map(Number);

        // Crear una fecha para la hora programada de hoy
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);

        // Calcular el tiempo hasta la notificación
        const timeUntilNotification = scheduledTime.getTime() - now.getTime();

        // Si la hora ya pasó hoy, no hacer nada (esperaremos hasta mañana)
        if (timeUntilNotification < 0) {
          // Programar para el próximo día
          const nextCheckTime =
            24 * 60 * 60 * 1000 -
            (now.getHours() * 60 * 60 * 1000 +
              now.getMinutes() * 60 * 1000 +
              now.getSeconds() * 1000) +
            1000;
          notificationTimers[taskId] = setTimeout(
            checkAndSchedule,
            nextCheckTime
          );
          return;
        }

        // Programar la notificación
        notificationTimers[taskId] = setTimeout(() => {
          try {
            // Create notification options without actions
            const options: NotificationOptions = {
              body: `Time to work on your ${category} activity!`,
              icon: "/icons/android-chrome-192x192.png",
              badge: "/icons/badge-icon.png",
              tag: taskId,
              data: {
                taskId,
                scheduledTime: time,
                timestamp: Date.now(),
              },
            };

            // Send the notification
            sendNotification(title, options);

            // Programar para el próximo día
            setTimeout(checkAndSchedule, 1000);
          } catch (error) {
            console.error("Error sending notification:", error);
            // Retry tomorrow
            const nextCheckTime = 24 * 60 * 60 * 1000;
            notificationTimers[taskId] = setTimeout(
              checkAndSchedule,
              nextCheckTime
            );
          }
        }, timeUntilNotification);
      } else {
        // No es uno de los días programados, verificar mañana
        const nextCheckTime =
          24 * 60 * 60 * 1000 -
          (now.getHours() * 60 * 60 * 1000 +
            now.getMinutes() * 60 * 1000 +
            now.getSeconds() * 1000) +
          1000;
        notificationTimers[taskId] = setTimeout(
          checkAndSchedule,
          nextCheckTime
        );
      }
    } catch (error) {
      console.error("Error in notification scheduling:", error);
      // Prevent infinite loops by not rescheduling on error
    }
  };

  // Iniciar la programación
  checkAndSchedule();

  return notificationId;
};

// Función para cancelar una notificación programada
export const cancelNotification = (notificationId: string): boolean => {
  const taskId = notificationId.split("_")[1];

  if (notificationTimers[taskId]) {
    clearTimeout(notificationTimers[taskId]);
    delete notificationTimers[taskId];
    return true;
  }

  return false;
};

// Función para enviar una notificación
export const sendNotification = (
  title: string,
  options: NotificationOptions = {}
): boolean => {
  if (!hasNotificationPermission()) {
    console.warn("Notification permission not granted");
    return false;
  }

  try {
    // Create a basic notification without actions
    const notification = new Notification(title, {
      ...options,
      // Ensure the object only includes valid NotificationOptions properties
    });

    // Manejar clics en la notificación
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();

      // Si hay datos de tarea, abrir la aplicación en la página principal
      if (options.data && options.data.taskId) {
        // Aquí podríamos navegar a una página específica o mostrar el temporizador
        window.location.href = `/?task=${options.data.taskId}`;
      }
    };

    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
};

// Función para inicializar el sistema de notificaciones
export const initNotifications = async (): Promise<boolean> => {
  if (!areNotificationsSupported()) {
    console.warn("Notifications are not supported in this browser");
    return false;
  }

  // Si ya tenemos permiso, no necesitamos solicitarlo de nuevo
  if (hasNotificationPermission()) {
    return true;
  }

  // Solicitar permiso
  return await requestNotificationPermission();
};

