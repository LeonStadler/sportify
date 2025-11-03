import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATION_FILE_PATH = path.join(__dirname, '../migration.sql');

/**
 * Prüft ob eine Tabelle existiert
 */
const tableExists = async (pool, tableName) => {
    try {
        const result = await pool.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
            )`,
            [tableName]
        );
        return result.rows[0].exists;
    } catch (error) {
        console.error(`[Migration] Fehler beim Prüfen der Tabelle ${tableName}:`, error);
        return false;
    }
};

/**
 * Prüft ob eine Spalte in einer Tabelle existiert
 */
const columnExists = async (pool, tableName, columnName) => {
    try {
        const result = await pool.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = $1 
                AND column_name = $2
            )`,
            [tableName, columnName]
        );
        return result.rows[0].exists;
    } catch (error) {
        console.error(`[Migration] Fehler beim Prüfen der Spalte ${tableName}.${columnName}:`, error);
        return false;
    }
};

/**
 * Prüft ob alle notwendigen Tabellen existieren und alle Spalten vorhanden sind
 */
export const ensureAllTablesExist = async (pool) => {
    const requiredTables = {
        'users': ['id', 'email', 'password_hash', 'first_name', 'last_name'],
        'email_verification_tokens': ['id', 'user_id', 'token_hash', 'expires_at', 'used', 'used_at'],
        'password_reset_tokens': ['id', 'user_id', 'token_hash', 'expires_at', 'used', 'used_at'],
        'outbound_emails': ['id', 'recipient', 'subject', 'body', 'sent_at'],
        'invitations': ['id', 'email', 'token_hash', 'expires_at', 'status', 'used', 'used_at'],
        'user_backup_codes': ['id', 'user_id', 'code_hash', 'used_at']
    };

    const missingTables = [];
    const missingColumns = [];

    for (const [tableName, columns] of Object.entries(requiredTables)) {
        const tableExistsResult = await tableExists(pool, tableName);
        if (!tableExistsResult) {
            missingTables.push(tableName);
        } else {
            // Prüfe Spalten
            for (const column of columns) {
                const columnExistsResult = await columnExists(pool, tableName, column);
                if (!columnExistsResult) {
                    missingColumns.push(`${tableName}.${column}`);
                }
            }
        }
    }

    if (missingTables.length > 0) {
        console.error(`[Migration] ❌ Fehlende Tabellen: ${missingTables.join(', ')}`);
        throw new Error(`Folgende Tabellen fehlen: ${missingTables.join(', ')}. Bitte führen Sie die Migrationen aus.`);
    }

    if (missingColumns.length > 0) {
        console.error(`[Migration] ❌ Fehlende Spalten: ${missingColumns.join(', ')}`);
        throw new Error(`Folgende Spalten fehlen: ${missingColumns.join(', ')}. Bitte führen Sie die Migrationen aus.`);
    }
    return true;
};

export const createMigrationRunner = (pool) => {
    let migrationPromise;

    return async () => {
        if (!migrationPromise) {
            migrationPromise = (async () => {
                try {
                    const sql = await fs.readFile(MIGRATION_FILE_PATH, 'utf-8');
                    await pool.query(sql);
                    
                    // Prüfe ob alle Tabellen existieren
                    await ensureAllTablesExist(pool);
                } catch (error) {
                    console.error('[Migration] ❌ Fehler beim Ausführen der Migrationen:', error);
                    throw error;
                }
            })();
        }

        return migrationPromise;
    };
};
