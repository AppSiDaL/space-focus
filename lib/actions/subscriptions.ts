"use server"

import webpush from "web-push"
import { getAuthenticatedUser } from "./auth";
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
    const user = await getAuthenticatedUser()

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
    const user = await getAuthenticatedUser()

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

export async function sendAlarmNotification(alarmId: string, userId: string, message: string) {
  try {
    // Obtener la suscripción del usuario
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscriptions = (await getSubscriptionDataByUserId(userId)) as any[]
    console.log(subscriptions)
    if (subscriptions.length === 0) {
      console.error("No hay suscripción disponible para el usuario:", userId)
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
          userId,
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

