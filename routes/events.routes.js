import express from "express";
import { processEmailQueue } from "../services/emailQueueService.js";
import { verifySummaryUnsubscribeToken } from "../services/emailPreferencesService.js";
import {
  processMonthlyEvents,
  processWeeklyEvents,
} from "../services/eventService.js";
import { cleanupStuckJobs } from "../services/jobCleanupService.js";
import { getFrontendUrl } from "../utils/helpers.js";

const verifyCronRequest = (req) => {
  const cronSecret = process.env.EVENTS_CRON_SECRET || process.env.CRON_SECRET;
  if (!cronSecret) {
    return true;
  }
  const authorization = req.headers["authorization"] || "";
  if (authorization.startsWith("Bearer ")) {
    const token = authorization.slice(7);
    return token === cronSecret;
  }
  if (req.query?.secret) {
    return req.query.secret === cronSecret;
  }
  return false;
};

export const createEventsRouter = (pool) => {
  const router = express.Router();

  const parsePreferences = (value) => {
    if (!value) return {};
    if (typeof value === "object" && !Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? parsed
          : {};
      } catch (_error) {
        return {};
      }
    }
    return {};
  };

  const renderUnsubscribePage = (
    res,
    {
      status = 200,
      title = "Abgemeldet",
      message = "Du wirst keine Zusammenfassungs-E-Mails mehr erhalten.",
      actionLabel = "Zu Sportify",
      actionUrl = "/",
    } = {}
  ) => {
    const escapeHtml = (value) =>
      String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

    const safeTitle = escapeHtml(title);
    const safeMessage = escapeHtml(message);
    const safeActionLabel = escapeHtml(actionLabel);
    const safeActionUrl = escapeHtml(actionUrl);

    return res.status(status).send(`<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Sportify · E-Mail-Einstellungen</title>
    <style>
      body { margin: 0; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; background: #0b1220; color: #f8fafc; }
      .wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
      .card { width: 100%; max-width: 560px; background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 28px; text-align: center; }
      h1 { margin: 0 0 12px; font-size: 28px; line-height: 1.2; }
      p { margin: 0; color: #cbd5e1; line-height: 1.6; }
      .btn { display: inline-block; margin-top: 22px; padding: 12px 18px; border-radius: 10px; background: #f97316; color: #ffffff; text-decoration: none; font-weight: 600; }
      .btn:hover { background: #ea580c; }
    </style>
  </head>
  <body>
    <main class="wrap">
      <section class="card">
        <h1>${safeTitle}</h1>
        <p>${safeMessage}</p>
        <a class="btn" href="${safeActionUrl}">${safeActionLabel}</a>
      </section>
    </main>
  </body>
</html>`);
  };

  router.get("/emails/unsubscribe", async (req, res) => {
    try {
      const token =
        typeof req.query?.token === "string" ? req.query.token : null;
      if (!token) {
        return renderUnsubscribePage(res, {
          status: 400,
          title: "Link ungueltig",
          message:
            "Der Abmeldelink ist ungueltig oder unvollstaendig. Bitte pruefe die E-Mail.",
          actionLabel: "Zu deinen Einstellungen",
          actionUrl: `${getFrontendUrl(req)}/profile`,
        });
      }

      const { userId } = verifySummaryUnsubscribeToken(token);
      const { rows } = await pool.query(
        `SELECT id, preferences FROM users WHERE id = $1`,
        [userId]
      );

      if (!rows.length) {
        return renderUnsubscribePage(res, {
          status: 404,
          title: "Benutzer nicht gefunden",
          message:
            "Zu diesem Link konnte kein Benutzerkonto gefunden werden.",
          actionLabel: "Zur Startseite",
          actionUrl: getFrontendUrl(req),
        });
      }

      const preferences = parsePreferences(rows[0].preferences);
      const currentNotifications =
        preferences.notifications &&
        typeof preferences.notifications === "object" &&
        !Array.isArray(preferences.notifications)
          ? preferences.notifications
          : {};

      const updatedPreferences = {
        ...preferences,
        notifications: {
          ...currentNotifications,
          email: false,
        },
      };

      await pool.query(
        `UPDATE users
         SET preferences = $2::jsonb,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [userId, JSON.stringify(updatedPreferences)]
      );

      return renderUnsubscribePage(res, {
        status: 200,
        title: "Erfolgreich abgemeldet",
        message:
          "Du erhaeltst ab jetzt keine woechentlichen oder monatlichen Zusammenfassungs-E-Mails mehr.",
        actionLabel: "Einstellungen oeffnen",
        actionUrl: `${getFrontendUrl(req)}/profile`,
      });
    } catch (error) {
      return renderUnsubscribePage(res, {
        status: 400,
        title: "Link abgelaufen",
        message:
          "Der Abmeldelink ist abgelaufen oder ungueltig. Fordere einfach die naechste E-Mail an.",
        actionLabel: "Zu deinen Einstellungen",
        actionUrl: `${getFrontendUrl(req)}/profile`,
      });
    }
  });

  router.post("/weekly", async (req, res) => {
    if (!verifyCronRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const result = await processWeeklyEvents(pool, {
        force: req.query.force === "true" || req.body?.force === true,
      });
      res.json({ status: "ok", ...result });
    } catch (error) {
      console.error("Weekly events processing failed:", error);
      res.status(500).json({
        error: "Failed to process weekly events",
        details: error.message,
      });
    }
  });

  router.post("/monthly", async (req, res) => {
    if (!verifyCronRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const result = await processMonthlyEvents(pool, {
        force: req.query.force === "true" || req.body?.force === true,
      });
      res.json({ status: "ok", ...result });
    } catch (error) {
      console.error("Monthly events processing failed:", error);
      res.status(500).json({
        error: "Failed to process monthly events",
        details: error.message,
      });
    }
  });

  router.post("/emails/dispatch", async (req, res) => {
    if (!verifyCronRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const result = await processEmailQueue(pool, {
        limit: Number(req.query.limit) || 25,
      });
      res.json({ status: "ok", ...result });
    } catch (error) {
      console.error("Email dispatch failed:", error);
      res.status(500).json({
        error: "Failed to process email queue",
        details: error.message,
      });
    }
  });

  router.post("/cleanup", async (req, res) => {
    if (!verifyCronRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const result = await cleanupStuckJobs(pool);
      res.json({ status: "ok", ...result });
    } catch (error) {
      console.error("Job cleanup failed:", error);
      res.status(500).json({
        error: "Failed to cleanup stuck jobs",
        details: error.message,
      });
    }
  });

  return router;
};
