"use server";

import { createUser, getUserByEmail, isEmailRegistered, verifyPassword } from "@/lib/models/user";
import { createSession, deleteSession } from '@/lib/auth/session';
export type FormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        confirmPassword?: string[];  // Añadir esta línea
      };
      message?: string;
    }
  | undefined;


export async function login(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const errorMessage = { message: 'Invalid login credentials.' };
    if (!email || !password) {
      return errorMessage
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return errorMessage
    }

    const isMatch = await verifyPassword(password, user.password);

    if (!isMatch) {
      return errorMessage
    }

    const userId = user.id.toString();
    await createSession(userId);
}

export async function logout() {
  return deleteSession();
}

export async function signup(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const timezone = formData.get("timezone") as string; 
  
  if (password !== confirmPassword) {
    return {
      errors: {
        confirmPassword: ["Passwords do not match"]
      }
    };
  }

  const existingUser = await isEmailRegistered(email);

  if (existingUser) {
    return {
      message: 'Email already exists, please use a different email or login.',
    };
  }

  const user = await createUser(email, password, name, timezone);

  if (!user) {
    return {
      message: 'An error occurred while creating your account.',
    };
  }

  const userId = user.id.toString();
  await createSession(userId);
}