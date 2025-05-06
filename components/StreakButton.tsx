"use client";

import React, { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import { getCurrentStreak } from "@/lib/actions/streak";
import StreakCalendar from "./StreakCalendar";
import { Streak } from "@/types";

export default function StreakButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStreak, setCurrentStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStreak() {
      try {
        const streak = await getCurrentStreak();
        setCurrentStreak(streak);
      } catch (error) {
        console.error("Error al obtener la racha:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStreak();
  }, []);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="relative flex items-center justify-center p-2 rounded-full hover:bg-slate-800"
        aria-label="Ver racha diaria"
        title="Racha diaria"
        disabled={loading}
      >
        <Flame
          className={`${loading ? "text-gray-500" : "text-red-500"}`}
          size={22}
        />
        {!loading && currentStreak  && (
          <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {currentStreak.currentStreak}
          </span>
        )}
      </button>

      {currentStreak && (
        <StreakCalendar
          streak={currentStreak}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(!isModalOpen)}
        />
      )}
    </>
  );
}
