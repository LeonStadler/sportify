import assert from 'node:assert/strict';
import test from 'node:test';

import { createMigrationRunner } from '../db/migrations.js';

const createMockPool = (onStatement) => ({
    query: async (sql) => {
        const normalized = sql.trim().toLowerCase();
        if (normalized.startsWith('select exists')) {
            return { rows: [{ exists: true }], rowCount: 1 };
        }
        onStatement?.(sql);
        return { rows: [], rowCount: 0 };
    }
});

test('createMigrationRunner executes migrations only once per pool', async () => {
    const executedQueries = [];
    const fakePool = createMockPool((sql) => {
        executedQueries.push(sql);
    });

    const runMigrations = createMigrationRunner(fakePool);

    await runMigrations();
    const firstRunCount = executedQueries.length;
    await runMigrations();

    assert.ok(firstRunCount > 0);
    assert.equal(executedQueries.length, firstRunCount);
    assert(executedQueries.some((sql) => /CREATE TABLE IF NOT EXISTS training_journal_entries/i.test(sql)));
});

test('each migration runner instance isolates execution per pool', async () => {
    let firstPoolExecutions = 0;
    let secondPoolExecutions = 0;

    const firstRunner = createMigrationRunner(createMockPool(() => {
        firstPoolExecutions += 1;
    }));

    const secondRunner = createMigrationRunner(createMockPool(() => {
        secondPoolExecutions += 1;
    }));

    await firstRunner();
    const firstRunCount = firstPoolExecutions;
    await firstRunner();

    await secondRunner();
    const secondRunCount = secondPoolExecutions;
    await secondRunner();

    assert.ok(firstRunCount > 0);
    assert.equal(firstPoolExecutions, firstRunCount);
    assert.ok(secondRunCount > 0);
    assert.equal(secondPoolExecutions, secondRunCount);
});
