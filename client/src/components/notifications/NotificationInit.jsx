"use client";
import { useEffect, useRef, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell, X, AlertTriangle } from "lucide-react";

// Détecte le navigateur pour donner les bonnes instructions
const getBrowserInstructions = () => {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent;
  if (ua.includes("Chrome") && !ua.includes("Edg")) {
    return {
      browser: "Chrome",
      steps: 'Cliquez sur 🔒 dans la barre d\'adresse → "Autorisations du site" → Notifications → Autoriser',
    };
  }
  if (ua.includes("Firefox")) {
    return {
      browser: "Firefox",
      steps: 'Cliquez sur 🔒 dans la barre d\'adresse → "Connexion sécurisée" → Plus d\'informations → Permissions → Notifications → Autoriser',
    };
  }
  if (ua.includes("Edg")) {
    return {
      browser: "Edge",
      steps: 'Cliquez sur 🔒 dans la barre d\'adresse → Autorisations → Notifications → Autoriser',
    };
  }
  if (ua.includes("Safari")) {
    return {
      browser: "Safari",
      steps: "Safari → Préférences → Sites web → Notifications → Autoriser pour ce site",
    };
  }
  return {
    browser: null,
    steps: 'Cherchez l\'icône 🔒 dans la barre d\'adresse et autorisez les notifications pour ce site',
  };
};

export default function NotificationInit({ userId }) {
  const { permission, requestPermission } = useNotifications(userId);
  const initialized = useRef(false);
  const [tokenRegistered, setTokenRegistered] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeniedHelp, setShowDeniedHelp] = useState(false);

  // Sync avec le serveur
  useEffect(() => {
    if (!userId) return;
    const key = `notif_registered_${userId}`;
    const registered = localStorage.getItem(key) === "true";
    setTokenRegistered(registered);
    initialized.current = false;

    const syncWithServer = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/notifications/preferences/${userId}`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (!data.fcmTokens || data.fcmTokens.length === 0) {
            localStorage.setItem(key, "false");
            setTokenRegistered(false);
          }
        }
      } catch (err) {
        console.error("Erreur synchro statut notifications:", err);
      }
    };

    syncWithServer();
  }, [userId]);

  // Tentative silencieuse si permission déjà accordée
  useEffect(() => {
    if (!userId || initialized.current || tokenRegistered) return;
    const key = `notif_registered_${userId}`;
    if (localStorage.getItem(key) === "true") {
      setTokenRegistered(true);
      return;
    }
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      initialized.current = true;
      handleRegister(true);
    }
  }, [userId, tokenRegistered]);

  const handleRegister = async (silent = false) => {
    if (!userId) return;
    if (!silent) setLoading(true);
    try {
      await requestPermission();
      localStorage.setItem(`notif_registered_${userId}`, "true");
      setTokenRegistered(true);
    } catch (err) {
      console.error("Erreur activation notifications:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  if (!userId || tokenRegistered) return null;

  // ── Permission refusée : afficher l'aide pour débloquer ──
  const isDenied =
    typeof Notification !== "undefined" && Notification.permission === "denied";

  if (isDenied) {
    if (dismissed) return null;
    const info = getBrowserInstructions();

    return (
      <div className="mx-2 mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">
            <p className="font-medium mb-1">Notifications bloquées par le navigateur</p>
            <p className="text-red-700 leading-relaxed">{info?.steps}</p>
            <p className="mt-1 text-red-500">Puis rechargez la page.</p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 text-red-400 hover:text-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  // ── Permission non encore demandée ──
  if (dismissed) return null;

  return (
    <div className="mx-2 mb-2 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
      <Bell className="h-3.5 w-3.5 shrink-0 text-yellow-600" />
      <span className="flex-1">Activez les notifications pour rester informé</span>
      <button
        onClick={() => handleRegister(false)}
        disabled={loading}
        className="shrink-0 rounded bg-yellow-500 px-2 py-0.5 text-white hover:bg-yellow-600 disabled:opacity-50"
      >
        {loading ? "..." : "Activer"}
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-yellow-500 hover:text-yellow-700"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}