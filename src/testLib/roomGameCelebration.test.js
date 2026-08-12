/** @jest-environment jsdom */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RoomGame from '../Components/RoomGame';

jest.mock('../Components/Gameboard', () => () => <div>Lingo Bingo board</div>);
jest.mock('../funcLib/CheckForBingo', () => () => false);
jest.mock('../funcLib/RandomGen', () => () => []);
jest.mock('../funcLib/WordProcessor', () => () => []);

const baseRoomState = {
  game: {
    title: 'Team Bingo',
    phrases: Array.from({ length: 24 }, (_, index) => `Phrase ${index + 1}`),
  },
  players: [{ id: 'host', name: 'Taylor' }, { id: 'player', name: 'Morgan' }],
  winners: [{ id: 'player', name: 'Morgan', wonAt: 100 }],
  startedAt: Date.now() - 1000,
};

function game(roomState) {
  return (
    <MemoryRouter>
      <RoomGame
        roomState={roomState}
        playerName='Taylor'
        theme='dark'
        onBingo={() => {}}
      />
    </MemoryRouter>
  );
}

test('celebrates each new room winner', async () => {
  const view = render(game(baseRoomState));

  expect((await screen.findByRole('dialog')).textContent).toContain('Morgan got Bingo!');
  fireEvent.click(screen.getByRole('button', { name: 'Keep playing' }));
  expect(screen.queryByRole('dialog')).toBeNull();

  view.rerender(game({
    ...baseRoomState,
    winners: [...baseRoomState.winners, { id: 'host', name: 'Taylor', wonAt: 200 }],
  }));

  expect((await screen.findByRole('dialog')).textContent).toContain('Taylor got Bingo!');
});
