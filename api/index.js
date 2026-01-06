import app, { runMigrations } from '../server.js';

// Optional cold-start migration runner for Serverless (Vercel).
// Default is OFF because migrations sollten beim Deploy laufen.
// Aktivieren mit RUN_MIGRATIONS_ON_LOAD=true falls gewünscht.
const shouldRunOnLoad = process.env.RUN_MIGRATIONS_ON_LOAD === 'true';
let migrationsRun = false;
let migrationPromise = null;

const runMigrationsOnce = async () => {
  if (!shouldRunOnLoad) return;
  if (!migrationsRun && !migrationPromise) {
    migrationPromise = (async () => {
      try {
        await runMigrations();
        migrationsRun = true;
        console.log('Migrations completed successfully on Vercel');
      } catch (error) {
        console.error('Failed to run migrations on Vercel:', error);
        migrationsRun = false;
        throw error;
      } finally {
        migrationPromise = null;
      }
    })();
  }
  return migrationPromise;
};

app.get('/api/health/migrations', (_req, res) => {
  res.json({
    status: migrationsRun ? 'ok' : 'pending',
    inFlight: Boolean(migrationPromise),
    enabled: shouldRunOnLoad,
  });
});

// Run migrations on module load (async, non-blocking)
runMigrationsOnce().catch(console.error);

// Export für Vercel Serverless Functions
// Vercel kann Express-Apps direkt als Handler verwenden
export default app;
