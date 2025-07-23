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
      event.waitUntil(
        self.registration.showNotification(notificationData.title, options)
      );
    } catch (error) {
      // If JSON parsing fails, treat as plain text
      console.log("Treating as plain text message");
      const textMessage = event.data.text();
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
      event.waitUntil(
        self.registration.showNotification("Expense Tracker", options)
      );
    }
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
  event.waitUntil(clients.openWindow("https://localhost:3001"));
});
