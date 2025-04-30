import mysql from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

// Define User types
export type User = {
  id: string;
  email: string;
  name: string;
};

export type UserWithPassword = User & {
  password: string;
};

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

// Crear un pool de conexiones para reutilizarlas
const pool = mysql.createPool(process.env.DATABASE_URL || "");

// Función para ejecutar consultas SQL
export async function query(sql: string, params: (string | number | null| boolean)[] = []): Promise<MySQLResultRow[] | MySQLQueryResult> {
  try {
    const [results] = await pool.execute(sql, params);
    return results as MySQLResultRow[] | MySQLQueryResult;
  } catch (error) {
    console.error("Error en la consulta SQL:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<UserWithPassword | null> {
  const users = (await query("SELECT id, email, name, password FROM users WHERE email = ?", [email])) as MySQLResultRow[];
  return users.length > 0 ? users[0] as unknown as UserWithPassword : null;
}

export async function countUsers(): Promise<number> {
  const result = (await query("SELECT COUNT(*) as count FROM users")) as MySQLResultRow[];
  return (result[0] as unknown as MySQLCountResult).count;
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
  const id = uuidv4();
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  await query("INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)", [
    id,
    email,
    hashedPassword,
    name,
  ]);
  
  return { id, email, name };
}

export async function getUserById(id: string): Promise<User | null> {
  const users = (await query("SELECT id, email, name FROM users WHERE id = ?", [id])) as MySQLResultRow[];
  return users.length > 0 ? users[0] as unknown as User : null;
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function getAllUsers(): Promise<User[]> {
  return (await query("SELECT id, email, name FROM users")) as unknown as User[];
}

export async function updateUser(id: string, updates: Partial<User>): Promise<boolean> {
  const allowedUpdates = ['name', 'email'];
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