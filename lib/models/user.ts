import { query } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { User,UserWithPassword } from "@/types";

// Define tipos para los resultados de MySQL
type MySQLResultRow = Record<string, string | number | null | Buffer>;
type MySQLQueryResult = {
  affectedRows: number;
  insertId: number;
  warningStatus: number;
};
type MySQLCountResult = {
  count: number;
};


export async function getUserByEmail(email: string): Promise<UserWithPassword | null> {
  const users = (await query("SELECT id, email, name, password, timezone FROM users WHERE email = ?", [email])) as MySQLResultRow[];
  
  if (users.length === 0) return null;
  
  const user = users[0];
  return {
    id: user.id as string,
    email: user.email as string,
    name: user.name as string,
    password: user.password as string,
    timezone: (user.timezone as string) || 'America/Mexico_City' // Valor predeterminado
  };
}

export async function countUsers(): Promise<number> {
  const result = (await query("SELECT COUNT(*) as count FROM users")) as MySQLResultRow[];
  return (result[0] as unknown as MySQLCountResult).count;
}

export async function createUser(email: string, password: string, name: string, timezone: string = 'America/Mexico_City'): Promise<User> {
  const id = uuidv4();
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  await query("INSERT INTO users (id, email, password, name, timezone) VALUES (?, ?, ?, ?, ?)", [
    id,
    email,
    hashedPassword,
    name,
    timezone
  ]);
  
  return { id, email, name, timezone };
}

export async function getUserById(id: string): Promise<User | null> {
  const users = (await query("SELECT id, email, name, timezone FROM users WHERE id = ?", [id])) as MySQLResultRow[];
  
  if (users.length === 0) return null;
  
  const user = users[0];
  return {
    id: user.id as string,
    email: user.email as string,
    name: user.name as string,
    timezone: (user.timezone as string) || 'America/Mexico_City'
  };
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function getAllUsers(): Promise<User[]> {
  const users = (await query("SELECT id, email, name, timezone FROM users")) as MySQLResultRow[];
  
  return users.map(user => ({
    id: user.id as string,
    email: user.email as string,
    name: user.name as string,
    timezone: (user.timezone as string) || 'America/Mexico_City'
  }));
}

export async function updateUser(id: string, updates: Partial<User>): Promise<boolean> {
  const allowedUpdates = ['name', 'email', 'timezone']; // Añadido timezone
  const validUpdates = Object.entries(updates)
    .filter(([key]) => allowedUpdates.includes(key))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
  
  if (Object.keys(validUpdates).length === 0) {
    return false;
  }
  
  const setClauses = Object.keys(validUpdates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(validUpdates), id];
  
  const result = await query(`UPDATE users SET ${setClauses} WHERE id = ?`, values);
  return ((result as MySQLQueryResult).affectedRows) > 0;
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await query("DELETE FROM users WHERE id = ?", [id]);
  return ((result as MySQLQueryResult).affectedRows) > 0;
}

/**
 * Actualiza la zona horaria de un usuario
 */
export async function updateUserTimezone(userId: string, timezone: string): Promise<boolean> {
  try {
    const result = await query(
      "UPDATE users SET timezone = ? WHERE id = ?",
      [timezone, userId]
    ) as MySQLQueryResult;
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error al actualizar timezone:", error);
    return false;
  }
}

/**
 * Ejecutar migración para añadir el campo timezone si no existe
 */
export async function migrateTimezoneField(): Promise<boolean> {
  try {
    // Verificar si la columna ya existe
    const checkColumn = await query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'timezone'
    `) as MySQLResultRow[];
    
    if (Array.isArray(checkColumn) && checkColumn.length === 0) {
      // La columna no existe, añadirla
      await query(`
        ALTER TABLE users 
        ADD COLUMN timezone VARCHAR(50) DEFAULT 'America/Mexico_City'
      `);
      console.log("Columna timezone añadida a la tabla usuarios");
      return true;
    } else {
      console.log("La columna timezone ya existe en la tabla usuarios");
      return false;
    }
  } catch (error) {
    console.error("Error al migrar la columna timezone:", error);
    return false;
  }
}