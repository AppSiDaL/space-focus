"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TimerSection from "./TimerSection";
import ActivitiesList from "./ActivitiesList";
import ActivityFormWrapper from "./ActivityFormWrapper";
import { Task } from "@/types";
import {
  getTasksAction,
  deleteTaskAction,
  completeTask,
} from "@/lib/actions/task";
import { useToast } from "@/context/useToast";
import { updateStreakOnTaskCompletion } from "@/lib/actions/streak";

export default function TimerView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setIsDeleting] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getTasksAction();
      console.log(result);
      if (result.success) {
        setTasks(result.tasks || []);
      } else {
        setError(result.error || "Failed to load tasks");
        console.error("Error loading tasks:", result.error);
        toast.error(result.error || "Failed to load tasks");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error fetching tasks:", err);
      toast.error("An unexpected error occurred while loading tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleTaskDelete = async (taskId: string) => {
    try {
      setIsDeleting(true);

      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }

      const result = await deleteTaskAction(taskId);

      if (result.success) {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

        // Refrescar la página para obtener datos actualizados del servidor
        router.refresh();

        toast.success("The task was successfully deleted");
      } else {
        console.error("Error deleting task:", result.error);
        toast.error(result.error || "Failed to delete the task");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error("An unexpected error occurred while deleting the task");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTaskComplete = async (taskId: string, remainingTime: number) => {
    try {
      if (remainingTime > 0) {
        toast.error("You must complete the task before marking it as done");
        return;
      }
      const result = await completeTask(taskId);
      const streakResult = await updateStreakOnTaskCompletion();
      console.log(streakResult);

      if (result.success) {
        // Actualizar el estado localmente para una respuesta inmediata
        const currentDate = new Date();
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  completed: true,
                  lastCompleted: currentDate,
                }
              : task
          )
        );

        router.refresh();

        toast.success("The task was marked as completed");
      } else {
        console.error("Error completing task:", result.error);
        toast.error(result.error || "Failed to complete the task");
        loadTasks();
      }
    } catch (err) {
      console.error("Error completing task:", err);
      toast.error("An unexpected error occurred while completing the task");
      loadTasks();
    }
  };

  // Función para editar una tarea
  const handleTaskEdit = (task: Task) => {
    // Aquí puedes implementar la lógica para editar la tarea
    console.log("Edit task:", task);
    toast.info(`Editing task: ${task.title}`);
  };

  return (
    <>
      <div className="flex flex-col h-full">
        <div>
          <TimerSection
            selectedTask={selectedTask}
            onTaskComplete={handleTaskComplete}
            onDeleteTask={handleTaskDelete}
          />
        </div>
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
    </>
  );
}
