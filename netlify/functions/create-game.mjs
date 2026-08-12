import { getStore } from '@netlify/blobs';
import {
  GAME_STORE_NAME,
  createGameId,
  createGameRecord,
  validateGamePayload,
} from '../lib/game-record.mjs';

const MAX_REQUEST_BYTES = 8_192;
const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export default async function createGame(request) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return jsonResponse({ error: 'Game data is too large.' }, 413);
  }

  let payload;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_REQUEST_BYTES) {
      return jsonResponse({ error: 'Game data is too large.' }, 413);
    }
    payload = JSON.parse(body);
  } catch {
    return jsonResponse({ error: 'Send valid JSON game data.' }, 400);
  }

  const validation = validateGamePayload(payload);
  if (validation.error) {
    return jsonResponse({ error: validation.error }, 400);
  }

  const store = getStore({ name: GAME_STORE_NAME, consistency: 'strong' });
  const record = createGameRecord(validation.value);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const id = createGameId();
    const result = await store.setJSON(id, record, {
      onlyIfNew: true,
      metadata: { expiresAt: record.expiresAt },
    });
    if (result.modified) {
      return jsonResponse({ id, path: `/g/${id}` }, 201);
    }
  }

  return jsonResponse({ error: 'Could not reserve a game link. Please try again.' }, 503);
}

export const config = {
  path: '/api/games',
  rateLimit: {
    windowLimit: 10,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
