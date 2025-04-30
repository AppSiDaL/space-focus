import { query } from "@/lib/db";
import { Subscription } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Tipos específicos para los resultados de la base de datos
type MySQLResultRow = Record<string, string | number | null | Buffer>;
type MySQLQueryResult = {
  affectedRows: number;
  insertId: number;
  warningStatus: number;
};

/**
 * Obtiene todas las suscripciones de un usuario
 */
export async function getSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
    const subscriptions = await query(
      "SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    ) as MySQLResultRow[];
    
    return subscriptions.map(subscription => ({
        id: subscription.id as string,
        user_id: subscription.user_id as string,
        subscription: JSON.parse(subscription.subscription as string),
        created_at: new Date(subscription.created_at as string)
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
  
  await query("INSERT INTO subscriptions (id, user_id, subscription) VALUES (?, ?, ?)", [
    id,
    userId,
    JSON.stringify(subscription),
  ]);
  
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
    ) as MySQLQueryResult;
    
    return result.affectedRows > 0;
}

/**
 * Elimina la suscripción de un usuario
 */
export async function deleteSubscription(userId: string): Promise<boolean> {
    const result = await query(
      "DELETE FROM subscriptions WHERE user_id = ?",
      [userId]
    ) as MySQLQueryResult;
    
    return result.affectedRows > 0;
}

/**
 * Obtiene solo los datos de suscripción de un usuario
 */
export async function getSubscriptionDataByUserId(userId: string): Promise<PushSubscription[]> {
  const subscriptions = await query(
    "SELECT subscription FROM subscriptions WHERE user_id = ?", 
    [userId]
  ) as MySQLResultRow[];
  
  return subscriptions.map(item => JSON.parse(item.subscription as string) as PushSubscription);
}