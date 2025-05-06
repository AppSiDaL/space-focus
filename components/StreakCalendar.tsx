"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Crown, Flame } from "lucide-react";
import Portal from "./ui/Portal";

export interface Streak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null; // formato YYYY-MM-DD
  startDate: string; // formato YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

interface StreakModalProps {
  streak: Streak;
  isOpen: boolean;
  onClose: () => void;
}

export default function StreakCalendar({
  streak,
  isOpen,
  onClose,
}: StreakModalProps) {
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [, setStartDay] = useState<number | null>(null);
  const [, setEndDay] = useState<number | null>(null);
  const [isStreakCompletedToday, setIsStreakCompletedToday] = useState(false);

  // Wrap the function in useCallback
  const calculateCompletedDays = useCallback(
    (referenceDate: Date) => {
      if (!streak) return;

      const startDate = new Date(streak.startDate);
      const lastActivityDate = new Date(streak.lastActivityDate || new Date());

      // Verificar si estamos viendo el mes actual donde está la racha
      const isStartMonth =
        startDate.getMonth() === referenceDate.getMonth() &&
        startDate.getFullYear() === referenceDate.getFullYear();

      const isEndMonth =
        lastActivityDate.getMonth() === referenceDate.getMonth() &&
        lastActivityDate.getFullYear() === referenceDate.getFullYear();

      // Calcular los días completados para el mes actual
      if (isStartMonth && isEndMonth) {
        // Si tanto el inicio como el fin están en este mes
        const days: number[] = [];
        const start = startDate.getDate();
        const end = lastActivityDate.getDate();

        // Establecer los días de inicio y fin para la franja
        setStartDay(start);
        setEndDay(end);

        for (let i = start; i <= end; i++) {
          days.push(i);
        }

        setCompletedDays(days);
      } else if (isEndMonth) {
        // Si solo el fin está en este mes
        const days: number[] = [];
        const end = lastActivityDate.getDate();

        // Establecer los días de inicio y fin para la franja
        setStartDay(1);
        setEndDay(end);

        for (let i = 1; i <= end; i++) {
          days.push(i);
        }

        setCompletedDays(days);
      } else if (isStartMonth) {
        // Si solo el inicio está en este mes
        const days: number[] = [];
        const start = startDate.getDate();
        const daysInMonth = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          0
        ).getDate();

        // Establecer los días de inicio y fin para la franja
        setStartDay(start);
        setEndDay(daysInMonth);

        for (let i = start; i <= daysInMonth; i++) {
          days.push(i);
        }

        setCompletedDays(days);
      } else if (
        (referenceDate.getFullYear() > startDate.getFullYear() ||
          (referenceDate.getFullYear() === startDate.getFullYear() &&
            referenceDate.getMonth() > startDate.getMonth())) &&
        (referenceDate.getFullYear() < lastActivityDate.getFullYear() ||
          (referenceDate.getFullYear() === lastActivityDate.getFullYear() &&
            referenceDate.getMonth() < lastActivityDate.getMonth()))
      ) {
        // Si estamos en un mes intermedio entre el inicio y el fin
        const days: number[] = [];
        const daysInMonth = new Date(
          referenceDate.getFullYear(),
          referenceDate.getMonth() + 1,
          0
        ).getDate();

        // Establecer los días de inicio y fin para la franja
        setStartDay(1);
        setEndDay(daysInMonth);

        for (let i = 1; i <= daysInMonth; i++) {
          days.push(i);
        }

        setCompletedDays(days);
      } else {
        // Si estamos viendo otro mes, no hay días completados
        setCompletedDays([]);
        setStartDay(null);
        setEndDay(null);
      }
    },
    [streak]
  ); // Only recreate this function when streak changes

  // Inicializar el mes actual y calcular los días completados cuando se abre el modal
  useEffect(() => {
    if (isOpen && streak) {
      // Establecer el mes actual basado en la fecha de la última actividad
      const lastActivityDate = new Date(streak.lastActivityDate || new Date());
      setCurrentMonth(lastActivityDate);

      // Determinar si la racha se ha completado hoy
      const today = new Date();
      const lastActivity = new Date(streak.lastActivityDate || "");
      const isToday =
        lastActivity.getDate() === today.getDate() &&
        lastActivity.getMonth() === today.getMonth() &&
        lastActivity.getFullYear() === today.getFullYear();

      setIsStreakCompletedToday(isToday);

      // Calcular los días completados
      calculateCompletedDays(lastActivityDate);
    }
  }, [isOpen, streak, calculateCompletedDays]);

  // Cuando cambia el mes, recalcular los días completados
  useEffect(() => {
    if (currentMonth) {
      calculateCompletedDays(currentMonth);
    }
  }, [currentMonth, calculateCompletedDays]);

  if (!isOpen || !currentMonth) return null;

  const monthName = currentMonth
    .toLocaleString("default", { month: "long" })
    .toUpperCase();
  const year = currentMonth.getFullYear();

  const daysInMonth = new Date(year, currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentMonth.getMonth(), 1).getDay();

  // Adjust for Sunday as first day of week
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: adjustedFirstDay }, (_, i) => i);

  // Verificar si podemos navegar a meses anteriores o posteriores
  const startDate = new Date(streak.startDate);
  const lastActivityDate = new Date(streak.lastActivityDate || new Date());

  // Solo permitir navegar entre los meses que tienen la racha
  const canGoToPreviousMonth =
    currentMonth.getFullYear() > startDate.getFullYear() ||
    (currentMonth.getFullYear() === startDate.getFullYear() &&
      currentMonth.getMonth() > startDate.getMonth());

  const canGoToNextMonth =
    currentMonth.getFullYear() < lastActivityDate.getFullYear() ||
    (currentMonth.getFullYear() === lastActivityDate.getFullYear() &&
      currentMonth.getMonth() < lastActivityDate.getMonth());

  const previousMonth = () => {
    if (canGoToPreviousMonth) {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      );
    }
  };

  const nextMonth = () => {
    if (canGoToNextMonth) {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
      );
    }
  };

  // Function to determine if a day is part of a streak and its position
  const getStreakPosition = (day: number) => {
    // Si el día no está en los días completados, no es parte de la racha
    if (!completedDays.includes(day)) return "none";

    const prevDayCompleted = completedDays.includes(day - 1);
    const nextDayCompleted = completedDays.includes(day + 1);

    // Check if the day is at the start of a week
    const dayOfWeek = (adjustedFirstDay + day - 1) % 7;
    const isStartOfWeek = dayOfWeek === 0;
    // Check if the day is at the end of a week
    const isEndOfWeek = dayOfWeek === 6;

    if (prevDayCompleted && nextDayCompleted) {
      return "middle";
    } else if (prevDayCompleted) {
      return isEndOfWeek ? "end" : "end-mid";
    } else if (nextDayCompleted) {
      return isStartOfWeek ? "start" : "start-mid";
    } else {
      return "single";
    }
  };

  // Determinar si un día debe tener un círculo naranja
  const shouldHaveOrangeCircle = (day: number) => {
    // El día de inicio real debe tener círculo naranja
    if (
      currentMonth.getMonth() === startDate.getMonth() &&
      currentMonth.getFullYear() === startDate.getFullYear() &&
      day === startDate.getDate()
    ) {
      return true;
    }

    // El último día de actividad también debe tener círculo naranja
    if (
      currentMonth.getMonth() === lastActivityDate.getMonth() &&
      currentMonth.getFullYear() === lastActivityDate.getFullYear() &&
      day === lastActivityDate.getDate()
    ) {
      return true;
    }

    return false;
  };

  return (
    <Portal>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80">
        <div className="bg-slate-900 rounded-xl shadow-lg overflow-hidden max-w-md w-full">
          {/* Right side modal with calendar */}
          <div className="bg-slate-900 rounded-xl shadow-lg overflow-hidden max-w-md w-full">
            {/* Streak info */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                <div className="flex items-center p-3 ">
                  <Flame className="w-6 h-6 text-red-600 mr-2" />
                  <div>
                    <div className="font-bold text-white">
                      {streak.currentStreak} days
                    </div>
                    <div className="text-sm text-white">Current streak</div>
                  </div>
                </div>
                <div className="flex items-center p-3">
                  <div className="w-6 h-6  rounded-sm flex items-center justify-center mr-2">
                    <Crown className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="font-bold text-white">
                      {streak.longestStreak} days
                    </div>
                    <div className="text-sm text-white">Longest Streak</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="p-4 text-white">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={previousMonth}
                  className={`p-1 ${
                    canGoToPreviousMonth
                      ? "text-gray-300"
                      : "text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!canGoToPreviousMonth}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-bold text-white">
                  {monthName} {year}
                </h3>
                <button
                  onClick={nextMonth}
                  className={`p-1 ${
                    canGoToNextMonth
                      ? "text-gray-300"
                      : "text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!canGoToNextMonth}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2 text-white">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                  <div key={i} className="text-sm font-medium ">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0 text-center">
                {blanks.map((blank, i) => (
                  <div key={`blank-${i}`} className="h-10 text-white"></div>
                ))}

                {days.map((day, i) => {
                  const streakPosition = getStreakPosition(day);
                  const hasOrangeCircle = shouldHaveOrangeCircle(day);
                  const isToday =
                    day === new Date().getDate() &&
                    currentMonth.getMonth() === new Date().getMonth() &&
                    currentMonth.getFullYear() === new Date().getFullYear();

                  // Streak background styles
                  let streakBgClasses = "";
                  if (streakPosition !== "none") {
                    // Base streak background
                    streakBgClasses = "absolute inset-0 bg-green-800/20";

                    // Apply borders based on position
                    if (
                      streakPosition === "start" ||
                      streakPosition === "start-mid"
                    ) {
                      streakBgClasses +=
                        " border-t border-b border-l border-green-600/60 rounded-l-full";
                    } else if (
                      streakPosition === "end" ||
                      streakPosition === "end-mid"
                    ) {
                      streakBgClasses +=
                        " border-t border-b border-r border-green-600/60 rounded-r-full";
                    } else if (streakPosition === "middle") {
                      streakBgClasses +=
                        " border-t border-b border-green-600/60";
                    } else if (streakPosition === "single") {
                      streakBgClasses +=
                        " border border-green-600/60 rounded-full";
                    }
                  }

                  return (
                    <div
                      key={`day-${i}`}
                      className="h-10 flex items-center justify-center relative text-white"
                    >
                      {streakPosition !== "none" && (
                        <div className={streakBgClasses}></div>
                      )}

                      {hasOrangeCircle ? (
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center z-20 text-white font-medium">
                          {day}
                        </div>
                      ) : isToday && !isStreakCompletedToday ? (
                        <div className="w-8 h-8 rounded-full border-2 border-green-600 flex items-center justify-center z-20 font-medium">
                          {day}
                        </div>
                      ) : (
                        <div
                          className={`z-20 font-medium ${
                            streakPosition !== "none"
                              ? "text-gray-300"
                              : "text-gray-500"
                          }`}
                        >
                          {day}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              CONTINUE
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
