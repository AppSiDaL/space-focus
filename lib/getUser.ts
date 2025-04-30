import jwt from "jsonwebtoken";
import { getUserById } from "@/lib/models/user";
import { User } from "@/types";

export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { id: string };
    
    if (!decoded || !decoded.id) {
      return null;
    }
    
    // Buscar al usuario por ID
    const user = await getUserById(decoded.id);
    return user;
  } catch (error) {
    console.error("Error al verificar el token:", error);
    return null;
  }
}