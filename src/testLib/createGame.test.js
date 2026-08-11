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
  test('shows clear validation for an empty game', () => {
    renderCreateGame();

    fireEvent.click(screen.getByRole('button', { name: 'Create game link' }));

    expect(screen.getByRole('alert').textContent).toContain('Give your game a short title.');
  });

  test('creates a shareable play link for 24 unique phrases', () => {
    renderCreateGame();
    const phrases = Array.from({ length: 24 }, (_, index) => `Phrase ${index + 1}`);

    fireEvent.change(screen.getByLabelText('Game title'), {
      target: { value: 'Team Night' }
    });
    fireEvent.change(screen.getByLabelText('Phrases'), {
      target: { value: phrases.join('\n') }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create game link' }));

    const startLink = screen.getByRole('link', { name: 'Start this game' });
    const url = new URL(startLink.getAttribute('href'));
    expect(url.pathname).toBe('/play');
    expect(url.searchParams.get('title')).toBe('Team Night');
    expect(JSON.parse(url.searchParams.get('phrases'))).toEqual(phrases);
    expect(screen.getByText('24 / 24')).not.toBeNull();
  });
});
