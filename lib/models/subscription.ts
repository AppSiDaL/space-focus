import { query } from "@/lib/db";
import { Subscription,SubscriptionInput} from "@/types";
import { v4 as uuidv4 } from "uuid";

/**
 * Obtiene todas las suscripciones de un usuario
 */

export async function getSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
    const subscriptions = await query("SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC",
[userId]) as any[];
    return subscriptions.map(subscription => ({
        ...subscription,
        created_at: new Date(subscription.created_at)
    }));    
}

/**
 * Crea una nueva suscripción para un usuario
 */
export async function createSubscription(
  userId: string,
  subscription: PushSubscription
): Promise<Subscription> {
  const id = uuidv4();
  const now = new Date();
  const isoDate = now.toISOString().slice(0, 19).replace('T', ' ');
  await query("INSERT INTO subscriptions (id, user_id, subscription) VALUES (?, ?, ?)", [
    id,
    userId,
    JSON.stringify(subscription),
  ])
    return {
        id,
        user_id: userId,
        subscription: subscription,
        created_at: now
    };
  }


/**
 * Actualiza suscripción de un usuario
 */
export async function updateSubscription(
  userId: string,
  subscription: PushSubscription
): Promise<boolean> {
    const result = await query(
      "UPDATE subscriptions SET subscription = ? WHERE user_id = ?",
      [
        JSON.stringify(subscription),
        userId,
      ]
    );
    return (result as any).affectedRows > 0;
}

/**
 * Elimina la suscripción de un usuario
 */
export async function deleteSubscription(userId: string): Promise<boolean> {
    const result = await query(
      "DELETE FROM subscriptions WHERE user_id = ?",
      [userId]
    );
    return (result as any).affectedRows > 0;
}

/**
 * Obtiene solo los datos de suscripción de un usuario
 */
export async function getSubscriptionDataByUserId(userId: string): Promise<PushSubscription[]> {
  const subscriptions = (await query("SELECT subscription FROM subscriptions WHERE user_id = ?", [userId])) as any[];
  return subscriptions.map(item => JSON.parse(item.subscription));
}