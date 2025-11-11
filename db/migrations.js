import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

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
        'users': ['id', 'email', 'password_hash', 'first_name', 'last_name', 'two_factor_enabled_at', 'password_changed_at'],
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

/**
 * Liest alle Migration-Dateien und führt sie in numerischer Reihenfolge aus
 */
export const createMigrationRunner = (pool) => {
    let migrationPromise;

    return async () => {
        if (!migrationPromise) {
            migrationPromise = (async () => {
                try {
                    // Lese alle Migration-Dateien
                    const files = await fs.readdir(MIGRATIONS_DIR);
                    const migrationFiles = files
                        .filter(file => file.endsWith('.sql'))
                        .sort(); // Sortiere alphabetisch (001, 002, 003, ...)

                    console.log(`[Migration] Gefundene Migrationen: ${migrationFiles.length}`);

                    // Führe jede Migration aus
                    for (const file of migrationFiles) {
                        const migrationPath = path.join(MIGRATIONS_DIR, file);
                        console.log(`[Migration] Führe aus: ${file}`);
                        const sql = await fs.readFile(migrationPath, 'utf-8');
                        await pool.query(sql);
                        console.log(`[Migration] ✅ ${file} erfolgreich ausgeführt`);
                    }
                    
                    // Prüfe ob alle Tabellen existieren
                    await ensureAllTablesExist(pool);
                    console.log('[Migration] ✅ Alle Migrationen erfolgreich ausgeführt');
                } catch (error) {
                    console.error('[Migration] ❌ Fehler beim Ausführen der Migrationen:', error);
                    throw error;
                }
            })();
        }

        return migrationPromise;
    };
};
