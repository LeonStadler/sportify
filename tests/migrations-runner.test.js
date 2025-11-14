import assert from 'node:assert/strict';
import test from 'node:test';

import { createMigrationRunner } from '../db/migrations.js';

const createFakePool = () => {
    const executed = [];
    return {
        executed,
        async query(sql) {
            const normalized = sql.replace(/\s+/g, ' ').trim().toLowerCase();
            if (normalized.startsWith('select exists') && normalized.includes('information_schema.tables')) {
                return { rows: [{ exists: true }] };
            }
            if (normalized.startsWith('select exists') && normalized.includes('information_schema.columns')) {
                return { rows: [{ exists: true }] };
            }
            executed.push(sql);
            return { rows: [], rowCount: 0 };
        }
    };
};

test('createMigrationRunner executes migrations only once per pool', async () => {
    const fakePool = createFakePool();
    const runMigrations = createMigrationRunner(fakePool);

    await runMigrations();
    const firstRunCount = fakePool.executed.length;
    await runMigrations();

    assert.ok(firstRunCount > 0);
    assert.equal(fakePool.executed.length, firstRunCount);
    assert.match(fakePool.executed[0], /CREATE TABLE IF NOT EXISTS training_journal_entries/);
});

test('each migration runner instance isolates execution per pool', async () => {
    const firstPool = createFakePool();
    const secondPool = createFakePool();

    const firstRunner = createMigrationRunner(firstPool);
    const secondRunner = createMigrationRunner(secondPool);

    await firstRunner();
    await secondRunner();

    assert.ok(firstPool.executed.length > 0);
    assert.ok(secondPool.executed.length > 0);
});
