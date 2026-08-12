import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Gameboard from './Gameboard.js';
import WinnerCelebration from './WinnerCelebration.js';
import randomGen from '../funcLib/RandomGen.js';
import wordProcessor from '../funcLib/WordProcessor.js';
import wordImporter from '../funcLib/WordImporter.js';
import PlayAgainButton from './PlayAgainButton.js';
import checkForBingo from '../funcLib/CheckForBingo';
import { Link, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { validateGamePayload } from '../funcLib/GamePayload';

function getStartingTiles() {
  const tiles = Array(25).fill(false);
  tiles[12] = true;
  return tiles;
}

export default function GameSession() {
  const [moves, setMoves] = useState(0);
  const [isBingoed, setBingoed] = useState(false);
  const [dauberedTiles, setDauberedTiles] = useState(getStartingTiles);
  const [gamesStarted, setGamesStarted] = useState(1);
  const [randWords, setRandWords] = useState([]);
  const [gameTitle, setGameTitle] = useState('Lingo Bingo');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showWinnerCelebration, setShowWinnerCelebration] = useState(false);
  const { gameId, gameboardId } = useParams();
  const [searchParams] = useSearchParams();
  const [theme] = useOutletContext();

  const legacyTitle = searchParams.get('title');
  const legacyPhrases = searchParams.get('phrases');
  const legacyGame = useMemo(() => {
    const isPresent = legacyTitle !== null || legacyPhrases !== null;
    if (!isPresent) {
      return { isPresent: false };
    }

    try {
      const validation = validateGamePayload({
        title: legacyTitle,
        phrases: JSON.parse(legacyPhrases || '[]'),
      });
      return validation.error
        ? { isPresent: true, error: validation.error }
        : { isPresent: true, ...validation.value };
    } catch {
      return { isPresent: true, error: 'The phrase list could not be read.' };
    }
  }, [legacyPhrases, legacyTitle]);

  function handleTileClick(e) {
    let id = e.currentTarget.id;
    if (id !== null) {
      dauberTile(id);
    }
  }

  function dauberTile(id) {
    const numericId = Number(id);
    if (numericId === 12 || dauberedTiles[numericId] === true) {
      return;
    }

    setDauberedTiles((currentTiles) => {
      const nextTiles = [...currentTiles];
      nextTiles[numericId] = true;
      return nextTiles;
    });
    setMoves((currentMoves) => currentMoves + 1);
  }

  function restartGame() {
    setMoves(0);
    setBingoed(false);
    setShowWinnerCelebration(false);
    setDauberedTiles(getStartingTiles());
    setGamesStarted((currentCount) => currentCount + 1);
  }

  useEffect(() => {
    setBingoed(checkForBingo(dauberedTiles, moves));
  }, [dauberedTiles, moves]);

  useEffect(() => {
    if (isBingoed) {
      setShowWinnerCelebration(true);
    }
  }, [isBingoed]);

  const closeWinnerCelebration = useCallback(() => setShowWinnerCelebration(false), []);

  useEffect(() => {
    let isCancelled = false;

    async function loadGame() {
      const randInts = randomGen(24);
      setIsLoading(true);
      setLoadError('');
      setRandWords([]);

      try {
        if (gameId !== undefined) {
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
          if (!isCancelled) {
            setGameTitle(validation.value.title);
            setRandWords(wordProcessor(validation.value.phrases, randInts));
          }
          return;
        }

        if (gameboardId !== undefined) {
          const config = {
            method: 'get',
            baseURL: process.env.REACT_APP_API_SERVER,
            url: `${process.env.REACT_APP_GAMEBOARD_URI}${gameboardId}`,
          };

          try {
            const response = await axios(config);
            if (!isCancelled) {
              setGameTitle('Lingo Bingo');
              setRandWords(wordProcessor(response.data, randInts));
            }
          } catch {
            if (!isCancelled) {
              setGameTitle('Lingo Bingo');
              importDefaultWords(randInts);
            }
          }
          return;
        }

        if (legacyGame.isPresent) {
          if (legacyGame.error) {
            throw new Error(`This shared game link is incomplete or invalid. ${legacyGame.error}`);
          }
          if (!isCancelled) {
            setGameTitle(legacyGame.title);
            setRandWords(wordProcessor(legacyGame.phrases, randInts));
          }
          return;
        }

        if (!isCancelled) {
          setGameTitle('Lingo Bingo');
          importDefaultWords(randInts);
        }
      } catch (error) {
        if (!isCancelled) {
          setLoadError(error.message || 'This game could not be loaded.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadGame();
    return () => {
      isCancelled = true;
    };
  }, [gameId, gameboardId, gamesStarted, legacyGame]);

  function importDefaultWords(randInts) {
    const words = wordImporter();
    const processedWords = wordProcessor(words, randInts);
    setRandWords(processedWords);
  }

  return (
    <section className='page-shell game-page' id='game-session' data-theme={theme}>
      <div className='game-panel'>
        {isLoading ? (
          <div className='game-status' role='status' aria-live='polite'>
            <span className='status-spinner' aria-hidden='true' />
            <span className='eyebrow'>Just a moment</span>
            <h1>Loading your game…</h1>
            <p>We’re getting the board ready for you.</p>
          </div>
        ) : loadError ? (
          <div className='game-status is-error' role='alert'>
            <span className='status-icon' aria-hidden='true'>!</span>
            <span className='eyebrow'>Game unavailable</span>
            <h1>We couldn’t open this board</h1>
            <p>{loadError}</p>
            <div className='game-actions'>
              <Link className='button button-primary' to='/create'>Create a new game</Link>
              <Link className='button button-secondary' to='/play'>Play the default game</Link>
            </div>
          </div>
        ) : (
          <>
            {showWinnerCelebration && (
              <WinnerCelebration
                winnerName='You'
                note='Great job! Restart whenever you’re ready for another board.'
                onClose={closeWinnerCelebration}
              />
            )}
            <Gameboard
              dataTheme={theme}
              gameTitle={gameTitle}
              randwords={randWords}
              moves={moves}
              isBingoed={isBingoed}
              dauberedTiles={dauberedTiles}
              handleTileClick={handleTileClick}
            />
            <div className='game-actions'>
              <PlayAgainButton
                isBingoed={isBingoed}
                handleClick={restartGame}
                dataTheme={theme}
              />
              {gameId && <Link className='button button-primary' to={`/host/${gameId}`}>Host live game</Link>}
              <Link className='button button-secondary' to='/create'>Create a game</Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
