import { randomUUID } from "crypto";
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createNotification as createNotificationService,
  getPushPublicKey,
  listNotifications,
  markNotificationsRead,
  removePushSubscription,
  upsertPushSubscription,
} from "../services/notificationService.js";

const VERSION_UPDATE_TYPE = "app-version-update";

export const createNotificationsRouter = (pool) => {
  const router = express.Router();

  // Helper function to create notification
  const createNotification = async (
    userId,
    type,
    relatedUserId,
    metadata = {}
  ) => {
    try {
      const notificationId = randomUUID();
      await pool.query(
        `INSERT INTO notifications (id, user_id, type, related_user_id, metadata)
                 VALUES ($1, $2, $3, $4, $5)`,
        [notificationId, userId, type, relatedUserId, JSON.stringify(metadata)]
      );
      return notificationId;
    } catch (error) {
      console.error("Error creating notification:", error);
      // Don't throw - notifications are not critical
      return null;
    }
  };

  // GET /api/notifications - Get user notifications
  router.get("/", authMiddleware, async (req, res) => {
    try {
      const notifications = await listNotifications(pool, req.user.id, {
        limit: 100,
      });
      const payload = notifications.map((notification) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        payload: notification.payload,
        isRead: Boolean(notification.readAt),
        createdAt: notification.createdAt,
        // Include related user info if available
        firstName: notification.firstName,
        lastName: notification.lastName,
        nickname: notification.nickname,
        avatarUrl: notification.avatarUrl,
      }));
      res.json(payload);
    } catch (error) {
      console.error("Get notifications error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Laden der Benachrichtigungen." });
    }
  });

  // POST /api/notifications/version-update - Create in-app + push for new app version (client calls when it detects new version)
  router.post("/version-update", authMiddleware, async (req, res) => {
    try {
      const { version, title, message } = req.body || {};
      if (!version || !title || !message) {
        return res.status(400).json({
          error: "version, title und message sind erforderlich.",
        });
      }
      const versionStr = String(version).slice(0, 32);
      const { rows: existing } = await pool.query(
        `SELECT id FROM notifications
         WHERE user_id = $1 AND type = $2 AND payload->>'version' = $3
         LIMIT 1`,
        [req.user.id, VERSION_UPDATE_TYPE, versionStr]
      );
      if (existing.length > 0) {
        return res.status(201).json({ message: "Benachrichtigung bereits vorhanden." });
      }
      await createNotificationService(pool, {
        userId: req.user.id,
        type: VERSION_UPDATE_TYPE,
        title: String(title).slice(0, 255),
        message: String(message).slice(0, 500),
        payload: { path: "/changelog", version: versionStr },
      });
      res.status(201).json({ message: "Benachrichtigung erstellt." });
    } catch (error) {
      console.error("Version-update notification error:", error);
      res.status(500).json({
        error: "Serverfehler beim Erstellen der Benachrichtigung.",
      });
    }
  });

  // POST /api/notifications/mark-read - Mark all notifications as read
  router.post("/mark-read", authMiddleware, async (req, res) => {
    try {
      await markNotificationsRead(pool, req.user.id);
      res.json({
        message: "Alle Benachrichtigungen wurden als gelesen markiert.",
      });
    } catch (error) {
      console.error("Mark notifications as read error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Markieren der Benachrichtigungen." });
    }
  });

  // GET /api/notifications/public-key - Get VAPID public key for push notifications
  router.get("/public-key", authMiddleware, (req, res) => {
    const publicKey = getPushPublicKey();
    res.json({ publicKey, enabled: Boolean(publicKey) });
  });

  // POST /api/notifications/subscriptions - Save push subscription
  router.post("/subscriptions", authMiddleware, async (req, res) => {
    try {
      await upsertPushSubscription(pool, req.user.id, req.body);
      res.status(201).json({ message: "Push subscription gespeichert." });
    } catch (error) {
      console.error("Save push subscription error:", error);
      res
        .status(400)
        .json({ error: error.message || "Ungültiges Subscription-Objekt." });
    }
  });

  // DELETE /api/notifications/subscriptions - Remove push subscription
  router.delete("/subscriptions", authMiddleware, async (req, res) => {
    try {
      const { endpoint } = req.body || {};
      if (!endpoint) {
        return res.status(400).json({ error: "Endpoint ist erforderlich." });
      }
      await removePushSubscription(pool, req.user.id, endpoint);
      res.status(204).send();
    } catch (error) {
      console.error("Remove push subscription error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Entfernen der Subscription." });
    }
  });

  // Export helper function for use in other routes
  router.createNotification = createNotification;

  return router;
};
