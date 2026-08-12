import assert from 'node:assert/strict';
import test from 'node:test';
import { deleteExpiredGames } from '../functions/cleanup-expired-games.mjs';

test('deletes expired games and leaves active games in the store', async () => {
  const now = new Date('2026-08-11T12:00:00.000Z');
  const records = new Map([
    ['expired-game', {
      createdAt: '2026-01-01T00:00:00.000Z',
    }],
    ['active-game', {
      createdAt: '2026-08-01T00:00:00.000Z',
      expiresAt: '2026-10-30T00:00:00.000Z',
    }],
    ['unknown-age', {}],
  ]);
  const deleted = [];
  const store = {
    list: async () => ({
      blobs: [...records.keys()].map((key) => ({ key })),
    }),
    get: async (key) => records.get(key),
    delete: async (key) => deleted.push(key),
  };

  const result = await deleteExpiredGames(store, now);

  assert.deepEqual(result, { scanned: 3, deleted: 1, failed: 0 });
  assert.deepEqual(deleted, ['expired-game']);
});
