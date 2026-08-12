import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Gameboard from './Gameboard';
import WinnerCelebration from './WinnerCelebration';
import checkForBingo from '../funcLib/CheckForBingo';
import randomGen from '../funcLib/RandomGen';
import wordProcessor from '../funcLib/WordProcessor';

function getStartingTiles() {
  const tiles = Array(25).fill(false);
  tiles[12] = true;
  return tiles;
}

export default function RoomGame({ roomState, playerName, theme, onBingo }) {
  const [hasStarted, setHasStarted] = useState(() => Date.now() >= roomState.startedAt);
  const [moves, setMoves] = useState(0);
  const [isBingoed, setBingoed] = useState(false);
  const [dauberedTiles, setDauberedTiles] = useState(getStartingTiles);
  const [randWords, setRandWords] = useState([]);
  const [countdown, setCountdown] = useState(() => Math.max(1, Math.ceil((roomState.startedAt - Date.now()) / 1000)));
  const [celebratedWinner, setCelebratedWinner] = useState(null);
  const announcedBingo = useRef(false);
  const phrases = useRef(roomState.game.phrases);
  const latestWinner = roomState.winners[roomState.winners.length - 1];

  useEffect(() => {
    if (latestWinner) {
      setCelebratedWinner(latestWinner);
    }
  }, [latestWinner]);

  const closeCelebration = useCallback(() => setCelebratedWinner(null), []);

  useEffect(() => {
    setRandWords(wordProcessor(phrases.current, randomGen(24)));
  }, [roomState.startedAt]);

  useEffect(() => {
    if (hasStarted) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      const remaining = roomState.startedAt - Date.now();
      if (remaining <= 0) {
        setHasStarted(true);
        window.clearInterval(timer);
      } else {
        setCountdown(Math.max(1, Math.ceil(remaining / 1000)));
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [hasStarted, roomState.startedAt]);

  useEffect(() => {
    const hasBingo = checkForBingo(dauberedTiles, moves);
    setBingoed(hasBingo);
    if (hasBingo && !announcedBingo.current) {
      announcedBingo.current = true;
      onBingo();
    }
  }, [dauberedTiles, moves, onBingo]);

  function handleTileClick(event) {
    const tileId = Number(event.currentTarget.id);
    if (!Number.isInteger(tileId) || tileId === 12 || dauberedTiles[tileId]) {
      return;
    }
    setDauberedTiles((currentTiles) => {
      const nextTiles = [...currentTiles];
      nextTiles[tileId] = true;
      return nextTiles;
    });
    setMoves((currentMoves) => currentMoves + 1);
  }

  if (!hasStarted) {
    return (
      <div className='room-countdown' role='status' aria-live='polite'>
        <span className='eyebrow'>Get ready</span>
        <strong>{countdown}</strong>
        <h1>Game starting…</h1>
        <p>Everyone’s board will open together.</p>
      </div>
    );
  }

  return (
    <>
      {celebratedWinner && (
        <WinnerCelebration
          winnerName={celebratedWinner.name}
          onClose={closeCelebration}
        />
      )}

      <div className='live-room-bar'>
        <div>
          <span className='connection-dot'>Live</span>
          <strong>{playerName}</strong>
        </div>
        <span>{roomState.players.length} connected</span>
      </div>

      {latestWinner && (
        <div className='room-winner-notice' role='status' aria-live='assertive'>
          <span className='winner-icon' aria-hidden='true'>✓</span>
          <span><strong>{latestWinner.name} got Bingo!</strong><small>Keep playing—the room stays open for more winners.</small></span>
        </div>
      )}

      <Gameboard
        dataTheme={theme}
        gameTitle={roomState.game.title}
        randwords={randWords}
        moves={moves}
        isBingoed={isBingoed}
        dauberedTiles={dauberedTiles}
        handleTileClick={handleTileClick}
      />
      <div className='game-actions'>
        <Link className='button button-secondary' to='/'>Leave room</Link>
      </div>
    </>
  );
}

RoomGame.propTypes = {
  roomState: PropTypes.shape({
    game: PropTypes.shape({
      title: PropTypes.string.isRequired,
      phrases: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    players: PropTypes.array.isRequired,
    winners: PropTypes.array.isRequired,
    startedAt: PropTypes.number.isRequired,
  }).isRequired,
  playerName: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
  onBingo: PropTypes.func.isRequired,
};
