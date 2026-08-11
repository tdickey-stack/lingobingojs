import React, { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

const REQUIRED_PHRASE_COUNT = 24;
const MAX_PHRASE_LENGTH = 48;

function normalizePhrases(value) {
  return value
    .split('\n')
    .map((phrase) => phrase.trim())
    .filter(Boolean);
}

export default function CreateGame() {
  const [theme] = useOutletContext();
  const [title, setTitle] = useState('');
  const [phraseText, setPhraseText] = useState('');
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copyState, setCopyState] = useState('Copy link');
  const phrases = useMemo(() => normalizePhrases(phraseText), [phraseText]);

  function validate() {
    if (!title.trim()) {
      return 'Give your game a short title.';
    }
    if (phrases.length !== REQUIRED_PHRASE_COUNT) {
      return `Add exactly ${REQUIRED_PHRASE_COUNT} phrases. You currently have ${phrases.length}.`;
    }
    if (phrases.some((phrase) => phrase.length > MAX_PHRASE_LENGTH)) {
      return `Keep every phrase to ${MAX_PHRASE_LENGTH} characters or fewer.`;
    }
    if (new Set(phrases.map((phrase) => phrase.toLowerCase())).size !== phrases.length) {
      return 'Each phrase must be unique.';
    }
    return '';
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setShareUrl('');
      return;
    }

    const params = new URLSearchParams({
      title: title.trim(),
      phrases: JSON.stringify(phrases)
    });
    setError('');
    setCopyState('Copy link');
    setShareUrl(`${window.location.origin}/play?${params.toString()}`);
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
        <p>Choose a title and add one phrase per line. Your share link opens a freshly shuffled board for every player.</p>
      </div>

      <form className='create-panel' onSubmit={handleSubmit} noValidate>
        <div className='field-group'>
          <label htmlFor='game-title'>Game title</label>
          <span className='field-hint'>A clear title helps players know they joined the right game.</span>
          <input
            id='game-title'
            name='game-title'
            type='text'
            value={title}
            maxLength='80'
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
          <button className='button button-primary' type='submit'>Create game link</button>
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
            <a className='button button-primary' href={shareUrl}>Start this game</a>
          </div>
        </section>
      )}
    </section>
  );
}
