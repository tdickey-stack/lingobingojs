import React, { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import {
  isValidRoomCode,
  normalizePlayerName,
  normalizeRoomCode,
} from '../funcLib/RoomProtocol';
import { joinHostedRoom } from '../funcLib/RoomPeer';
import JoinRoomForm from './JoinRoomForm';
import RoomLobby from './RoomLobby';
import RoomGame from './RoomGame';

export default function JoinRoom() {
  const { roomCode: routeRoomCode } = useParams();
  const [theme] = useOutletContext();
  const roomCode = normalizeRoomCode(routeRoomCode);
  const [playerName, setPlayerName] = useState(() => window.localStorage.getItem('lingo-bingo-player-name') || '');
  const [roomState, setRoomState] = useState(null);
  const [status, setStatus] = useState('setup');
  const [error, setError] = useState('');
  const controllerRef = useRef(null);

  useEffect(() => () => controllerRef.current?.destroy(), []);

  function joinRoom(event) {
    event.preventDefault();
    const normalizedName = normalizePlayerName(playerName);
    if (!normalizedName) {
      setError('Enter your name before joining.');
      return;
    }

    controllerRef.current?.destroy();
    window.localStorage.setItem('lingo-bingo-player-name', normalizedName);
    setPlayerName(normalizedName);
    setRoomState(null);
    setError('');
    setStatus('connecting');

    controllerRef.current = joinHostedRoom({
      roomCode,
      playerName: normalizedName,
      onConnected: () => {},
      onState: (nextState) => {
        setRoomState(nextState);
        setStatus(nextState.status);
      },
      onError: (message) => {
        setError(message);
        setStatus('error');
      },
    });
  }

  if (!isValidRoomCode(roomCode)) {
    return (
      <section className='page-shell room-page' data-theme={theme}>
        <div className='room-setup-panel'>
          <span className='eyebrow'>Join a live game</span>
          <h1>That room code doesn’t look right.</h1>
          <p>Enter the six-character code shown by your host.</p>
          <JoinRoomForm />
        </div>
      </section>
    );
  }

  if (status === 'connecting') {
    return (
      <section className='page-shell game-page' data-theme={theme}>
        <div className='game-panel game-status' role='status'>
          <span className='status-spinner' aria-hidden='true' />
          <span className='eyebrow'>Room {roomCode}</span>
          <h1>Joining the room…</h1>
          <p>Connecting you to the host.</p>
        </div>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className='page-shell game-page' data-theme={theme}>
        <div className='game-panel game-status is-error' role='alert'>
          <span className='status-icon' aria-hidden='true'>!</span>
          <span className='eyebrow'>Room {roomCode}</span>
          <h1>We couldn’t join this room</h1>
          <p>{error}</p>
          <div className='game-actions'>
            <button className='button button-primary' type='button' onClick={() => setStatus('setup')}>Try again</button>
            <Link className='button button-secondary' to='/'>Enter another code</Link>
          </div>
        </div>
      </section>
    );
  }

  if (status === 'setup') {
    return (
      <section className='page-shell room-page' data-theme={theme}>
        <div className='room-setup-panel'>
          <span className='eyebrow'>Join room {roomCode}</span>
          <h1>What should we call you?</h1>
          <p>Your name will appear in the lobby and in the room’s Bingo announcements.</p>
          <form onSubmit={joinRoom} noValidate>
            <label htmlFor='player-name'>Your name</label>
            <input
              id='player-name'
              value={playerName}
              maxLength='24'
              autoComplete='nickname'
              autoFocus
              placeholder='Enter your name'
              onChange={(event) => {
                setPlayerName(event.target.value);
                setError('');
              }}
            />
            {error && <div className='form-message is-error' role='alert'>{error}</div>}
            <div className='form-actions'>
              <button className='button button-primary' type='submit'>Join room</button>
              <Link className='button button-secondary' to='/'>Cancel</Link>
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
            playerName={playerName}
            theme={theme}
            onBingo={() => controllerRef.current?.reportBingo()}
          />
        ) : roomState ? (
          <RoomLobby
            gameTitle={roomState.game.title}
            roomCode={roomCode}
            players={roomState.players}
            isHost={false}
          />
        ) : null}
      </div>
    </section>
  );
}
