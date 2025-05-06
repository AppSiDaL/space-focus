import { TASK_CATEGORIES } from "@/lib/const";
import { Task } from "@/types";
import {
  CalendarCheck,
  Edit,
  Trash2,
  Play,
  Clock,
  CheckCircle,
} from "lucide-react";

interface ActiviryProps {
  task: Task;
  selectedTaskId?: string | null;
  onTaskSelect?: (task: Task | null) => void; // Modificado para aceptar null
  onTaskDelete?: (taskId: string) => void;
  onTaskEdit?: (task: Task) => void;
}
export default function Activity({
  task,
  selectedTaskId,
  onTaskSelect,
  onTaskDelete,
  onTaskEdit,
}: ActiviryProps) {
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

  // Format time to display in 12-hour format
  const formatTime = (timeString: string | null) => {
    if (!timeString) return null;

    // Parse the HH:MM:SS format
    const [hours, minutes] = timeString.split(":").map(Number);

    // Convert to 12-hour format
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Format scheduled days to show concise labels when possible
  const formatScheduledDays = (scheduledDays: string[] | null) => {
    if (!scheduledDays || scheduledDays.length === 0) return "Recurring";

    const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    const weekend = ["saturday", "sunday"];
    const allDays = [...weekdays, ...weekend];

    // Check if matches all days
    if (
      scheduledDays.length === 7 &&
      allDays.every((day) => scheduledDays.includes(day))
    ) {
      return "Everyday";
    }

    // Check if matches weekdays
    if (
      scheduledDays.length === 5 &&
      weekdays.every((day) => scheduledDays.includes(day)) &&
      weekend.every((day) => !scheduledDays.includes(day))
    ) {
      return "Weekdays";
    }

    // Check if matches weekend
    if (
      scheduledDays.length === 2 &&
      weekend.every((day) => scheduledDays.includes(day)) &&
      weekdays.every((day) => !scheduledDays.includes(day))
    ) {
      return "Weekend";
    }

    // Otherwise show abbreviated days
    return scheduledDays.map((day) => day.substring(0, 3)).join(", ");
  };

  // Check if task was completed today
  const isCompletedToday = () => {
    if (!task.completed || !task.lastCompleted) return false;

    // Parse the lastCompleted date
    const lastCompletedDate = new Date(task.lastCompleted);
    const today = new Date();

    // Compare only the date parts (ignore time)
    return (
      lastCompletedDate.getUTCFullYear() === today.getUTCFullYear() &&
      lastCompletedDate.getUTCMonth() === today.getUTCMonth() &&
      lastCompletedDate.getUTCDate() === today.getUTCDate()
    );
  };

  const completedToday = isCompletedToday();

  return (
    <div
      key={task.id}
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
        selectedTaskId === task.id
          ? "bg-indigo-900/50 border border-indigo-700"
          : completedToday
          ? "bg-green-900/20 border border-green-800"
          : "bg-slate-800 hover:bg-slate-700 border border-slate-700"
      }`}
      onClick={() => handleTaskSelection(task)}
      style={{
        borderWidth: "1px",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            completedToday
              ? "bg-green-700"
              : getCategoryColor(task.category || "")
          }`}
        >
          <span className="text-lg">
            {getCategoryIcon(task.category || "")}
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3
              className={`text-sm font-semibold ${
                completedToday ? "text-green-300" : ""
              }`}
            >
              {task.title}
            </h3>
            <span className="text-xs text-slate-400">
              {task.durationMinutes} min
            </span>
          </div>

          <div className="flex gap-2 mt-1">
            <span className="text-xs text-slate-400">{task.category}</span>

            {task.isRecurring && (
              <div className="text-xs text-indigo-400 flex items-center gap-1">
                <CalendarCheck size={10} />
                <span>{formatScheduledDays(task.scheduledDays)}</span>
              </div>
            )}

            {task.scheduledTime && (
              <div className="text-xs text-amber-400 flex items-center gap-1">
                <Clock size={10} />
                <span>{formatTime(task.scheduledTime)}</span>
              </div>
            )}

            {completedToday && (
              <div className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle size={10} />
                <span>Completed today</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center gap-1">
        {!completedToday && (
          <button
            className={`p-1.5 rounded-full transition-colors ${
              selectedTaskId === task.id
                ? "bg-green-700 hover:bg-green-600"
                : "bg-slate-700 hover:bg-slate-600"
            }`}
            onClick={(e) =>
              handleActionClick(e, () => handleTaskSelection(task))
            }
            title={selectedTaskId === task.id ? "Deselect task" : "Start task"}
          >
            <Play size={16} className="text-green-400" />
          </button>
        )}
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
              handleActionClick(e, () => onTaskDelete && onTaskDelete(task.id))
            }
            title="Delete task"
          >
            <Trash2 size={16} className="text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
}
