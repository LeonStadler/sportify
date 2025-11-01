import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import pkg from 'pg';
import authMiddleware from './authMiddleware.js';
import { createMigrationRunner } from './db/migrations.js';
import { createAdminMiddleware } from './middleware/adminMiddleware.js';
import { createAdminRouter } from './routes/admin.routes.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { createChallengesRouter } from './routes/challenges.routes.js';
import { createFeedRouter } from './routes/feed.routes.js';
import { createFriendsRouter } from './routes/friends.routes.js';
import { createGoalsRouter } from './routes/goals.routes.js';
import { createNotificationsRouter } from './routes/notifications.routes.js';
import { createProfileRouter } from './routes/profile.routes.js';
import { createRecentWorkoutsRouter } from './routes/recent-workouts.routes.js';
import { createScoreboardRouter } from './routes/scoreboard.routes.js';
import { createStatsRouter } from './routes/stats.routes.js';
import { createTrainingJournalRouter } from './routes/training-journal.routes.js';
import { createUsersRouter } from './routes/users.routes.js';
import { createWorkoutsRouter } from './routes/workouts.routes.js';
import { parseBoolean } from './utils/helpers.js';

dotenv.config();
const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 3001;

// Database Connection
const sslEnabled = parseBoolean(process.env.DATABASE_SSL_ENABLED, false);
const rejectUnauthorized = parseBoolean(process.env.DATABASE_SSL_REJECT_UNAUTHORIZED, true);
const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
};

if (sslEnabled) {
    poolConfig.ssl = {
        rejectUnauthorized,
    };
}

const pool = new Pool(poolConfig);
const runMigrations = createMigrationRunner(pool);

const adminMiddleware = createAdminMiddleware(pool);

// Middlewares
app.use(cors({
    origin: [
        'http://localhost:4000',
        'http://localhost:8080',
        'http://127.0.0.1:4000',
        'http://127.0.0.1:8080',
        'http://localhost:5173',
        'http://127.0.0.1:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const ensureFriendInfrastructure = async () => {
    try {
        const { rows } = await pool.query(`
            SELECT to_regclass('public.users') AS has_users
        `);

        if (!rows[0]?.has_users) {
            console.warn('Users table does not exist, skipping friend infrastructure setup');
            return;
        }

        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS friend_requests (
                    id UUID PRIMARY KEY,
                    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    target_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    status TEXT NOT NULL DEFAULT 'pending',
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    UNIQUE (requester_id, target_id)
                );
            `);
        } catch (error) {
            console.error('Error creating friend_requests table:', error);
            throw error;
        }

        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS friendships (
                    id UUID PRIMARY KEY,
                    user_one_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    user_two_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    UNIQUE (user_one_id, user_two_id)
                );
            `);
        } catch (error) {
            console.error('Error creating friendships table:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in ensureFriendInfrastructure:', error);
        throw error;
    }
};

if (process.env.NODE_ENV !== 'test') {
    ensureFriendInfrastructure().catch((error) => {
        console.error('Failed to ensure friend infrastructure:', error);
    });
}

// Register all route modules (API routes must come before static files)
app.use('/api/auth', createAuthRouter(pool));
app.use('/api/admin', authMiddleware, adminMiddleware, createAdminRouter(pool));
app.use('/api/profile', createProfileRouter(pool));
app.use('/api/friends', createFriendsRouter(pool, ensureFriendInfrastructure));
app.use('/api/users', createUsersRouter(pool));
app.use('/api/workouts', createWorkoutsRouter(pool));
app.use('/api/training-journal', createTrainingJournalRouter(pool));
app.use('/api/scoreboard', createScoreboardRouter(pool));
app.use('/api/stats', createStatsRouter(pool));
app.use('/api/goals', createGoalsRouter(pool));
app.use('/api/recent-workouts', createRecentWorkoutsRouter(pool));
app.use('/api/feed', createFeedRouter(pool, ensureFriendInfrastructure));
app.use('/api/challenges', createChallengesRouter(pool));
app.use('/api/notifications', createNotificationsRouter());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Sportify API is running!' });
});

// Serve static files from dist directory in production
// In development, Vite handles this
if (process.env.NODE_ENV === 'production') {
    import('path').then((pathModule) => {
        import('url').then((urlModule) => {
            const __filename = urlModule.fileURLToPath(import.meta.url);
            const __dirname = pathModule.dirname(__filename);

            app.use(express.static(pathModule.join(__dirname, 'dist')));

            // Fallback: Send index.html for all non-API routes (for React Router)
            app.get('*', (req, res) => {
                // Don't interfere with API routes
                if (req.path.startsWith('/api')) {
                    return res.status(404).json({ error: 'API route not found' });
                }
                res.sendFile(pathModule.join(__dirname, 'dist', 'index.html'));
            });
        });
    });
} else {
    // Development: Just respond for root path
    app.get('/', (req, res) => {
        res.send('Sportify API is running! Use the Vite dev server for the frontend.');
    });
}

const startServer = async () => {
    try {
        await runMigrations();
        const server = app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
        return server;
    } catch (error) {
        console.error('Failed to start server due to migration error:', error);
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
        throw error;
    }
};

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

export { app, ensureFriendInfrastructure, pool, runMigrations, startServer };
export default app;
