"use client";

import { useEffect, useState } from "react";
import TimerSection from "./TimerSection";
import ActivitiesList from "./ActivitiesList";
import ActivityFormWrapper from "./ActivityFormWrapper";
import { Task } from "@/types";
import { getTasksAction, deleteTaskAction } from "@/lib/actions/task";

export default function TimerView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setIsDeleting] = useState(false);

  // Cargar tareas al montar el componente
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await getTasksAction();

        if (result.success) {
          setTasks(result.tasks || []);
        } else {
          setError(result.error || "Failed to load tasks");
          console.error("Error loading tasks:", result.error);
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Error fetching tasks:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Función para manejar la eliminación de tareas
  const handleTaskDelete = async (taskId: string) => {
    try {
      setIsDeleting(true);

      // Si la tarea eliminada es la seleccionada actualmente, deseleccionarla
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }

      const result = await deleteTaskAction(taskId);

      if (result.success) {
        // Actualizar la lista de tareas localmente
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      } else {
        console.error("Error deleting task:", result.error);
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para editar una tarea
  const handleTaskEdit = (task: Task) => {
    // Aquí puedes implementar la lógica para editar la tarea
    // Por ejemplo, mostrar un modal o navegar a una página de edición
    console.log("Edit task:", task);
  };

  return (
    <div className="flex flex-col h-full">
      <TimerSection selectedTask={selectedTask} />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-slate-400">
            Loading activities...
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded my-4">
          {error}
        </div>
      ) : (
        <ActivitiesList
          tasks={tasks}
          onTaskSelect={setSelectedTask}
          selectedTaskId={selectedTask?.id}
          onTaskDelete={handleTaskDelete}
          onTaskEdit={handleTaskEdit}
        />
      )}

      <ActivityFormWrapper setTasks={setTasks} />
    </div>
  );
}
