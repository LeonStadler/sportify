import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATION_FILE_PATH = path.join(__dirname, '../migration.sql');

export const createMigrationRunner = (pool) => {
    let migrationPromise;

    return async () => {
        if (!migrationPromise) {
            migrationPromise = (async () => {
                const sql = await fs.readFile(MIGRATION_FILE_PATH, 'utf-8');
                await pool.query(sql);
            })();
        }

        return migrationPromise;
    };
};
