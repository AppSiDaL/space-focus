// Service Worker para manejar notificaciones push

self.addEventListener("push", (event) => {
    if (event.data) {
      const data = event.data.json()
      const options = {
        body: data.body,
        icon: data.icon || "/icon.png",
        badge: "/badge.png",
        vibrate: [100, 50, 100, 50, 100],
        data: data.data || {},
        actions: [
          {
            action: "close",
            title: "Cerrar",
          },
        ],
      }
  
      event.waitUntil(self.registration.showNotification(data.title, options))
    }
  })
  
  self.addEventListener("notificationclick", (event) => {
    event.notification.close()
  
    if (event.action === "close") {
      return
    }
  
    // Abrir la aplicación cuando se hace clic en la notificación
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url === "/" && "focus" in client) {
            return client.focus()
          }
        }
  
        // Si no hay ventanas abiertas, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow("/")
        }
      }),
    )
  })
  
  // Evento de instalación del service worker
  self.addEventListener("install", (event) => {
    self.skipWaiting()
  })
  
  // Evento de activación del service worker
  self.addEventListener("activate", (event) => {
    event.waitUntil(clients.claim())
  })
  