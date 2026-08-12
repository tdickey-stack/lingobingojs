import { randomBytes } from 'node:crypto';

export const GAME_STORE_NAME = 'lingo-bingo-games';
export const REQUIRED_PHRASE_COUNT = 24;
export const MAX_TITLE_LENGTH = 80;
export const MAX_PHRASE_LENGTH = 48;
export const GAME_ID_PATTERN = /^[A-Za-z0-9_-]{12}$/;
export const GAME_RETENTION_DAYS = 90;
export const GAME_RETENTION_MS = GAME_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export function validateGamePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { error: 'Send a game title and phrase list.' };
  }

  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  if (!title) {
    return { error: 'Give your game a short title.' };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { error: `Keep the game title to ${MAX_TITLE_LENGTH} characters or fewer.` };
  }

  if (!Array.isArray(payload.phrases) || payload.phrases.length !== REQUIRED_PHRASE_COUNT) {
    return { error: `Add exactly ${REQUIRED_PHRASE_COUNT} phrases.` };
  }
  if (payload.phrases.some((phrase) => typeof phrase !== 'string')) {
    return { error: 'Every phrase must be text.' };
  }

  const phrases = payload.phrases.map((phrase) => phrase.trim());
  if (phrases.some((phrase) => !phrase)) {
    return { error: 'Phrases cannot be blank.' };
  }
  if (phrases.some((phrase) => phrase.length > MAX_PHRASE_LENGTH)) {
    return { error: `Keep every phrase to ${MAX_PHRASE_LENGTH} characters or fewer.` };
  }
  if (new Set(phrases.map((phrase) => phrase.toLocaleLowerCase('en-US'))).size !== phrases.length) {
    return { error: 'Each phrase must be unique.' };
  }

  return { value: { title, phrases } };
}

export function createGameId() {
  return randomBytes(9).toString('base64url');
}

export function createGameRecord(game, now = new Date()) {
  const createdAt = new Date(now);

  return {
    version: 1,
    ...game,
    createdAt: createdAt.toISOString(),
    expiresAt: new Date(createdAt.getTime() + GAME_RETENTION_MS).toISOString(),
  };
}

export function getGameExpiration(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return null;
  }

  const explicitExpiration = Date.parse(record.expiresAt || '');
  if (Number.isFinite(explicitExpiration)) {
    return explicitExpiration;
  }

  const createdAt = Date.parse(record.createdAt || '');
  return Number.isFinite(createdAt) ? createdAt + GAME_RETENTION_MS : null;
}

export function isGameExpired(record, now = Date.now()) {
  const expiration = getGameExpiration(record);
  const currentTime = now instanceof Date ? now.getTime() : Number(now);

  return expiration !== null && Number.isFinite(currentTime) && expiration <= currentTime;
}
