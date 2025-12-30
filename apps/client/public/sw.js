self.addEventListener("push", (event) => {
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      data: { link: data.link },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  clients.openWindow(event.notification.data.link || "/");
});
