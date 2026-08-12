/** @jest-environment jsdom */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import CreateGame from '../Components/CreateGame';

function TestShell() {
  return <Outlet context={['dark']} />;
}

function renderCreateGame() {
  render(
    <MemoryRouter initialEntries={['/create']}>
      <Routes>
        <Route path='/' element={<TestShell />}>
          <Route path='create' element={<CreateGame />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('CreateGame', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete global.fetch;
  });

  test('shows clear validation for an empty game', () => {
    renderCreateGame();

    fireEvent.click(screen.getByRole('button', { name: 'Create game link' }));

    expect(screen.getByRole('alert').textContent).toContain('Give your game a short title.');
  });

  test('creates a short stored-game link for 24 unique phrases', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'AbCdEf123456', path: '/g/AbCdEf123456' }),
    });
    renderCreateGame();
    const phrases = Array.from({ length: 24 }, (_, index) => `Phrase ${index + 1}`);

    fireEvent.change(screen.getByLabelText('Game title'), {
      target: { value: 'Team Night' }
    });
    fireEvent.change(screen.getByLabelText('Phrases'), {
      target: { value: phrases.join('\n') }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create game link' }));

    const startLink = await screen.findByRole('link', { name: 'Play solo' });
    const url = new URL(startLink.getAttribute('href'));
    expect(url.pathname).toBe('/g/AbCdEf123456');
    expect(url.search).toBe('');
    expect(global.fetch).toHaveBeenCalledWith('/api/games', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ title: 'Team Night', phrases }),
    }));
    expect(screen.getByText('24 / 24')).not.toBeNull();
    expect(screen.getByRole('link', { name: 'Host a live room' }).getAttribute('href')).toBe('/host/AbCdEf123456');
  });

  test('shows a server error instead of creating a broken link', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Game storage is temporarily unavailable.' }),
    });
    renderCreateGame();
    const phrases = Array.from({ length: 24 }, (_, index) => `Phrase ${index + 1}`);

    fireEvent.change(screen.getByLabelText('Game title'), { target: { value: 'Team Night' } });
    fireEvent.change(screen.getByLabelText('Phrases'), { target: { value: phrases.join('\n') } });
    fireEvent.click(screen.getByRole('button', { name: 'Create game link' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Game storage is temporarily unavailable.');
    expect(screen.queryByRole('link', { name: 'Play solo' })).toBeNull();
  });
});
