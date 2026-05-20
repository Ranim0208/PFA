importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyCswUXOdTPJf21xdFHBRrntoxuk3dwOUDA",
  authDomain: "tacir-app.firebaseapp.com",
  projectId: "tacir-app",
  storageBucket: "tacir-app.firebasestorage.app",
  messagingSenderId: "599404203008",
  appId: "1:599404203008:web:c352e3970729dd9da15ce5",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("📬 Notification background:", payload);
  const { title, body } = payload.notification;

  // Stocke le payload complet dans data pour le récupérer au clic
  return self.registration.showNotification(title, {
    body,
    icon: "/images/tacir-logo.png",
    data: {
      ...payload.data,
      title,
      body,
    },
  });
});

// ← NOUVEAU : au clic sur la notif Windows, envoie au panneau in-app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Envoie le payload à tous les onglets ouverts
        clientList.forEach((client) => {
          client.postMessage({
            type: "NOTIFICATION_CLICKED",
            payload: event.notification.data,
          });
        });

        // Si aucun onglet ouvert, ouvre l'app
        if (clientList.length === 0) {
          clients.openWindow("/");
        }
      }),
  );
});
