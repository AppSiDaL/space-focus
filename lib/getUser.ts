import jwt from "jsonwebtoken";
import { getUserById } from "@/lib/models/user";
import { User } from "@/types";

export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    // Verificar el token con un timeout para evitar bloqueos
    const decodedPromise = new Promise<{ id: string } | null>((resolve) => {
      try {
        const result = jwt.verify(token, process.env.JWT_SECRET || "secret") as { id: string };
        if (!result || !result.id) {
          resolve(null);
        } else {
          resolve(result);
        }
      } catch (error) {
        console.error("Error al decodificar token:", error);
        resolve(null);
      }
    });
    
    // Establecer un timeout de 2 segundos para la operación
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.log("Timeout en la verificación del token");
        resolve(null);
      }, 2000);
    });
    
    // Usar Promise.race para evitar que se quede atascado
    const decoded = await Promise.race([decodedPromise, timeoutPromise]);
    
    if (!decoded) {
      console.log("Token inválido o timeout en la verificación");
      return null;
    }
    
    // Buscar al usuario por ID
    const user = await getUserById(decoded.id);
    
    if (!user) {
      console.log("Usuario no encontrado para ID:", decoded.id);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("Error al verificar el token:", error);
    return null;
  }
}