"use server";

import { initDatabase } from "@/lib/db";

export async function seedDatabase() {
  try {
    await initDatabase();

    return { success: true, message: "La base de datos ya tiene datos" };
  } catch (error) {
    console.error("Error al seedear la base de datos:", error);
    return { success: false, message: `Error al seedear la base de datos: ${error}` };
  }
}