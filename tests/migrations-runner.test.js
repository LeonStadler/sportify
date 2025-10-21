import assert from 'node:assert/strict';
import test from 'node:test';

import { createMigrationRunner } from '../db/migrations.js';

test('createMigrationRunner executes migrations only once per pool', async () => {
    const executedQueries = [];
    const fakePool = {
        query: async (sql) => {
            executedQueries.push(sql);
        }
    };

    const runMigrations = createMigrationRunner(fakePool);

    await runMigrations();
    await runMigrations();

    assert.equal(executedQueries.length, 1);
    assert.match(executedQueries[0], /CREATE TABLE IF NOT EXISTS training_journal_entries/);
});

test('each migration runner instance isolates execution per pool', async () => {
    let firstPoolExecutions = 0;
    let secondPoolExecutions = 0;

    const firstRunner = createMigrationRunner({
        query: async () => {
            firstPoolExecutions += 1;
        }
    });

    const secondRunner = createMigrationRunner({
        query: async () => {
            secondPoolExecutions += 1;
        }
    });

    await firstRunner();
    await secondRunner();

    assert.equal(firstPoolExecutions, 1);
    assert.equal(secondPoolExecutions, 1);
});
