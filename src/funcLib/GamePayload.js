export const REQUIRED_PHRASE_COUNT = 24;
export const MAX_TITLE_LENGTH = 80;
export const MAX_PHRASE_LENGTH = 48;

export function normalizePhraseText(value) {
  return value
    .split('\n')
    .map((phrase) => phrase.trim())
    .filter(Boolean);
}

export function validateGamePayload(payload) {
  const title = typeof payload?.title === 'string' ? payload.title.trim() : '';
  if (!title) {
    return { error: 'Give your game a short title.' };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { error: `Keep the game title to ${MAX_TITLE_LENGTH} characters or fewer.` };
  }
  if (!Array.isArray(payload?.phrases) || payload.phrases.length !== REQUIRED_PHRASE_COUNT) {
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
