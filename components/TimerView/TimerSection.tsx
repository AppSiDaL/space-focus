import React, { useState, useEffect } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import Rocket from "./Rocket";
import FocusView from "./FocusView";

interface TimerSectionProps {
  selectedTask: Task | null;
  onTaskComplete?: (taskId: string, remainingTime: number) => void;
  onDeleteTask?: (taskId: string) => void;
}

export default function TimerSection({
  selectedTask,
  onDeleteTask,
  onTaskComplete,
}: TimerSectionProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(25 * 60);
  const [showRocket, setShowRocket] = useState(false);

  // Update timer when task changes
  useEffect(() => {
    if (selectedTask?.durationMinutes) {
      setRemainingTime(selectedTask.durationMinutes * 60);
    } else {
      setRemainingTime(25 * 60); // Default 25 minutes
    }
  }, [selectedTask]);

  // Show rocket animation when task is selected
  useEffect(() => {
    if (selectedTask) {
      // Slight delay before showing rocket to create animation effect
      const timer = setTimeout(() => {
        setShowRocket(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowRocket(false);
    }
  }, [selectedTask]);

  const handleStart = () => {
    if (selectedTask) {
      setIsFocusMode(true);
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleExitFocus = (remainingTime: number) => {
    setIsFocusMode(false);
    setIsRunning(false);

    if (selectedTask && onTaskComplete) {
      onTaskComplete(selectedTask.id, remainingTime);
    }
  };

  const handleDelete = () => {
    if (selectedTask && onDeleteTask) {
      onDeleteTask(selectedTask.id);
    }
  };

  // Determine icon based on activity type
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

  // Format minutes and seconds for display
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  return (
    <>
      {/* Aumentado el min-height para evitar cambios de altura */}
      <div className="timer-card p-3 transition-opacity duration-300 min-h-[220px] sm:min-h-[200px] relative">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">Timer</h2>
          <motion.button
            className="p-2 hover:bg-red-600/20 rounded-full text-gray-400 hover:text-red-500 transition-colors self-end sm:self-auto"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            aria-label="Delete activity"
            disabled={!selectedTask}
          >
            <Trash2
              className={`w-5 h-5 ${!selectedTask ? "opacity-40" : ""}`}
            />
          </motion.button>
        </div>

        <div className="flex items-center justify-between gap-2 sm:gap-8 py-2 h-full">
          {/* Timer always on left - dimensiones fijas para evitar layout shift */}
          <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center order-1">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#0c1428]/70 border-2 border-indigo-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)] relative">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
              <AnimatePresence mode="wait">
                {selectedTask ? (
                  <motion.div
                    key="timer-active"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-xl sm:text-2xl font-bold text-white"
                  >
                    <motion.span
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      {minutes}
                    </motion.span>
                    <span className="text-indigo-400">:</span>
                    <motion.span
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      {seconds.toString().padStart(2, "0")}
                    </motion.span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="timer-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xl sm:text-2xl font-bold text-white"
                  >
                    00
                    <span className="text-indigo-400">:</span>
                    00
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Rocket always in middle - dimensiones fijas */}
          <div className="flex-shrink-0 relative h-28 w-16 flex items-center justify-center order-2 sm:order-2">
            <AnimatePresence>
              {showRocket && (
                <motion.div
                  initial={{ y: 60, opacity: 0 }}
                  animate={{
                    y: [60, 0],
                    opacity: 1,
                  }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{
                    duration: 0.7,
                    ease: "easeOut",
                  }}
                  className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                >
                  <Rocket state="ready" />
                </motion.div>
              )}
            </AnimatePresence>

            {selectedTask && showRocket && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-1 w-20 h-2 bg-[#2563eb] rounded-full blur-sm"
              >
                -------
              </motion.div>
            )}
          </div>

          {/* Task info con dimensiones fijas para evitar layout shift */}
          <div className="flex-1 ml-2 flex flex-col justify-center h-[120px] order-3 sm:ml-3">
            <AnimatePresence mode="wait">
              {selectedTask ? (
                <motion.div
                  key="task-info"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-[120px] flex flex-col justify-between"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-12 h-12 rounded-md bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                      {getActivityIcon()}
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-h-[48px] max-w-[160px] sm:max-w-[200px]">
                      <h3 className="font-medium text-sm sm:text-base line-clamp-2 text-white">
                        {selectedTask.title}
                      </h3>
                      <div className="text-xs text-indigo-300 truncate max-w-full">
                        {selectedTask.category}
                      </div>
                    </div>
                  </div>
                  <motion.button
                    className="w-full h-12 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 text-white rounded-md flex items-center justify-center text-base font-medium shadow-md hover:shadow-lg transition-all duration-300 mt-auto"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0px 0px 15px rgba(59, 130, 246, 0.4)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={isRunning ? handlePause : handleStart}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-4 h-4 mr-2 text-blue-100" />
                        <span className="text-white">Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2 text-blue-100" />
                        <span className="text-white">Start</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <motion.p
                    className="text-sm text-slate-300 font-medium px-4 py-2"
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Select an activity to launch
                  </motion.p>
                  <motion.div
                    className="text-xs text-indigo-400 mt-2"
                    initial={{ y: 0 }}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ↑ Ready for takeoff ↑
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
