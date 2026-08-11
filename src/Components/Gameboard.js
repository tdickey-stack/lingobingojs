import React from 'react';
import PropTypes from 'prop-types';
import BingoAnnouncer from './BingoAnnouncer';
import rowBuilder from './RowBuilder';

export default function Gameboard(props) {
  const cells = rowBuilder(
    props.randwords,
    props.dataTheme,
    props.dauberedTiles,
    props.handleTileClick
  );

  return (
    <div className='gameboard-wrap'>
      <div className='game-heading'>
        <div>
          <span className='eyebrow'>Live game</span>
          <h1>{props.gameTitle}</h1>
          <p>Tap each phrase as you hear it. Five in a row wins.</p>
        </div>
        <div className='move-pill' aria-live='polite'>
          <strong>{props.moves}</strong>
          <span>{props.moves === 1 ? 'phrase' : 'phrases'} marked</span>
        </div>
      </div>

      {props.isBingoed && (
        <BingoAnnouncer
          classname='winner-banner'
          text={`Bingo in ${props.moves} marked phrases!`}
        />
      )}

      <div className='bingo-grid' aria-label='Lingo Bingo board'>
        {cells}
      </div>
      <p className='board-note'>The center free space is already marked for you.</p>
    </div>
  );
}

Gameboard.propTypes = {
  randwords: PropTypes.array,
  moves: PropTypes.number,
  dauberedTiles: PropTypes.array,
  handleTileClick: PropTypes.func,
  isBingoed: PropTypes.bool,
  dataTheme: PropTypes.string,
  gameTitle: PropTypes.string
};
