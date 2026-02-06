import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  applyDisplayName,
  extractSearchTerm,
  parsePaginationParams,
  toCamelCase,
} from "../utils/helpers.js";

export const createUsersRouter = (pool) => {
  const router = express.Router();

  router.get("/search", authMiddleware, async (req, res) => {
    try {
      const { query = "", page = "1", limit = "10" } = req.query;
      const trimmedQuery = String(query).trim();

      if (trimmedQuery.length < 2) {
        return res.json([]);
      }

      const { page: currentPage, limit: pageSize } = parsePaginationParams(
        page,
        limit
      );
      const searchTerm = extractSearchTerm(trimmedQuery);

      if (!searchTerm) {
        return res.json([]);
      }

      // Exclude: current user, existing friends, and users with pending requests
      const searchQuery = `
                SELECT
                    u.id,
                    u.email,
                    u.first_name,
                    u.last_name,
                    u.nickname,
                    u.display_preference,
                    u.avatar_url
                FROM users u
                WHERE (
                    u.first_name ILIKE $1
                    OR u.last_name ILIKE $1
                    OR u.nickname ILIKE $1
                    OR u.email ILIKE $1
                )
                AND u.id != $2
                AND COALESCE((u.preferences->'privacy'->>'publicProfile')::boolean, true) = true
                -- Exclude existing friends
                AND NOT EXISTS (
                    SELECT 1 FROM friendships f
                    WHERE f.status = 'accepted'
                    AND ((f.requester_id = $2 AND f.addressee_id = u.id)
                         OR (f.requester_id = u.id AND f.addressee_id = $2))
                )
                -- Exclude users with pending friend requests (both directions)
                AND NOT EXISTS (
                    SELECT 1 FROM friend_requests fr
                    WHERE fr.status = 'pending'
                    AND ((fr.requester_id = $2 AND fr.target_id = u.id)
                         OR (fr.requester_id = u.id AND fr.target_id = $2))
                )
                ORDER BY
                    CASE
                        WHEN u.first_name ILIKE $3 THEN 1
                        WHEN u.last_name ILIKE $3 THEN 2
                        WHEN u.nickname ILIKE $3 THEN 3
                        ELSE 4
                    END,
                    u.first_name,
                    u.last_name
                LIMIT $4 OFFSET $5
            `;

      const searchPattern = `%${searchTerm}%`;
      const exactPattern = `${searchTerm}%`;
      const offset = (currentPage - 1) * pageSize;

      const { rows } = await pool.query(searchQuery, [
        searchPattern,
        req.user.id,
        exactPattern,
        pageSize,
        offset,
      ]);

      const results = rows.map((row) => applyDisplayName(toCamelCase(row)));

      res.json(results);
    } catch (error) {
      console.error("User search error:", error);
      res.status(500).json({ error: "Serverfehler bei der Benutzersuche." });
    }
  });

  return router;
};
