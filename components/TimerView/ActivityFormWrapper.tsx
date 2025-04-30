"use client";

import React, { useState } from "react";
import ActivityForm from "./ActivityForm";
import { Task } from "@/types";

interface ActivityFormWrapperProps {
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
}

export default function ActivityFormWrapper({
  setTasks,
}: ActivityFormWrapperProps) {
  const [showAddActivity, setShowAddActivity] = useState(true);

  if (!showAddActivity) {
    return (
      <button
        onClick={() => setShowAddActivity(true)}
        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 transition-colors rounded-lg disabled:opacity-50"
      >
        Add New Activity
      </button>
    );
  }

  return (
    <ActivityForm
      setTasks={setTasks}
      onClose={() => setShowAddActivity(false)}
    />
  );
}
