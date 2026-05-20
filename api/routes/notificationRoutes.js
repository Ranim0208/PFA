import express from "express";
import NotificationPreference from "../models/NotificationPreference.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import admin from "../config/firebase.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────
// Enregistrer / mettre à jour le token FCM d'un appareil
// ─────────────────────────────────────────────────────────
router.post("/register-token", async (req, res) => {
  const { userId, token, device } = req.body;

  console.log("📱 ===== REGISTER TOKEN =====");
  console.log("📱 userId reçu:", userId);
  console.log("📱 device:", device);
  console.log("📱 token (20 premiers chars):", token?.substring(0, 20));

  if (!userId || !token) {
    console.warn("⚠️  register-token: userId ou token manquant");
    return res.status(400).json({ error: "userId et token requis" });
  }

  try {
    // Supprimer ce token de TOUS les autres utilisateurs
    await NotificationPreference.updateMany(
      { "fcmTokens.token": token },
      { $pull: { fcmTokens: { token: token } } },
    );

    let pref = await NotificationPreference.findOne({ user: userId });
    console.log(
      "📱 Préférence existante:",
      pref ? `oui (${pref.fcmTokens.length} tokens)` : "non",
    );

    if (!pref) {
      pref = new NotificationPreference({
        user: userId,
        fcmTokens: [],
        enabled: true,
      });
      console.log("📱 Nouvelle NotificationPreference créée pour:", userId);
    }

    // Éviter les doublons
    const exists = pref.fcmTokens.find((t) => t.token === token);
    if (!exists) {
      pref.fcmTokens.push({ token, device });
      console.log("📱 Token ajouté. Total tokens:", pref.fcmTokens.length);
    } else {
      console.log("📱 Token déjà existant, pas de doublon");
    }

    await pref.save();
    console.log("✅ NotificationPreference sauvegardée pour userId:", userId);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur register-token:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// Mettre à jour les préférences
// ─────────────────────────────────────────────────────────
router.put("/preferences/:userId", async (req, res) => {
  const { reminders, weekBefore, threeDaysBefore, dayBefore, enabled } =
    req.body;
  try {
    const pref = await NotificationPreference.findOneAndUpdate(
      { user: req.params.userId },
      {
        preferences: { reminders, weekBefore, threeDaysBefore, dayBefore },
        enabled,
      },
      { new: true, upsert: true },
    );
    res.json({ success: true, pref });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// Récupérer les préférences
// ─────────────────────────────────────────────────────────
router.get("/preferences/:userId", async (req, res) => {
  try {
    const pref = await NotificationPreference.findOne({
      user: req.params.userId,
    });
    res.json(
      pref || {
        fcmTokens: [],
        preferences: {
          reminders: [{ value: 1, unit: "days" }],
          weekBefore: true,
          threeDaysBefore: true,
          dayBefore: true,
        },
        enabled: true,
      },
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// DEBUG : état des tokens pour tous les users
// GET /notifications/debug/tokens
// ─────────────────────────────────────────────────────────
router.get("/debug/tokens", async (req, res) => {
  try {
    const allUsers = await User.find({ isArchived: false }).select(
      "firstName lastName email roles isConfirmed",
    );

    const allPrefs = await NotificationPreference.find({});
    const prefByUser = {};
    allPrefs.forEach((p) => {
      prefByUser[p.user.toString()] = {
        enabled: p.enabled,
        tokenCount: p.fcmTokens.length,
        tokens: p.fcmTokens.map((t) => ({
          device: t.device,
          token: t.token?.substring(0, 30) + "...",
        })),
      };
    });

    const result = allUsers.map((u) => ({
      id: u._id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      roles: u.roles,
      isConfirmed: u.isConfirmed,
      notifPref: prefByUser[u._id.toString()] || "❌ AUCUNE PRÉFÉRENCE",
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// DEBUG : envoyer une notification de test à un userId
// POST /notifications/debug/test-send
// Body: { userId, title, body }
// ─────────────────────────────────────────────────────────
router.post("/debug/test-send", async (req, res) => {
  const { userId, title = "🔔 Test", body = "Notification de test" } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId requis" });
  }

  try {
    const pref = await NotificationPreference.findOne({ user: userId });

    if (!pref) {
      return res.json({
        success: false,
        reason: "Aucune NotificationPreference pour cet utilisateur",
        userId,
      });
    }

    if (!pref.enabled) {
      return res.json({
        success: false,
        reason: "Notifications désactivées pour cet utilisateur",
        userId,
      });
    }

    const tokens = pref.fcmTokens.map((t) => t.token).filter(Boolean);

    if (!tokens.length) {
      return res.json({
        success: false,
        reason: "Aucun token FCM enregistré pour cet utilisateur",
        userId,
      });
    }

    const message = {
      notification: { title, body },
      data: { eventType: "creathon", test: "true" },
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    res.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      tokens: tokens.map((t) => t.substring(0, 30) + "..."),
      errors: response.responses
        .filter((r) => !r.success)
        .map((r) => r.error?.message),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// Historique : charger les notifications d'un user (au login)
// GET /notifications/history/:userId?limit=50&skip=0
// ─────────────────────────────────────────────────────────
router.get("/history/:userId", async (req, res) => {
  const { limit = 50, skip = 0 } = req.query;
  try {
    const notifications = await Notification.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .lean();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// Marquer une notification comme lue
// PATCH /notifications/:notifId/read
// ─────────────────────────────────────────────────────────
router.patch("/:notifId/read", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.notifId, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// Marquer toutes les notifications d'un user comme lues
// PATCH /notifications/history/:userId/read-all
// ─────────────────────────────────────────────────────────
router.patch("/history/:userId/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.params.userId },
      { isRead: true },
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// Supprimer une notification
// DELETE /notifications/:notifId
// ─────────────────────────────────────────────────────────
router.delete("/:notifId", async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.notifId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// Supprimer toutes les notifications d'un user
// DELETE /notifications/history/:userId
// ─────────────────────────────────────────────────────────
router.delete("/history/:userId", async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.params.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
