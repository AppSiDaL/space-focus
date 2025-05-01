"use client";
import { sendMockNotification } from "@/lib/actions/subscriptions";
import { useState } from "react";

export default function TestNotification() {
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  const handleTestNotification = async () => {
    try {
      setIsSendingNotification(true);

      // Generar un ID de tarea temporal para la notificación de prueba
      const testTaskId = "test-notification-" + Date.now();

      const result = await sendMockNotification(
        testTaskId,
        "🔔 Notificación de prueba - " + new Date().toLocaleTimeString()
      );

      if (result.success) {
        console.log("Notificación enviada correctamente:", result);
      } else {
        console.log("Error al enviar notificación:", result.error);
      }
    } catch (error) {
      console.error("Error al enviar notificación:", error);
    } finally {
      setIsSendingNotification(false);
    }
  };

  return (
    <button
      onClick={handleTestNotification}
      disabled={isSendingNotification}
      className={`py-2 px-4 rounded-md text-sm flex items-center gap-2 transition
                         ${
                           isSendingNotification
                             ? "bg-slate-700 cursor-not-allowed"
                             : "bg-indigo-600 hover:bg-indigo-500"
                         }`}
    >
      {isSendingNotification ? (
        <>
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          Enviando...
        </>
      ) : (
        <>🔔 Enviar notificación de prueba</>
      )}
    </button>
  );
}
