import React from 'react';
import DauberLayer from './DauberLayer';

export default function RowBuilder(
  randWords,
  dataTheme,
  dauberedTiles,
  handleTileClick
) {
  return Array.from({ length: 25 }, (_, idx) => (
    <DauberLayer
      key={idx}
      id={idx}
      styleClass={dauberedTiles[idx] ? 'is-selected' : ''}
      dataTheme={dataTheme}
      word={idx === 12 ? 'FREE SPACE' : randWords[idx]}
      isFree={idx === 12}
      handleTileClick={handleTileClick}
    />
  ));
}
