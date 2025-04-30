import { NextResponse } from 'next/server';
import { seedDatabase } from "@/lib/actions/seed";

export async function GET() {
  try {
    const result = await seedDatabase();
    
    if (result.success) {
      return NextResponse.json(
        { message: result.message, success: true },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: result.message, success: false },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    return NextResponse.json(
      { message: 'Error inesperado al inicializar la base de datos', success: false },
      { status: 500 }
    );
  }
}