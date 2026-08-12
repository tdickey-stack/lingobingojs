import React, { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  MAX_TITLE_LENGTH,
  REQUIRED_PHRASE_COUNT,
  normalizePhraseText,
  validateGamePayload,
} from '../funcLib/GamePayload';

export default function CreateGame() {
  const [theme] = useOutletContext();
  const [title, setTitle] = useState('');
  const [phraseText, setPhraseText] = useState('');
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [createdGameId, setCreatedGameId] = useState('');
  const [copyState, setCopyState] = useState('Copy link');
  const [isCreating, setIsCreating] = useState(false);
  const phrases = useMemo(() => normalizePhraseText(phraseText), [phraseText]);

  function validate() {
    const validationError = validateGamePayload({ title, phrases }).error || '';
    if (validationError === `Add exactly ${REQUIRED_PHRASE_COUNT} phrases.`) {
      return `Add exactly ${REQUIRED_PHRASE_COUNT} phrases. You currently have ${phrases.length}.`;
    }
    return validationError;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setShareUrl('');
      setCreatedGameId('');
      return;
    }

    setError('');
    setShareUrl('');
    setCreatedGameId('');
    setCopyState('Copy link');
    setIsCreating(true);

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), phrases }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'The game could not be saved. Please try again.');
      }
      if (typeof result.path !== 'string' || !result.path.startsWith('/g/')) {
        throw new Error('The game was saved, but its share link was not returned. Please try again.');
      }

      setShareUrl(new URL(result.path, window.location.origin).toString());
      setCreatedGameId(result.id || result.path.split('/').pop());
    } catch (requestError) {
      const localHint = window.location.hostname === 'localhost'
        ? ' Run this project with Netlify Dev to test short links locally.'
        : '';
      setError(`${requestError.message || 'The game could not be saved.'}${localHint}`);
    } finally {
      setIsCreating(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState('Copied');
    } catch {
      setCopyState('Select and copy');
    }
  }

  return (
    <section className='page-shell create-page' data-theme={theme}>
      <div className='page-intro'>
        <span className='eyebrow'>Game builder</span>
        <h1>Create a Lingo Bingo game</h1>
        <p>Choose a title and add one phrase per line. We’ll save the game and make a short link that opens a freshly shuffled board for every player.</p>
      </div>

      <form className='create-panel' onSubmit={handleSubmit} noValidate aria-busy={isCreating}>
        <div className='field-group'>
          <label htmlFor='game-title'>Game title</label>
          <span className='field-hint'>A clear title helps players know they joined the right game.</span>
          <input
            id='game-title'
            name='game-title'
            type='text'
            value={title}
            maxLength={MAX_TITLE_LENGTH}
            placeholder='Sunday Team Gathering'
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className='field-group'>
          <div className='field-label-row'>
            <label htmlFor='game-phrases'>Phrases</label>
            <span className={phrases.length === REQUIRED_PHRASE_COUNT ? 'count-badge is-complete' : 'count-badge'}>
              {phrases.length} / {REQUIRED_PHRASE_COUNT}
            </span>
          </div>
          <span className='field-hint'>Add exactly 24 unique phrases, one per line. The free space is added automatically.</span>
          <textarea
            id='game-phrases'
            name='game-phrases'
            value={phraseText}
            rows='13'
            placeholder={'Welcome team\nNext steps\nSmall groups\n...'}
            onChange={(event) => setPhraseText(event.target.value)}
            aria-describedby='phrase-help'
          />
          <small id='phrase-help'>Keep each phrase concise so it remains easy to scan on a phone.</small>
        </div>

        {error && <div className='form-message is-error' role='alert'>{error}</div>}

        <div className='form-actions'>
          <button className='button button-primary' type='submit' disabled={isCreating}>
            {isCreating ? 'Saving game…' : 'Create game link'}
          </button>
          <Link className='button button-secondary' to='/play'>Preview default game</Link>
        </div>
      </form>

      {shareUrl && (
        <section className='share-panel' aria-live='polite'>
          <span className='success-icon' aria-hidden='true'>✓</span>
          <div className='share-copy'>
            <span className='eyebrow'>Ready to share</span>
            <h2>Your game link is ready</h2>
            <p>Anyone with this link can open a new shuffled board. No account is required.</p>
            <label className='visually-hidden' htmlFor='share-url'>Shareable game URL</label>
            <div className='copy-control'>
              <input id='share-url' value={shareUrl} readOnly onFocus={(event) => event.target.select()} />
              <button className='button button-secondary' type='button' onClick={copyLink}>{copyState}</button>
            </div>
            <div className='share-actions'>
              <Link className='button button-primary' to={`/host/${createdGameId}`}>Host a live room</Link>
              <a className='button button-secondary' href={shareUrl}>Play solo</a>
            </div>
          </div>
        </section>
      )}
    </section>
  );
}
