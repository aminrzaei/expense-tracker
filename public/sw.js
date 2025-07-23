self.addEventListener("push", function (event) {
  console.log("Push event received:", event);

  if (event.data) {
    let notificationData;
    let options;

    try {
      // Try to parse as JSON first
      notificationData = event.data.json();
      options = {
        body: notificationData.body,
        icon: notificationData.icon || "/icon-192x192.png",
        badge: notificationData.badge || "/icon-192x192.png",
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: "2",
        },
      };
    } catch (error) {
      // If JSON parsing fails, treat as plain text
      console.log("Treating as plain text message");
      const textMessage = event.data.text();
      notificationData = {
        title: "Expense Tracker",
        body: textMessage,
      };
      options = {
        body: textMessage,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: "1",
        },
      };
    }

    // Send message to all clients (for in-app notifications)
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "PUSH_RECEIVED",
            notification: notificationData,
          });
        });
      })
    );

    // Show system notification
    event.waitUntil(
      self.registration.showNotification(
        notificationData.title || "Expense Tracker",
        options
      )
    );
  } else {
    // No data, show default notification
    const defaultOptions = {
      body: "You have a new notification",
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
    };
    event.waitUntil(
      self.registration.showNotification("Expense Tracker", defaultOptions)
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received.");
  event.notification.close();

  // Open the app or focus existing window
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      // Check if there's already a window/tab open with the target URL
      for (let client of clients) {
        if (client.url === self.registration.scope && "focus" in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    })
  );
});

// Add install event for PWA
self.addEventListener("install", function (event) {
  console.log("Service Worker: Install");
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Add activate event for PWA
self.addEventListener("activate", function (event) {
  console.log("Service Worker: Activate");
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

// Add basic caching for PWA functionality
self.addEventListener("fetch", function (event) {
  // Only cache GET requests
  if (event.request.method !== "GET") return;

  // Cache strategy: Network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Open the cache and store the response
        caches.open("expense-tracker-v1").then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // If network fails, try to return from cache
        return caches.match(event.request);
      })
  );
});
