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

  router.get("/monthly-goal", authMiddleware, async (req, res) => {
    try {
      const DEFAULT_MONTHLY_TARGET = 6000;
      const offset = Number.isFinite(Number(req.query.offset))
        ? Math.max(0, Number(req.query.offset))
        : 0;

      const { rows: userRows } = await pool.query(
        `SELECT preferences FROM users WHERE id = $1`,
        [req.user.id]
      );
      let activityLevel = "medium";
      if (userRows?.[0]?.preferences) {
        try {
          const prefs =
            typeof userRows[0].preferences === "string"
              ? JSON.parse(userRows[0].preferences)
              : userRows[0].preferences;
          activityLevel = prefs?.metrics?.activityLevel || "medium";
        } catch (error) {
          activityLevel = "medium";
        }
      }
      const activityBaseline =
        activityLevel === "low"
          ? 3000
          : activityLevel === "high"
            ? 9000
            : DEFAULT_MONTHLY_TARGET;
      const result = await pool.query(
        `
        SELECT
          DATE_TRUNC('month', w.start_time) AS month,
          COALESCE(SUM(wa.points_earned), 0) AS points
        FROM workouts w
        LEFT JOIN workout_activities wa ON w.id = wa.workout_id
        WHERE w.user_id = $1
          AND w.start_time >= DATE_TRUNC('month', NOW()) - INTERVAL '12 months'
        GROUP BY 1
        ORDER BY month DESC
        `,
        [req.user.id]
      );

      const rows = result.rows || [];
      const monthKey = (date) =>
        new Date(date).toISOString().slice(0, 7);
      const targetMonthDate = new Date();
      targetMonthDate.setMonth(targetMonthDate.getMonth() - offset);
      const targetMonthKey = monthKey(targetMonthDate);

      const currentRow = rows.find(
        (row) => monthKey(row.month) === targetMonthKey
      );
      const currentPoints = Number(currentRow?.points ?? 0);

      const pastRows = rows
        .filter((row) => monthKey(row.month) < targetMonthKey)
        .slice(0, 3);
      const pastPoints = pastRows.map((row) => Number(row.points ?? 0));
      const lastMonthPoints = pastPoints[0] ?? 0;

      const avg =
        pastPoints.length > 0
          ? pastPoints.reduce((sum, value) => sum + value, 0) / pastPoints.length
          : lastMonthPoints || activityBaseline;

      let target = avg > 0 ? avg : activityBaseline;
      if (lastMonthPoints > 0) {
        const min = lastMonthPoints * 0.8;
        const max = lastMonthPoints * 1.2;
        target = Math.min(max, Math.max(min, target));
      }

      target = Math.round(target);
      if (!Number.isFinite(target) || target <= 0) {
        target = activityBaseline;
      }

      res.json({
        currentPoints,
        target,
        lastMonthPoints,
        averagePoints: Math.round(avg),
        month: targetMonthKey,
        activityLevel,
      });
    } catch (error) {
      console.error("Monthly goal error:", error);
      res.status(500).json({
        error: "Serverfehler beim Laden des Monatsziels.",
      });
    }
  });

  return router;
};
