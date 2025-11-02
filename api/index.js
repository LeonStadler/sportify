import app, { runMigrations } from '../server.js';

// Run migrations when the serverless function is first invoked
// This ensures migrations run on Vercel deployment
let migrationsRun = false;

const runMigrationsOnce = async () => {
    if (!migrationsRun) {
        try {
            await runMigrations();
            migrationsRun = true;
            console.log('Migrations completed successfully on Vercel');
        } catch (error) {
            console.error('Failed to run migrations on Vercel:', error);
            // Don't throw - allow the app to continue
            // Migrations might already be applied
        }
    }
};

// Run migrations on cold start
runMigrationsOnce().catch(console.error);

// Export für Vercel Serverless Functions
export default app;

