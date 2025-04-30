export interface User {
  id: string
  email: string
  name: string
}

export interface UserWithPassword extends User {
  password: string
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  category: string | null;
  completed: boolean;
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
  isRecurring: boolean;
  scheduledTime: string | null; // Format: "HH:MM:SS"
  scheduledDays: string[] | null; // Days of week: ["monday", "wednesday", "friday"]
  lastCompleted: Date | null;
  lastNotified: Date | null;  // Nuevo campo: última vez que se notificó la tarea
}

export interface TaskInput {
  title: string;
  category?: string | null;
  durationMinutes: number;
  isRecurring?: boolean;
  scheduledTime?: string | null; // Format: "HH:MM:SS"
  scheduledDays?: string[] | null; // Days of week
}

export interface TaskUpdateInput {
  title?: string;
  category?: string | null;
  completed?: boolean;
  durationMinutes?: number;
  isRecurring?: boolean;
  scheduledTime?: string | null;
  scheduledDays?: string[] | null;
  lastCompleted?: Date | null;
  lastNotified?: Date | null;  // Nuevo campo para actualización
}


export interface Subscription {
  id: string;
  user_id: string;
  subscription: any;
  created_at: Date;
}

export interface SubscriptionInput {
  user_id: string;
  subscription: any;
}