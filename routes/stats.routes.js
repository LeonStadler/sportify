import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getAnalyticsForPeriod } from "../services/analytics/analyticsService.js";
import { getOverviewStats } from "../services/analytics/overviewService.js";

export const createStatsRouter = (pool) => {
  const router = express.Router();

  // PUBLIC: Öffentliche Statistiken für Landing-Page (keine Authentifizierung)
  router.get("/public", async (req, res) => {
    try {
      // Anzahl der Benutzer (alle registrierten Benutzer)
      const usersResult = await pool.query(`
        SELECT COUNT(*) as total_users 
        FROM users
      `);

      // Gesamtzahl der getrackten Übungen und Wiederholungen aus workout_activities
      const activitiesResult = await pool.query(`
        SELECT 
          COUNT(*) as total_exercises,
          COALESCE(SUM(quantity), 0) as total_reps
        FROM workout_activities
      `);

      const totalUsers = parseInt(usersResult.rows[0]?.total_users || "0", 10);
      const totalExercises = parseInt(
        activitiesResult.rows[0]?.total_exercises || "0",
        10
      );
      const totalReps = Math.round(
        parseFloat(activitiesResult.rows[0]?.total_reps || "0")
      );

      res.json({
        users: totalUsers,
        exercises: totalExercises,
        reps: totalReps,
        free: 100, // 100% kostenlos
      });
    } catch (error) {
      console.error("Public stats error:", error);
      res.status(500).json({
        error: "Serverfehler beim Laden der öffentlichen Statistiken.",
        // Fallback-Werte bei Fehler
        users: 0,
        exercises: 0,
        reps: 0,
        free: 100,
      });
    }
  });

  router.get("/", authMiddleware, async (req, res) => {
    try {
      const requestedPeriod =
        typeof req.query.period === "string" ? req.query.period : "week";
      const stats = await getOverviewStats(pool, req.user.id, requestedPeriod);
      res.json(stats);
    } catch (error) {
      console.error("Stats error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Laden der Statistiken." });
    }
  });

  router.get("/analytics", authMiddleware, async (req, res) => {
    try {
      const requestedPeriod =
        typeof req.query.period === "string" ? req.query.period : "week";
      const startDate =
        typeof req.query.start === "string" ? req.query.start : undefined;
      const endDate =
        typeof req.query.end === "string" ? req.query.end : undefined;

      const analytics = await getAnalyticsForPeriod(
        pool,
        req.user.id,
        requestedPeriod,
        { startDate, endDate }
      );
      res.json(analytics);
    } catch (error) {
      console.error("Analytics stats error:", error);
      const message = error.message?.includes("Invalid custom date range")
        ? "Ungültiger Datumsbereich für Analytics."
        : "Serverfehler beim Laden der Analytics-Daten.";
      res.status(500).json({ error: message });
    }
  });

  return router;
};
