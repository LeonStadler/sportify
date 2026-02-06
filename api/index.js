import app from '../server.js';

// Migrationen laufen nur beim Deploy (Build: npm run migrate), nicht beim Cold Start.

app.get('/api/health/migrations', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Migrations run at build time only, not on cold start.',
  });
});

// Export für Vercel Serverless Functions
export default app;
