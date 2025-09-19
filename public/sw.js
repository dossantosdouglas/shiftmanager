// Service Worker for handling push notifications
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: "/icon-192x192.png", // You can add this icon later
      badge: "/badge-72x72.png", // You can add this badge later
      tag: "shift-cancellation",
      requireInteraction: true,
      actions: [
        {
          action: "view",
          title: "View Details",
          icon: "/action-view.png",
        },
        {
          action: "dismiss",
          title: "Dismiss",
          icon: "/action-dismiss.png",
        },
      ],
      data: {
        url: "/",
        shiftId: data.shiftId,
        employeeName: data.employeeName,
      },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Handle notification click events
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "view") {
    event.waitUntil(clients.openWindow("/"));
  } else if (event.action === "dismiss") {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow("/"));
  }
});

// Handle background sync (for offline scenarios)
self.addEventListener("sync", function (event) {
  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle any background sync tasks if needed
      Promise.resolve()
    );
  }
});
