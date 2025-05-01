"use server";

import { getUserByEmail, verifyPassword } from "@/lib/models/user";
import { createSession, deleteSession } from '@/lib/auth/session';
export type FormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
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