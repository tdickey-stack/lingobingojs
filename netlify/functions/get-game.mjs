import { getStore } from '@netlify/blobs';
import {
  GAME_ID_PATTERN,
  GAME_STORE_NAME,
  validateGamePayload,
} from '../lib/game-record.mjs';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'public, max-age=60, s-maxage=3600, immutable',
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export default async function getGame(request, context) {
  if (request.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const gameId = context.params.gameId;
  if (!GAME_ID_PATTERN.test(gameId || '')) {
    return jsonResponse({ error: 'That game link is not valid.' }, 400);
  }

  const store = getStore({ name: GAME_STORE_NAME, consistency: 'strong' });
  const record = await store.get(gameId, { type: 'json' });
  if (!record) {
    return jsonResponse({ error: 'This game could not be found.' }, 404);
  }

  const validation = validateGamePayload(record);
  if (validation.error) {
    return jsonResponse({ error: 'This game record is not valid.' }, 500);
  }

  return jsonResponse({
    version: record.version || 1,
    ...validation.value,
  });
}

export const config = {
  path: '/api/games/:gameId',
};
