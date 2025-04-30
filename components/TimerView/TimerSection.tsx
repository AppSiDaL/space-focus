import React, { useState } from "react";
import {
  Play,
  Pause,
  Trash2,
  BookOpen,
  Code,
  Dumbbell,
  BookMarked,
} from "lucide-react";
import { Task } from "@/types";
import { motion } from "framer-motion";
import Rocket from "./Rocket";
import FocusView from "./FocusView";

interface TimerSectionProps {
  selectedTask: Task | null;
  onDeleteTask?: (taskId: string) => void;
}

export default function TimerSection({
  selectedTask,
  onDeleteTask,
}: TimerSectionProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(
    selectedTask?.durationMinutes ? selectedTask.durationMinutes * 60 : 25 * 60
  );

  const handleStart = () => {
    if (selectedTask) {
      setIsFocusMode(true); // Activamos el modo Focus
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleExitFocus = () => {
    setIsFocusMode(false);
    setIsRunning(false);
  };

  const handleDelete = () => {
    if (selectedTask && onDeleteTask) {
      onDeleteTask(selectedTask.id);
    }
  };

  // Determinar qué icono mostrar basado en el tipo de actividad
  const getActivityIcon = () => {
    if (!selectedTask) return null;

    const category = selectedTask.category?.toLowerCase() || "";

    switch (category) {
      case "reading":
        return <BookOpen className="w-5 h-5 text-purple-400" />;
      case "coding":
        return <Code className="w-5 h-5 text-blue-400" />;
      case "exercise":
        return <Dumbbell className="w-5 h-5 text-green-400" />;
      default:
        return <BookMarked className="w-5 h-5 text-indigo-400" />;
    }
  };

  if (isFocusMode) {
    return (
      <FocusView
        activity={selectedTask}
        initialTime={remainingTime}
        onExit={handleExitFocus}
      />
    );
  }

  return (
    <>
      <div className="timer-card p-3 transition-opacity duration-300 min-h-[200px] sm:min-h-[180px]">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Timer</h2>
          <motion.button
            className="p-2 hover:bg-red-600/20 rounded-full text-gray-400 hover:text-red-500 transition-colors self-end sm:self-auto"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            aria-label="Eliminar actividad"
            disabled={!selectedTask}
          >
            <Trash2
              className={`w-5 h-5 ${!selectedTask ? "opacity-40" : ""}`}
            />
          </motion.button>
        </div>

        <div className="flex items-center justify-between gap-2 sm:gap-10 py-2 h-full">
          <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#0c1428]/70 border-2 border-indigo-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)] relative">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {Math.floor(remainingTime / 60)}
                <span className="text-indigo-400">:</span>
                {(remainingTime % 60).toString().padStart(2, "0")}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 relative order-first sm:order-none">
            <motion.div
              initial={{ y: 0, opacity: selectedTask ? 1 : 0 }}
              animate={{
                y: selectedTask ? [2, -4, 2] : 0,
                opacity: selectedTask ? 1 : 0,
              }}
              transition={{
                duration: 2.5,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            >
              <Rocket state="ready" />
            </motion.div>
            {selectedTask && (
              <div className="absolute -bottom-1 w-20 h-2 bg-[#2563eb] rounded-full blur-sm">
                -------
              </div>
            )}
          </div>

          <div className="flex-1 ml-4 flex flex-col justify-center">
            {/* Selected task info */}
            {selectedTask ? (
              <div>
                <div className="flex gap-2 mb-1">
                  <div className="w-14 h-14 rounded-md bg-indigo-900/50 flex items-center justify-center mr-3 flex-shrink-0 self-center">
                    {getActivityIcon()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1">
                      {selectedTask.title}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div className="text-slate-400">
                        Duration: {selectedTask.durationMinutes} min
                      </div>
                    </div>
                  </div>
                </div>
                <motion.button
                  className="w-full h-12 sm:h-14 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 text-white rounded-md flex items-center justify-center text-base sm:text-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 mt-3"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0px 0px 15px rgba(59, 130, 246, 0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={isRunning ? handlePause : handleStart}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-100" />
                      <span className="text-white">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-100" />
                      <span className="text-white">Start</span>
                    </>
                  )}
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-400 px-4 py-2 text-center">
                Select an activity from the list below to start the timer
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
