/** @jest-environment jsdom */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import WinnerCelebration from '../Components/WinnerCelebration';

test('makes the room winner prominent and dismissible', () => {
  const onClose = jest.fn();
  const { container } = render(
    <WinnerCelebration winnerName='Morgan' onClose={onClose} />
  );

  expect(screen.getByRole('dialog').textContent).toContain('Morgan got Bingo!');
  expect(container.querySelectorAll('.confetti-piece')).toHaveLength(44);
  expect(screen.getByRole('button', { name: 'Keep playing' })).toBe(document.activeElement);

  fireEvent.click(screen.getByRole('button', { name: 'Keep playing' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('allows the winner dialog to be dismissed with Escape', () => {
  const onClose = jest.fn();
  render(<WinnerCelebration winnerName='Taylor' onClose={onClose} />);

  fireEvent.keyDown(window, { key: 'Escape' });
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('supports the single-player winner message', () => {
  render(
    <WinnerCelebration
      winnerName='You'
      note='Great job!'
      onClose={() => {}}
    />
  );

  expect(screen.getByRole('dialog').textContent).toContain('You got Bingo!');
  expect(screen.getByRole('dialog').textContent).toContain('Great job!');
});
