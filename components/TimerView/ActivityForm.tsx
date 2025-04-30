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

  // Handle time input change
  const handleTimeChange = (value: string) => {
    // Convert time format like "09:00 a.m." to "09:00:00"
    const timeParts = value.split(" ");
    let hours = parseInt(timeParts[0].split(":")[0]);
    const minutes = parseInt(timeParts[0].split(":")[1]);

    if (timeParts[1] === "p.m." && hours < 12) {
      hours += 12;
    } else if (timeParts[1] === "a.m." && hours === 12) {
      hours = 0;
    }

    setScheduledTime(
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:00`
    );
  };

  // Format time for display
  const formatTimeForDisplay = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);

    if (hour === 0) {
      return `12:${minutes} a.m.`;
    } else if (hour < 12) {
      return `${hour}:${minutes} a.m.`;
    } else if (hour === 12) {
      return `12:${minutes} p.m.`;
    } else {
      return `${hour - 12}:${minutes} p.m.`;
    }
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
    <div className="bg-[#0e1525] border border-slate-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Add New Activity</h3>
        <button onClick={onClose} disabled={isSubmitting}>
          <X className="text-slate-400" size={18} />
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            Activity Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you working on?"
            className="w-full bg-[#1e293b] border border-slate-700 rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Category</label>
          <div className="grid grid-cols-3 gap-3">
            {TASK_CATEGORIES.map((category) => (
              <CategoryButton
                key={category.name}
                name={category.name}
                icon={renderCategoryIcon(category.icon)}
                color={category.color}
                active={selectedCategory === category.name}
                onClick={() => setSelectedCategory(category.name)}
                description={category.description}
              />
            ))}
          </div>
        </div>

        {/* Duration Slider */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            Duration (minutes)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="w-20 text-right">
              <div className="font-medium">{duration} min</div>
            </div>
          </div>
        </div>

        {/* Schedule Option */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 accent-indigo-500"
              id="schedule"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
            />
            <label htmlFor="schedule" className="text-sm">
              Schedule this activity
            </label>
          </div>

          {isScheduled && (
            <>
              {/* Time Selection */}
              <div className="pl-6">
                <label className="block text-sm text-slate-400 mb-1">
                  Time
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatTimeForDisplay(scheduledTime)}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded p-2 focus:outline-none"
                  />
                  <Clock
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                </div>
              </div>

              {/* Days Selection */}
              <div className="pl-6">
                <label className="block text-sm text-slate-400 mb-1">
                  Days
                </label>
                <div className="flex flex-wrap gap-1">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <button
                        key={day}
                        className={`w-10 h-10 rounded-full text-xs flex items-center justify-center transition-colors ${
                          selectedDays.includes(day)
                            ? "bg-indigo-500 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                        onClick={() => toggleDay(day)}
                        type="button"
                      >
                        {day}
                      </button>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Form Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2 px-4 bg-slate-800 hover:bg-slate-700 transition-colors rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2 px-4 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 transition-colors rounded-lg disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Add Activity"}
          </button>
        </div>
      </div>
    </div>
  );
}
