"use client";

import React, { useState } from "react";
import { X, Clock } from "lucide-react";
import CategoryButton from "./CategoryButton";
import { Task, TaskInput } from "@/types";
import { createTaskAction } from "@/lib/actions/task";
import { useRouter } from "next/navigation";
import { TASK_CATEGORIES } from "@/lib/const";

interface ActivityFormProps {
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  onClose: () => void;
}

export default function ActivityForm({ onClose, setTasks }: ActivityFormProps) {
  const router = useRouter();

  // Form state variables
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Reading");
  const [duration, setDuration] = useState(25); // Default to one pomodoro
  const [isScheduled, setIsScheduled] = useState(true);
  const [scheduledTime, setScheduledTime] = useState("09:00:00"); // in format HH:MM:SS
  const [selectedDays, setSelectedDays] = useState([
    "Mon",
    "Wed",
    "Thu",
    "Fri",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
        // Una actividad es recurrente si está programada y tiene días seleccionados
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
      // Para el caso especial del icono de código que no es un emoji
      return <span className="text-center">{iconValue}</span>;
    }
    return <span className="text-xl">{iconValue}</span>;
  };

  return (
    <div className="bg-[#0e1525] border border-slate-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">Add New Activity</h3>
        <button onClick={onClose} disabled={isSubmitting}>
          <X className="text-slate-400" size={16} />
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 p-2 rounded mb-3 text-xs">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* Activity Name and Duration slider on same row */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-400">Activity Name</label>
            <label className="text-xs text-slate-400">{duration} min</label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* First column: input - exactly 50% width */}
            <div className="col-span-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you working on?"
                className="w-full h-9 bg-[#1e293b] border border-slate-700 rounded p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {/* Second column: slider - exactly 50% width with vertical centering */}
            <div className="col-span-1 flex items-center">
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Category</label>
          <div className="grid grid-cols-3 gap-2">
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

        {/* Schedule Option - Three column layout without layout shift */}
        <div>
          {/* Fixed row with always-rendered columns to prevent layout shift */}
          <div className="flex items-center relative h-7">
            {/* Column 1: Schedule checkbox - always visible */}
            <div className="flex items-center gap-2 w-24">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 accent-indigo-500"
                id="schedule"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
              />
              <label htmlFor="schedule" className="text-xs">
                Schedule
              </label>
            </div>

            {/* Always render both content areas but hide with opacity to prevent layout shift */}
            <div className="flex flex-1">
              {/* Column 2: Time input - always rendered for layout stability */}
              <div className="w-28 relative">
                <div
                  className={`relative transition-opacity duration-200 ${
                    isScheduled ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <input
                    type="time"
                    value={getTimeInputValue()}
                    onChange={handleTimeInputChange}
                    className={`w-full bg-[#1e293b] border border-slate-700 rounded p-1 text-sm focus:outline-none`}
                    disabled={!isScheduled}
                  />
                  <Clock
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={14}
                  />
                </div>
              </div>

              {/* Column 3: Days selection - always rendered for layout stability */}
              <div className="flex-1 ml-auto">
                <div
                  className={`flex flex-wrap gap-1 justify-end transition-opacity duration-200 ${
                    isScheduled ? "opacity-100" : "opacity-0"
                  }`}
                >
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
                        className={`w-6 h-6 rounded-full text-xs flex items-center justify-center transition-colors ${
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
              </div>
            </div>
          </div>
        </div>

        {/* Form Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 transition-colors rounded-lg disabled:opacity-50 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-1.5 px-3 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 transition-colors rounded-lg disabled:opacity-50 text-sm"
          >
            {isSubmitting ? "Creating..." : "Add Activity"}
          </button>
        </div>
      </div>
    </div>
  );
}
