"use server"

import webpush from "web-push"
import { getSession } from "@/lib/auth/session";
import { createSubscription, deleteSubscription, getSubscriptionDataByUserId, getSubscriptionsByUserId,updateSubscription } from "../models/subscription"

// Configurar VAPID para notificaciones push
webpush.setVapidDetails(
  "mailto:example@example.com", // Cambiar por tu email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)


// Guardar la suscripción del usuario
export async function subscribeUserPush(subscription: PushSubscription) {
  try {
    const user = await getSession()

    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    // Verificar si ya existe una suscripción para este usuario
    const existingSubscriptions = await getSubscriptionsByUserId(user.id)

    if (existingSubscriptions.length > 0) {
      // Actualizar la suscripción existente
        await updateSubscription(user.id, subscription)
  
    } else {
      await createSubscription(user.id, subscription)
    }

    return { success: true }
  } catch (error) {
    console.error("Error al guardar suscripción:", error)
    throw error
  }
}

// Eliminar la suscripción del usuario
export async function unsubscribeUserPush() {
  try {
    const user = await getSession()

    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    // Eliminar la suscripción
    await deleteSubscription(user.id)

    return { success: true }
  } catch (error) {
    console.error("Error al eliminar suscripción:", error)
    throw error
  }
}

export async function sendMockNotification(alarmId: string, message: string) {
  try {
    const user = await getSession()
    if (!user) {
      console.error("Usuario no autenticado")
      return { success: false, error: "Usuario no autenticado" }
    }
    // Obtener la suscripción del usuario
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscriptions = (await getSubscriptionDataByUserId(user?.id)) as any[]
    console.log(subscriptions)
    if (subscriptions.length === 0) {
      console.error("No hay suscripción disponible para el usuario:", user)
      return { success: false, error: "No hay suscripción disponible" }
    }


    // Enviar la notificación
    await webpush.sendNotification(
      subscriptions[0],
      JSON.stringify({
        title: "¡Alarma!",
        body: message,
        icon: "/icon.png",
        data: {
          alarmId,
          userId: user.id,
        },
      }),
    )
    console.log("Notificación push enviada con éxito para la alarma:", alarmId)
    return { success: true }
  } catch (error) {
    console.error("Error al enviar notificación push:", error)
    return { success: false, error: "Error al enviar notificación" }
  }
}

export async function sendTaskNotification(taskId: string, userId: string, message: string) {
  try {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscriptions = (await getSubscriptionDataByUserId(userId)) as any[]
    
    if (subscriptions.length === 0) {
      console.error("No hay suscripción disponible para el usuario:", userId)
      return { success: false, error: "No hay suscripción disponible" }
    }

    // Enviar notificación con mejor formato y vibración
    await webpush.sendNotification(
      subscriptions[0],
      JSON.stringify({
        title: "✨ ¡SpaceFocus te recuerda!",
        body: message,
        icon: "/icon.png",
        badge: "/badge.png",
        vibrate: [100, 50, 100, 50, 100],
        data: {
          taskId,
          userId,
          url: `/tasks/${taskId}`,
        },
        actions: [
          {
            action: 'complete',
            title: '✅ Completar'
          },
          {
            action: 'postpone',
            title: '⏰ Posponer'
          }
        ]
      }),
    )
    
    console.log("Notificación push enviada con éxito para la tarea:", taskId)
    return { success: true }
  } catch (error) {
    console.error("Error al enviar notificación push:", error)
    return { success: false, error: "Error al enviar notificación" }
  }
}