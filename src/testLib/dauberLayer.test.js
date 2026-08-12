/** @jest-environment jsdom */

import React from 'react';
import { render, screen } from '@testing-library/react';
import DauberLayer from '../Components/DauberLayer';

function renderTile(word) {
  render(
    <DauberLayer
      word={word}
      styleClass=''
      dataTheme='dark'
      handleTileClick={() => {}}
      id={1}
      isFree={false}
    />
  );

  return screen.getByRole('button');
}

test('uses the default tile typography for short phrases', () => {
  expect(renderTile('Short phrase').classList.contains('has-long-label')).toBe(false);
});

test('reduces tile typography for long phrases', () => {
  expect(renderTile('Makes a straightforward answer more complicated').classList.contains('has-extra-long-label')).toBe(true);
});
