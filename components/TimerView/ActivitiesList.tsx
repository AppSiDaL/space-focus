import React from "react";
import { CalendarCheck, Play, Edit, Trash2 } from "lucide-react";
import { Task } from "@/types";
import { TASK_CATEGORIES } from "@/lib/const";

interface ActivitiesListProps {
  tasks: Task[];
  selectedTaskId?: string | null;
  onTaskSelect?: (task: Task | null) => void; // Modificado para aceptar null
  onTaskDelete?: (taskId: string) => void;
  onTaskEdit?: (task: Task) => void;
}

export default function ActivitiesList({
  tasks,
  selectedTaskId,
  onTaskSelect,
  onTaskDelete,
  onTaskEdit,
}: ActivitiesListProps) {
  const [filter, setFilter] = React.useState<"all" | "scheduled">("all");

  // Filtrar tareas según el filtro seleccionado
  const filteredTasks = React.useMemo(() => {
    if (filter === "scheduled") {
      return tasks.filter((task) => task.isRecurring || task.scheduledTime);
    }
    return tasks;
  }, [tasks, filter]);

  // Función helper para obtener el color de fondo basado en la categoría
  const getCategoryColor = (category: string) => {
    const categoryInfo = TASK_CATEGORIES.find((cat) => cat.name === category);
    return categoryInfo?.color || "bg-slate-600";
  };

  // Función helper para obtener el icono basado en la categoría
  const getCategoryIcon = (category: string) => {
    const categoryInfo = TASK_CATEGORIES.find((cat) => cat.name === category);
    return categoryInfo?.icon || "🔹";
  };

  // Función para manejar el click en botones de acción sin propagar el evento
  const handleActionClick = (e: React.MouseEvent, callback?: () => void) => {
    e.stopPropagation();
    if (callback) callback();
  };

  // Nueva función para manejar la selección/deselección de tareas
  const handleTaskSelection = (task: Task) => {
    if (!onTaskSelect) return;

    // Si la tarea ya está seleccionada, deseleccionarla enviando null
    if (selectedTaskId === task.id) {
      onTaskSelect(null);
    } else {
      // De lo contrario, seleccionar la nueva tarea
      onTaskSelect(task);
    }
  };

  return (
    <div className="mb-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Activities</h2>
        <div className="flex gap-2">
          <button
            className={`text-xs py-1 px-3 rounded-full transition-colors ${
              filter === "all"
                ? "bg-slate-700"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`text-xs py-1 px-3 rounded-full flex items-center gap-1 transition-colors ${
              filter === "scheduled"
                ? "bg-slate-700"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
            onClick={() => setFilter("scheduled")}
          >
            <CalendarCheck size={12} />
            Scheduled
          </button>
        </div>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-1 custom-scrollbar">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                selectedTaskId === task.id
                  ? "bg-indigo-900/50 border border-indigo-700"
                  : "bg-slate-800 hover:bg-slate-700"
              }`}
              onClick={() => handleTaskSelection(task)}
              style={{
                borderWidth: selectedTaskId === task.id ? "1px" : "0px",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${getCategoryColor(
                    task.category || ""
                  )}`}
                >
                  <span className="text-lg">
                    {getCategoryIcon(task.category || "")}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{task.title}</h3>
                    <span className="text-xs text-slate-400">
                      {task.durationMinutes} min
                    </span>
                  </div>

                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-slate-400">
                      {task.category}
                    </span>

                    {task.isRecurring && (
                      <div className="text-xs text-indigo-400 flex items-center gap-1">
                        <CalendarCheck size={10} />
                        <span>
                          {task.scheduledDays
                            ? task.scheduledDays
                                .map((day) => day.substring(0, 3))
                                .join(", ")
                            : "Recurring"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-1">
                <button
                  className={`p-1.5 rounded-full transition-colors ${
                    selectedTaskId === task.id
                      ? "bg-green-700 hover:bg-green-600"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                  onClick={(e) =>
                    handleActionClick(e, () => handleTaskSelection(task))
                  }
                  title={
                    selectedTaskId === task.id ? "Deselect task" : "Start task"
                  }
                >
                  <Play size={16} className="text-green-400" />
                </button>
                {onTaskEdit && (
                  <button
                    className="p-1.5 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
                    onClick={(e) =>
                      handleActionClick(e, () => onTaskEdit && onTaskEdit(task))
                    }
                    title="Edit task"
                  >
                    <Edit size={16} className="text-blue-400" />
                  </button>
                )}
                {onTaskDelete && (
                  <button
                    className="p-1.5 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
                    onClick={(e) =>
                      handleActionClick(
                        e,
                        () => onTaskDelete && onTaskDelete(task.id)
                      )
                    }
                    title="Delete task"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          {filter === "scheduled"
            ? "No scheduled activities found."
            : "No activities yet. Add one to start building your galaxy!"}
        </div>
      )}
    </div>
  );
}
