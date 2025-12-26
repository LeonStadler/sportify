import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
const envPath = path.join(__dirname, '../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Connection config matching server.js
const getPoolConfig = () => {
    if (process.env.DATABASE_URL) {
        console.log('Using DATABASE_URL');
        return {
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        };
    }
    
    // Fallback to individual vars if DATABASE_URL is missing
    console.log('Using individual DB vars');
    return {
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'sportify',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    };
};

const pool = new pg.Pool(getPoolConfig());

async function checkSchema() {
    try {
        console.log('Checking notifications table columns...');
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'notifications'
            ORDER BY ordinal_position;
        `);
        
        if (res.rows.length === 0) {
            console.log('Table "notifications" does not exist or has no columns.');
        } else {
            console.log('Columns found:');
            console.table(res.rows);
        }

        const columns = res.rows.map(r => r.column_name);
        
        if (!columns.includes('title')) {
            console.log('Adding missing column: title');
            try {
                await pool.query('ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT;');
                console.log('Successfully added title column');
            } catch (e) {
                console.error('Error adding title:', e.message);
            }
        } else {
            console.log('Column "title" already exists.');
        }

        if (!columns.includes('message')) {
            console.log('Adding missing column: message');
            try {
                await pool.query('ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT;');
                console.log('Successfully added message column');
            } catch (e) {
                console.error('Error adding message:', e.message);
            }
        }

        if (!columns.includes('payload')) {
             console.log('Adding missing column: payload');
             try {
                 await pool.query("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT '{}'::jsonb;");
                 console.log('Successfully added payload column');
             } catch (e) {
                 console.error('Error adding payload:', e.message);
             }
        }
        
         // Check again
        const res2 = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'notifications'
            ORDER BY ordinal_position;
        `);
        console.table(res2.rows);

    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        await pool.end();
    }
}

checkSchema();
