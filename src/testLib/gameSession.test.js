/** @jest-environment jsdom */

import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import GameSession from '../Components/GameSession';

jest.mock('axios', () => jest.fn());

const phrases = Array.from({ length: 24 }, (_, index) => `Stored phrase ${index + 1}`);

function TestShell() {
  return <Outlet context={['dark']} />;
}

function renderGame(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path='/' element={<TestShell />}>
          <Route path='g/:gameId' element={<GameSession />} />
          <Route path='play' element={<GameSession />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('GameSession stored games', () => {
  afterEach(() => {
    delete global.fetch;
  });

  test('loads a stored game from its short ID', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: 1, title: 'Stored Team Game', phrases }),
    });

    renderGame('/g/AbCdEf123456');

    expect(await screen.findByRole('heading', { name: 'Stored Team Game' })).not.toBeNull();
    expect(global.fetch).toHaveBeenCalledWith('/api/games/AbCdEf123456', {
      headers: { Accept: 'application/json' },
    });
    expect(screen.getByLabelText('Lingo Bingo board')).not.toBeNull();
  });

  test('shows a clear error when a stored game does not exist', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'This game could not be found.' }),
    });

    renderGame('/g/Missing12345');

    expect(await screen.findByRole('heading', { name: 'We couldn’t open this board' })).not.toBeNull();
    expect(screen.getByRole('alert').textContent).toContain('This game could not be found.');
    expect(screen.queryByLabelText('Lingo Bingo board')).toBeNull();
  });

  test('keeps existing long share links working', async () => {
    const params = new URLSearchParams({
      title: 'Legacy Team Game',
      phrases: JSON.stringify(phrases),
    });

    renderGame(`/play?${params.toString()}`);

    expect(await screen.findByRole('heading', { name: 'Legacy Team Game' })).not.toBeNull();
    expect(screen.getByLabelText('Lingo Bingo board')).not.toBeNull();
  });

  test('shows the winner celebration on a single-player board', async () => {
    renderGame('/play');

    const board = await screen.findByLabelText('Lingo Bingo board');
    const tiles = within(board).getAllByRole('button');
    tiles.slice(0, 5).forEach((tile) => fireEvent.click(tile));

    expect((await screen.findByRole('dialog')).textContent).toContain('You got Bingo!');
  });
});
