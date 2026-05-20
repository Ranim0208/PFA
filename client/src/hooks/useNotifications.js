"use client";
import { useEffect, useState } from "react";
import { getFirebaseMessaging, getToken, onMessage, getSwRegistration } from "@/lib/firebase";

const VAPID_KEY =
  "BCIULAekjyUlqzImnHpb0jVGCJYVCNi-nx5S-p-0nsXGbA52aTFJxQk1i_9knY6GdwEI2vpf5CGvIG5Ud60SeQU";

export const useNotifications = (userId) => {
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [token, setToken] = useState(null);

  // 1. Demande de permission + récupération + enregistrement du token FCM
  const requestPermission = async () => {
    try {
      console.log("🔔 requestPermission appelé pour userId:", userId);

      const perm = await Notification.requestPermission();
      setPermission(perm);
      console.log("🔔 Permission:", perm);

      if (perm !== "granted") {
        console.warn("⚠️  Permission refusée:", perm);
        return;
      }

      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        console.error("❌ Firebase Messaging non disponible (Service Worker manquant ?)");
        throw new Error("Firebase Messaging non disponible");
      }

      const registration = getSwRegistration();
      const fcmToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        ...(registration && { serviceWorkerRegistration: registration }),
      });

      console.log("🔔 FCM Token obtenu:", fcmToken ? fcmToken.substring(0, 30) + "..." : "null");

      if (!fcmToken) {
        console.error("❌ getToken a retourné null/undefined");
        throw new Error("Token FCM non obtenu");
      }

      if (!userId) {
        console.error("❌ userId est vide — impossible d'enregistrer le token");
        throw new Error("userId manquant");
      }

      setToken(fcmToken);

      // Enregistrement côté serveur
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log("📡 Envoi token à:", `${apiUrl}/notifications/register-token`);
      console.log("📡 userId envoyé:", userId);

      const response = await fetch(`${apiUrl}/notifications/register-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, token: fcmToken, device: "web" }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("❌ Erreur serveur register-token:", errText);
        throw new Error(`Serveur: ${errText}`);
      }

      console.log("✅ FCM Token web enregistré avec succès pour userId:", userId);
    } catch (error) {
      console.error("❌ Erreur requestPermission:", error);
      throw error; // re-throw pour que NotificationInit puisse le détecter
    }
  };

  // 2. Foreground : reçoit les notifs quand l'app est ouverte
  useEffect(() => {
    if (!userId) return;

    let unsubscribe;

    const setup = async () => {
      const messaging = await getFirebaseMessaging();
      if (!messaging) return;

      unsubscribe = onMessage(messaging, (payload) => {
        console.log("📬 Notification foreground reçue:", payload);
        if (payload.notification) {
          window.dispatchEvent(
            new CustomEvent("show-notification", {
              detail: {
                title: payload.notification.title,
                body: payload.notification.body,
                eventType: payload.data?.eventType,
              },
            })
          );
        }
      });
    };

    setup();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  // 3. Background : reçoit les notifs cliquées depuis le SW
  useEffect(() => {
    if (!userId) return;

    const handler = (event) => {
      if (event.data?.type === "NOTIFICATION_CLICKED") {
        console.log("📬 Notif background cliquée:", event.data.payload);
        window.dispatchEvent(
          new CustomEvent("show-notification", {
            detail: {
              title: event.data.payload.title,
              body: event.data.payload.body,
              eventType: event.data.payload.eventType,
            },
          })
        );
      }
    };

    navigator.serviceWorker?.addEventListener("message", handler);
    return () => navigator.serviceWorker?.removeEventListener("message", handler);
  }, [userId]);

  return { permission, token, requestPermission };
};