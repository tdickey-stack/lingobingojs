import React, { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { validateGamePayload } from '../funcLib/GamePayload';
import { generateRoomCode, normalizePlayerName } from '../funcLib/RoomProtocol';
import { createHostedRoom } from '../funcLib/RoomPeer';
import RoomLobby from './RoomLobby';
import RoomGame from './RoomGame';

export default function HostRoom() {
  const { gameId } = useParams();
  const [theme] = useOutletContext();
  const [game, setGame] = useState(null);
  const [hostName, setHostName] = useState(() => window.localStorage.getItem('lingo-bingo-player-name') || '');
  const [roomCode, setRoomCode] = useState('');
  const [roomState, setRoomState] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [copyState, setCopyState] = useState('Copy room link');
  const controllerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function loadGame() {
      try {
        const response = await fetch(`/api/games/${encodeURIComponent(gameId)}`, {
          headers: { Accept: 'application/json' },
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.error || 'This game could not be loaded.');
        }
        const validation = validateGamePayload(result);
        if (validation.error) {
          throw new Error('This saved game is incomplete or invalid.');
        }
        if (!cancelled) {
          setGame(validation.value);
          setStatus('setup');
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'This game could not be loaded.');
          setStatus('error');
        }
      }
    }
    loadGame();
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  useEffect(() => () => controllerRef.current?.destroy(), []);

  function createRoom(event) {
    event.preventDefault();
    const normalizedName = normalizePlayerName(hostName);
    if (!normalizedName) {
      setError('Enter your name before creating the room.');
      return;
    }

    controllerRef.current?.destroy();
    const nextRoomCode = generateRoomCode();
    setHostName(normalizedName);
    window.localStorage.setItem('lingo-bingo-player-name', normalizedName);
    setRoomCode(nextRoomCode);
    setRoomState(null);
    setError('');
    setStatus('connecting');
    setCopyState('Copy room link');

    controllerRef.current = createHostedRoom({
      roomCode: nextRoomCode,
      hostName: normalizedName,
      game,
      onReady: () => setStatus('lobby'),
      onState: setRoomState,
      onError: (message) => {
        setError(message);
        setStatus('error');
      },
    });
  }

  async function copyRoomLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/room/${roomCode}`);
      setCopyState('Copied');
    } catch {
      setCopyState('Select and copy');
    }
  }

  if (status === 'loading' || status === 'connecting') {
    return (
      <section className='page-shell game-page' data-theme={theme}>
        <div className='game-panel game-status' role='status'>
          <span className='status-spinner' aria-hidden='true' />
          <span className='eyebrow'>Live room</span>
          <h1>{status === 'loading' ? 'Loading your game…' : 'Creating your room…'}</h1>
          <p>This should only take a moment.</p>
        </div>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className='page-shell game-page' data-theme={theme}>
        <div className='game-panel game-status is-error' role='alert'>
          <span className='status-icon' aria-hidden='true'>!</span>
          <span className='eyebrow'>Room unavailable</span>
          <h1>We couldn’t open the live room</h1>
          <p>{error}</p>
          <div className='game-actions'>
            {game && <button className='button button-primary' type='button' onClick={() => setStatus('setup')}>Try again</button>}
            <Link className='button button-secondary' to={game ? `/g/${gameId}` : '/create'}>{game ? 'Return to game' : 'Create a game'}</Link>
          </div>
        </div>
      </section>
    );
  }

  if (status === 'setup') {
    return (
      <section className='page-shell room-page' data-theme={theme}>
        <div className='room-setup-panel'>
          <span className='eyebrow'>Host a live game</span>
          <h1>{game.title}</h1>
          <p>Create a temporary room, invite your players, and start everyone’s board together.</p>
          <form onSubmit={createRoom} noValidate>
            <label htmlFor='host-name'>Your name</label>
            <span className='field-hint'>Players will see this name in the lobby.</span>
            <input
              id='host-name'
              value={hostName}
              maxLength='24'
              autoComplete='nickname'
              placeholder='Enter your name'
              onChange={(event) => {
                setHostName(event.target.value);
                setError('');
              }}
            />
            {error && <div className='form-message is-error' role='alert'>{error}</div>}
            <div className='form-actions'>
              <button className='button button-primary' type='submit'>Create live room</button>
              <Link className='button button-secondary' to={`/g/${gameId}`}>Back to game</Link>
            </div>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className='page-shell game-page room-page' data-theme={theme}>
      <div className='game-panel'>
        {roomState?.status === 'playing' ? (
          <RoomGame
            roomState={roomState}
            playerName={hostName}
            theme={theme}
            onBingo={() => controllerRef.current?.reportBingo()}
          />
        ) : roomState ? (
          <RoomLobby
            gameTitle={game.title}
            roomCode={roomCode}
            players={roomState.players}
            isHost
            shareUrl={`${window.location.origin}/room/${roomCode}`}
            copyState={copyState}
            onCopy={copyRoomLink}
            onStart={() => controllerRef.current?.start()}
          />
        ) : null}
      </div>
    </section>
  );
}
