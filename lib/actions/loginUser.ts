"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { User } from "@/types";
import { getUserByEmail, verifyPassword } from "@/lib/models/user";

export async function loginUser(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { success: false, message: "Email y contraseña son requeridos" };
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return { success: false, message: "Credenciales inválidas" };
    }

    const isMatch = await verifyPassword(password, user.password);

    if (!isMatch) {
      return { success: false, message: "Credenciales inválidas" };
    }

    // Devolver el usuario sin la contraseña, pero incluyendo timezone
    const userData = { 
      id: user.id, 
      email: user.email, 
      name: user.name,
      timezone: user.timezone || 'America/Mexico_City' // Incluir timezone con valor por defecto
    };

    // Generar token y establecer cookie
    const token = generateToken(userData);
    const cookieStore = await cookies();
    cookieStore.set({
      name: "authToken", // Standardized cookie name
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    });

    return { success: true, user: userData };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return { success: false, message: "Error interno del servidor" };
  }
}

function generateToken(user: User): string {
  // Incluir timezone en el token JWT
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name,
      timezone: user.timezone 
    }, 
    process.env.JWT_SECRET || "secret", 
    {
      expiresIn: "7d",
    }
  );
}