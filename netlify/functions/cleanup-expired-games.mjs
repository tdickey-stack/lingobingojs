import { getStore } from '@netlify/blobs';
import {
  GAME_STORE_NAME,
  isGameExpired,
} from '../lib/game-record.mjs';

const CLEANUP_BATCH_SIZE = 20;

export async function deleteExpiredGames(store, now = Date.now()) {
  const { blobs } = await store.list();
  let deleted = 0;
  let failed = 0;

  for (let index = 0; index < blobs.length; index += CLEANUP_BATCH_SIZE) {
    const batch = blobs.slice(index, index + CLEANUP_BATCH_SIZE);
    const results = await Promise.all(batch.map(async ({ key }) => {
      try {
        const record = await store.get(key, { type: 'json' });
        if (!record || !isGameExpired(record, now)) {
          return 'kept';
        }

        await store.delete(key);
        return 'deleted';
      } catch (error) {
        console.error(`Could not check saved game ${key} for expiration.`, error);
        return 'failed';
      }
    }));

    deleted += results.filter((result) => result === 'deleted').length;
    failed += results.filter((result) => result === 'failed').length;
  }

  return { scanned: blobs.length, deleted, failed };
}

export default async function cleanupExpiredGames() {
  const store = getStore({ name: GAME_STORE_NAME, consistency: 'strong' });
  const result = await deleteExpiredGames(store);

  console.log('Saved game cleanup complete.', result);
  return Response.json(result);
}

export const config = {
  schedule: '@daily',
};
