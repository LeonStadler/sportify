export const createAdminMiddleware = (pool) => async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentifizierung erforderlich.' });
    }

    const { rows } = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
    }

    if (!rows[0].is_admin) {
      return res.status(403).json({ error: 'Adminrechte erforderlich.' });
    }

    return next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ error: 'Serverfehler bei der Admin-Prüfung.' });
  }
};
