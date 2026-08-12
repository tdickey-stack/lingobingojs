import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GAME_ID_PATTERN,
  createGameId,
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
