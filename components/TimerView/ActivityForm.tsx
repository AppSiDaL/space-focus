"use client";

import React, { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import CategoryButton from "./CategoryButton";
import { Task, TaskInput } from "@/types";
import { createTaskAction } from "@/lib/actions/task";
import { useRouter } from "next/navigation";
import { TASK_CATEGORIES } from "@/lib/const";

interface ActivityFormProps {
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  onClose: () => void;
  isOpen: boolean;
}

export default function ActivityForm({
  onClose,
  setTasks,
  isOpen,
}: ActivityFormProps) {
  const router = useRouter();

  // Form state variables
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Reading");
  const [duration, setDuration] = useState(20);
  const [isScheduled, setIsScheduled] = useState(true);
  const [scheduledTime, setScheduledTime] = useState("09:00:00");
  const [selectedDays, setSelectedDays] = useState([
    "Mon",
    "Wed",
    "Thu",
    "Fri",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Add escape key listener to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  // Helper to convert day abbreviations to full names
  const mapDayToFull = (day: string): string => {
    const mapping: Record<string, string> = {
      Sun: "sunday",
      Mon: "monday",
      Tue: "tuesday",
      Wed: "wednesday",
      Thu: "thursday",
      Fri: "friday",
      Sat: "saturday",
    };
    return mapping[day] || day.toLowerCase();
  };

  // Toggle day selection
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Activity name is required");
      return;
    }

    // If scheduled but no days selected
    if (isScheduled && selectedDays.length === 0) {
      setError("Please select at least one day for scheduled activity");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Prepare task data
      const taskData: TaskInput = {
        title: title,
        durationMinutes: duration,
        category: selectedCategory,
        isRecurring: isScheduled && selectedDays.length > 0,
        scheduledTime: isScheduled ? scheduledTime : null,
        scheduledDays: isScheduled ? selectedDays.map(mapDayToFull) : null,
      };

      const result = await createTaskAction(taskData);

      if (result.success) {
        // If parent component provided setTasks, update the local state
        if (setTasks && result.task) {
          setTasks((prev) => [...prev, result.task as Task]);
        }

        // Reset form
        setTitle("");
        setSelectedCategory("Reading");
        setDuration(20);
        setIsScheduled(true);
        setScheduledTime("09:00:00");
        setSelectedDays(["Mon", "Wed", "Thu", "Fri"]);

        // Close the form
        onClose();

        // Refresh the page data
        router.refresh();
      } else {
        setError(result.error || "Failed to create activity");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle time input change from HTML time input
  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert from HH:MM format to HH:MM:00
    const timeValue = e.target.value;
    setScheduledTime(`${timeValue}:00`);
  };

  // Get time value for HTML time input (format HH:MM)
  const getTimeInputValue = () => {
    return scheduledTime.substring(0, 5);
  };

  // Renderizar el icono de categoría
  const renderCategoryIcon = (iconValue: string) => {
    if (iconValue === "</>") {
      return <span className="text-center">{iconValue}</span>;
    }
    return <span className="text-xl">{iconValue}</span>;
  };

  // Don't render anything if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div
        className="bg-[#0e1525] border border-slate-800 rounded-lg p-6 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with more spacing */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-lg">Add New Activity</h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="text-slate-400" size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 p-3 rounded mb-4 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Activity Name field with duration display improved */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-300 font-medium">
                Activity Name
              </label>
              <div className="bg-indigo-500/10 px-3 py-1 rounded-full">
                <label className="text-sm text-indigo-300 font-medium">
                  {duration} min
                </label>
              </div>
            </div>

            {/* Input and slider in their own rows for better spacing */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you working on?"
              className="w-full h-10 bg-[#1e293b] border border-slate-700 rounded p-2.5 text-base focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            <input
              type="range"
              min="10"
              max="120"
              step="10"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-indigo-500 h-2 mt-2"
            />
          </div>

          {/* Categories with more spacing */}
          <div className="space-y-3 pt-1">
            <label className="text-sm text-slate-300 font-medium">
              Category
            </label>
            <div className="grid grid-cols-3 gap-3">
              {TASK_CATEGORIES.map((category) => (
                <CategoryButton
                  key={category.name}
                  name={category.name}
                  icon={renderCategoryIcon(category.icon)}
                  color={category.color}
                  active={selectedCategory === category.name}
                  onClick={() => setSelectedCategory(category.name)}
                />
              ))}
            </div>
          </div>

          {/* Schedule Option with improved layout */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-indigo-500"
                  id="schedule"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                />
                <label
                  htmlFor="schedule"
                  className="text-sm text-slate-300 font-medium"
                >
                  Schedule
                </label>
              </div>

              {/* Time picker with better styling */}
              <div
                className={`transition-opacity duration-200 ${
                  isScheduled ? "opacity-100" : "opacity-50 pointer-events-none"
                }`}
              >
                <div className="relative">
                  <input
                    type="time"
                    value={getTimeInputValue()}
                    onChange={handleTimeInputChange}
                    className="w-32 bg-[#1e293b] border border-slate-700 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    disabled={!isScheduled}
                  />
                  <Clock
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                </div>
              </div>
            </div>

            {/* Day selection buttons with improved spacing and size */}
            {isScheduled && (
              <div className="flex justify-between gap-2 py-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => {
                  const fullDay = [
                    "Sun",
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                  ][index];
                  return (
                    <button
                      key={fullDay}
                      className={`w-9 h-9 rounded-full text-sm flex items-center justify-center transition-colors ${
                        selectedDays.includes(fullDay)
                          ? "bg-indigo-500 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                      onClick={() => toggleDay(fullDay)}
                      type="button"
                      disabled={!isScheduled}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form Buttons with better spacing */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 transition-colors rounded-lg disabled:opacity-50 text-base font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 transition-colors rounded-lg disabled:opacity-50 text-base font-medium"
            >
              {isSubmitting ? "Creating..." : "Add Activity"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
