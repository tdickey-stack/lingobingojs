import React from 'react';
import PropTypes from 'prop-types';
import WordTile from './WordTile.js';

export default function DauberLayer(props) {
  const phraseLength = (props.word || '').trim().length;
  const phraseLengthClass = phraseLength > 36
    ? 'has-extra-long-label'
    : phraseLength > 24
      ? 'has-long-label'
      : '';

  return (
    <button
      className={`bingo-square ${props.styleClass} ${props.isFree ? 'is-free' : ''} ${phraseLengthClass}`.trim()}
      data-theme={props.dataTheme}
      onClick={props.handleTileClick}
      id={props.id}
      type='button'
      aria-pressed={props.styleClass === 'is-selected'}
      aria-label={props.isFree ? 'Free space, already marked' : `${props.word || 'Loading phrase'}, ${props.styleClass === 'is-selected' ? 'marked' : 'not marked'}`}
      disabled={props.isFree || !props.word}
    >
      <WordTile
        word={props.word}
      />
      <span className='square-check' aria-hidden='true'>✓</span>
    </button>
  );
}
DauberLayer.propTypes = {
  word: PropTypes.string,
  styleClass: PropTypes.string,
  dataTheme: PropTypes.string,
  handleTileClick: PropTypes.func,
  id: PropTypes.number,
  isFree: PropTypes.bool
};
