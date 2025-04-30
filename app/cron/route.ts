import { NextResponse } from 'next/server';
import { checkScheduledTasks } from '@/lib/actions/task';

// Esta ruta puede ser llamada por un servicio externo como Vercel Cron
export async function GET() {
  try {
    const result = await checkScheduledTasks();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error al ejecutar cron de tareas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al ejecutar cron' },
      { status: 500 }
    );
  }
}