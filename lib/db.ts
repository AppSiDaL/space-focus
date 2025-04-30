import mysql from "mysql2/promise"

// Crear un pool de conexiones para reutilizarlas
const pool = mysql.createPool(process.env.DATABASE_URL || "")

// Función para ejecutar consultas SQL
export async function query(sql: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error("Error en la consulta SQL:", error)
    throw error
  }
}

export async function initDatabase() {
  try {
    // Crear tabla de usuarios
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        subscription JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    
    await query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        title TEXT NOT NULL,
        category VARCHAR(255),
        completed BOOLEAN NOT NULL DEFAULT 0,
        durationMinutes INTEGER NOT NULL DEFAULT 25,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        isRecurring BOOLEAN NOT NULL DEFAULT 0,
        scheduledTime TIME,
          scheduledDays TEXT,
        lastCompleted DATE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("Base de datos inicializada correctamente");
    return { success: true, message: "Base de datos inicializada correctamente" };
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
    throw error;
  }
}
