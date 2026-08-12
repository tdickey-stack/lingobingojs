import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GAME_ID_PATTERN,
  GAME_RETENTION_MS,
  createGameId,
  createGameRecord,
  getGameExpiration,
  isGameExpired,
  validateGamePayload,
} from './game-record.mjs';

const phrases = Array.from({ length: 24 }, (_, index) => `Phrase ${index + 1}`);

test('normalizes a valid game payload', () => {
  const result = validateGamePayload({ title: '  Team Night  ', phrases });

  assert.deepEqual(result.value, { title: 'Team Night', phrases });
});

test('rejects duplicate and malformed phrases', () => {
  const duplicates = [...phrases.slice(0, 23), 'phrase 1'];

  assert.match(validateGamePayload({ title: 'Team Night', phrases: duplicates }).error, /unique/i);
  assert.match(validateGamePayload({ title: 'Team Night', phrases: phrases.slice(1) }).error, /exactly 24/i);
});

test('creates compact, URL-safe, non-repeating game IDs', () => {
  const ids = new Set(Array.from({ length: 100 }, createGameId));

  assert.equal(ids.size, 100);
  for (const id of ids) {
    assert.match(id, GAME_ID_PATTERN);
  }
});

test('creates game records that expire after 90 days', () => {
  const now = new Date('2026-08-11T12:00:00.000Z');
  const record = createGameRecord({ title: 'Team Night', phrases }, now);

  assert.equal(record.createdAt, now.toISOString());
  assert.equal(record.expiresAt, new Date(now.getTime() + GAME_RETENTION_MS).toISOString());
  assert.equal(isGameExpired(record, now.getTime() + GAME_RETENTION_MS - 1), false);
  assert.equal(isGameExpired(record, now.getTime() + GAME_RETENTION_MS), true);
});

test('applies retention to legacy records without an explicit expiration', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const legacyRecord = { title: 'Legacy game', phrases, createdAt: createdAt.toISOString() };

  assert.equal(getGameExpiration(legacyRecord), createdAt.getTime() + GAME_RETENTION_MS);
  assert.equal(isGameExpired(legacyRecord, createdAt.getTime() + GAME_RETENTION_MS), true);
});

test('does not expire records that have no usable timestamp', () => {
  assert.equal(getGameExpiration({ title: 'Unknown age', phrases }), null);
  assert.equal(isGameExpired({ title: 'Unknown age', phrases }, Date.now()), false);
});
