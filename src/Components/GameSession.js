import React, { useEffect, useMemo, useState } from 'react';
import Gameboard from './Gameboard.js';
import randomGen from '../funcLib/RandomGen.js';
import wordProcessor from '../funcLib/WordProcessor.js';
import wordImporter from '../funcLib/WordImporter.js';
import PlayAgainButton from './PlayAgainButton.js';
import checkForBingo from '../funcLib/CheckForBingo';
import { Link, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

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
  let { gameboardId } = useParams();
  const [searchParams] = useSearchParams();
  const [theme] = useOutletContext();

  const gameTitle = searchParams.get('title')?.trim() || 'Lingo Bingo';
  const customWords = useMemo(() => {
    try {
      const phrases = JSON.parse(searchParams.get('phrases') || '[]');
      return Array.isArray(phrases) && phrases.length === 24
        ? phrases.filter((phrase) => typeof phrase === 'string')
        : [];
    } catch {
      return [];
    }
  }, [searchParams]);

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
    setDauberedTiles(getStartingTiles());
    setGamesStarted((currentCount) => currentCount + 1);
  }

  useEffect(() => {
    setBingoed(checkForBingo(dauberedTiles, moves));
  }, [dauberedTiles, moves]);

  useEffect(() => {
    const randInts = randomGen(24);

    if (gameboardId !== undefined) {
      const urlWithId = `${process.env.REACT_APP_GAMEBOARD_URI}${gameboardId}`;
      const apiServer = process.env.REACT_APP_API_SERVER;

      const config = {
        method: 'get',
        baseURL: apiServer,
        url: urlWithId,
      };

      axios(config)
        .then((res) => res.data)
        .then((words) => wordProcessor(words, randInts))
        .then((processedWords) => setRandWords(processedWords))
        .catch(() => {
          importDefaultWords(randInts);
        });
    } else if (customWords.length === 24) {
      setRandWords(wordProcessor(customWords, randInts));
    } else {
      importDefaultWords(randInts);
    }
  }, [customWords, gameboardId, gamesStarted]);

  function importDefaultWords(randInts) {
    const words = wordImporter();
    const processedWords = wordProcessor(words, randInts);
    setRandWords(processedWords);
  }

  return (
    <section className='page-shell game-page' id='game-session' data-theme={theme}>
      <div className='game-panel'>
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
          <Link className='button button-secondary' to='/create'>Create a game</Link>
        </div>
      </div>
    </section>
  );
}
