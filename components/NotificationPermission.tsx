"use client";

import { useState, useEffect } from "react";
import { Bell, X, Check, AlertTriangle } from "lucide-react";
import {
  initNotifications,
  hasNotificationPermission,
  requestNotificationPermission,
} from "@/lib/notification-manager";
import { subscribeUserPush } from "@/lib/actions/subscriptions";

// Función para convertir base64 a Uint8Array (necesario para las notificaciones push)
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationPermission() {
  const [permissionState, setPermissionState] = useState<
    "default" | "granted" | "denied" | "prompt"
  >("prompt");
  const [isClosing, setIsClosing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  // States for notification permission UI
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      registerServiceWorker();
    }

    // Detectamos si es iOS pero no usamos esta info por ahora
    // El código sigue aquí para implementaciones futuras
  }, []);

  // Registrar el service worker
  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      await registration.pushManager.getSubscription();
    } catch (error) {
      console.error("Error al registrar el service worker:", error);
    }
  }

  useEffect(() => {
    const checkNotificationPermission = async () => {
      // Check if notifications are supported
      if (!("Notification" in window)) {
        return;
      }

      // Check current permission status
      const hasPermission = hasNotificationPermission();

      // Only update state if it's different from current value
      if (hasPermission !== notificationsEnabled) {
        setNotificationsEnabled(hasPermission);
      }

      // If permission is default (not decided) and we haven't asked before
      if (Notification.permission === "default") {
        // Show the permission dialog
        setShowPermissionDialog(true);
        // Mark as asked
      } else if (Notification.permission === "denied") {
        // Check if banner has been dismissed recently
        setShowPermissionDialog(true);
        // If not dismissed and there are scheduled tasks, show the banner
      }

      // Initialize notifications if permission is granted
      if (hasPermission) {
        await initNotifications();
      }

      setInitialLoadComplete(true);
    };

    // Only run this effect once on component mount
    if (!initialLoadComplete) {
      checkNotificationPermission();
    }
  }, [initialLoadComplete, notificationsEnabled]);

  const handlePermissionDialogClose = () => {
    setShowPermissionDialog(false);

    // Check if permission was granted
    const hasPermission = hasNotificationPermission();
    setNotificationsEnabled(hasPermission);
  };

  useEffect(() => {
    // Check current permission status
    if ("Notification" in window) {
      setPermissionState(
        Notification.permission as "default" | "granted" | "denied"
      );
    }
  }, []);

  const handleRequestPermission = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      const serializedSub = JSON.parse(JSON.stringify(sub));
      await subscribeUserPush(serializedSub);
    } catch (error) {
      console.error("Error al suscribirse a notificaciones push:", error);
    }
    setIsClosing(true);
    const granted = await requestNotificationPermission();

    // Update state based on result
    setPermissionState(granted ? "granted" : "denied");

    // Close the dialog with a slight delay to show the result
    setTimeout(() => {
      handlePermissionDialogClose();
    }, 500);
  };

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      handlePermissionDialogClose();
    }, 300);
  };

  if (!showPermissionDialog) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="card max-w-md w-full mx-4 p-5 relative animate-in fade-in duration-300">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-800"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Bell size={32} className="text-purple-400" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-center mb-3">
          Enable Notifications
        </h2>

        <p className="text-sm text-slate-300 mb-4 text-center">
          Space Focus would like to send you notifications for:
        </p>

        <ul className="space-y-2 mb-5">
          <li className="flex items-start gap-2 text-sm">
            <Check size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
            <span>
              Reminders for your scheduled activities at the times you set
            </span>
          </li>
          <li className="flex items-start gap-2 text-sm">
            <Check size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
            <span>Notifications when your focus sessions are complete</span>
          </li>
          <li className="flex items-start gap-2 text-sm">
            <Check size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
            <span>Important updates about your productivity goals</span>
          </li>
        </ul>

        {permissionState === "denied" && (
          <div className="bg-yellow-500/20 p-3 rounded-lg mb-4 text-sm flex items-start gap-2">
            <AlertTriangle
              size={18}
              className="text-yellow-400 mt-0.5 flex-shrink-0"
            />
            <div>
              <p className="font-medium text-yellow-400">
                Notifications are blocked
              </p>
              <p className="text-slate-300">
                Please enable notifications in your browser settings to receive
                reminders.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 px-4 bg-slate-800 hover:bg-slate-700 rounded-full text-sm transition-colors"
          >
            Not Now
          </button>
          <button
            onClick={handleRequestPermission}
            className="flex-1 button-primary py-2 px-4 text-sm"
            disabled={permissionState === "denied"}
          >
            Enable Notifications
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-3">
          You can change this setting anytime in your app preferences.
        </p>
      </div>
    </div>
  );
}
