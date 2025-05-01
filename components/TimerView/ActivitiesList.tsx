import React from "react";
import { CalendarCheck } from "lucide-react";
import { Task } from "@/types";
import Activity from "./Activity";

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
        <div className="space-y-2 overflow-y-auto sm:max-h-[65vh] max-h-[55vh] pr-1 custom-scrollbar">
          {filteredTasks.map((task) => (
            <Activity
              key={task.id}
              task={task}
              onTaskSelect={onTaskSelect}
              selectedTaskId={selectedTaskId}
              onTaskDelete={onTaskDelete}
              onTaskEdit={onTaskEdit}
            />
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
