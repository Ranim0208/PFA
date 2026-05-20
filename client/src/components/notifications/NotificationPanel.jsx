"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCheck, Trash2, BellOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getFirebaseMessaging, onMessage } from "@/lib/firebase";

const API = process.env.NEXT_PUBLIC_API_URL;

const EVENT_COLORS = {
  creathon: { bg: "bg-pink-100", text: "text-pink-600", dot: "bg-pink-500" },
  formation: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    dot: "bg-purple-500",
  },
  bootcamp: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    dot: "bg-orange-500",
  },
  mentorat: { bg: "bg-cyan-100", text: "text-cyan-600", dot: "bg-cyan-500" },
  mentoring: { bg: "bg-cyan-100", text: "text-cyan-600", dot: "bg-cyan-500" },
  default: { bg: "bg-blue-100", text: "text-blue-600", dot: "bg-blue-500" },
};

const EVENT_LABELS = {
  creathon: "Créathon",
  formation: "Formation",
  bootcamp: "Bootcamp",
  mentorat: "Mentorat",
  mentoring: "Mentorat",
};

const getBrowserUnblockHint = () => {
  if (typeof window === "undefined") return "";
  const ua = navigator.userAgent;
  if (ua.includes("Chrome") && !ua.includes("Edg"))
    return "Cliquez sur 🔒 dans la barre d'adresse → Autorisations du site → Notifications → Autoriser, puis rechargez.";
  if (ua.includes("Firefox"))
    return "Cliquez sur 🔒 → Plus d'informations → Permissions → Notifications → Autoriser, puis rechargez.";
  if (ua.includes("Edg"))
    return "Cliquez sur 🔒 → Autorisations → Notifications → Autoriser, puis rechargez.";
  return "Autorisez les notifications pour ce site dans les paramètres de votre navigateur, puis rechargez.";
};

export default function NotificationPanel({ userId }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifPermission, setNotifPermission] = useState("default");
  const panelRef = useRef(null);

  useEffect(() => {
    if (typeof Notification !== "undefined")
      setNotifPermission(Notification.permission);
  }, []);

  // ── Charger l'historique depuis l'API au montage ──
  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const res = await fetch(`${API}/notifications/history/${userId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Erreur chargement historique notifications:", err);
      }
    };
    load();
  }, [userId]);

  const addNotif = (newNotif) => {
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // ── Foreground FCM ──
  useEffect(() => {
    if (!userId || notifPermission !== "granted") return;
    let unsubscribe;
    const setup = async () => {
      const messaging = await getFirebaseMessaging();
      if (!messaging) return;
      unsubscribe = onMessage(messaging, (payload) => {
        console.log("📬 [Panel] Notification foreground:", payload);
        const { title, body } = payload.notification || {};
        const eventType = payload.data?.eventType;
        // La notification est déjà sauvée en BDD côté serveur,
        // on rafraîchit juste la liste pour récupérer l'_id MongoDB
        if (title) {
          fetch(`${API}/notifications/history/${userId}`, {
            credentials: "include",
          })
            .then((r) => r.json())
            .then(setNotifications)
            .catch(() => {});
        }
      });
    };
    setup();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId, notifPermission]);

  // ── Background SW click ──
  useEffect(() => {
    if (!userId) return;
    const handler = (event) => {
      if (event.data?.type === "NOTIFICATION_CLICKED") {
        fetch(`${API}/notifications/history/${userId}`, {
          credentials: "include",
        })
          .then((r) => r.json())
          .then(setNotifications)
          .catch(() => {});
      }
    };
    navigator.serviceWorker?.addEventListener("message", handler);
    return () =>
      navigator.serviceWorker?.removeEventListener("message", handler);
  }, [userId]);

  // Fermer en cliquant dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (notif) => {
    if (notif.isRead) return;
    setNotifications((prev) =>
      prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n)),
    );
    try {
      await fetch(`${API}/notifications/${notif._id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
    } catch {}
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch(`${API}/notifications/history/${userId}/read-all`, {
        method: "PATCH",
        credentials: "include",
      });
    } catch {}
  };

  const deleteNotif = async (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await fetch(`${API}/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {}
  };

  const clearAll = async () => {
    setNotifications([]);
    try {
      await fetch(`${API}/notifications/history/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const isDenied = notifPermission === "denied";

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        title={
          isDenied
            ? "Notifications bloquées — cliquez pour voir comment les activer"
            : "Notifications"
        }
        className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-sidebar-accent transition-colors"
      >
        {isDenied ? (
          <BellOff className="h-5 w-5 text-red-400" />
        ) : (
          <Bell className="h-5 w-5 text-muted-foreground" />
        )}
        {isDenied && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-white bg-red-500 rounded-full text-[9px] font-bold">
            !
          </span>
        )}
        {!isDenied && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-pink-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-full ml-2 bottom-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-purple-600" />
              <span className="font-semibold text-gray-800">Notifications</span>
              {!isDenied && unreadCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-pink-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {!isDenied && unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-purple-600 transition-colors"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors"
                  title="Tout supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {isDenied && (
            <div className="px-4 py-3 bg-red-50 border-b border-red-100 text-xs text-red-700">
              <p className="font-semibold mb-1">
                🔕 Notifications bloquées par le navigateur
              </p>
              <p className="leading-relaxed text-red-600">
                {getBrowserUnblockHint()}
              </p>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Bell className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const colors =
                  EVENT_COLORS[notif.eventType] || EVENT_COLORS.default;
                return (
                  <div
                    key={notif._id}
                    className={`relative flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group ${!notif.isRead ? "bg-purple-50/30" : ""}`}
                    onClick={() => markAsRead(notif)}
                  >
                    <div
                      className={`flex-shrink-0 w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center mt-0.5`}
                    >
                      <Bell className={`h-4 w-4 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm leading-tight ${!notif.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}
                        >
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span
                            className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${colors.dot}`}
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {notif.body}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {notif.eventType && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} font-medium`}
                          >
                            {EVENT_LABELS[notif.eventType] || notif.eventType}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notif.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotif(notif._id);
                      }}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
