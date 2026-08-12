/** @jest-environment jsdom */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import JoinRoomForm from '../Components/JoinRoomForm';

describe('JoinRoomForm', () => {
  test('normalizes a room code and navigates to the room', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path='/' element={<JoinRoomForm />} />
          <Route path='/room/:roomCode' element={<h1>Room destination</h1>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Room code'), { target: { value: 'abc234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Join room' }));

    expect(screen.getByRole('heading', { name: 'Room destination' })).not.toBeNull();
  });

  test('shows validation instead of navigating with an incomplete code', () => {
    render(
      <MemoryRouter>
        <JoinRoomForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Room code'), { target: { value: 'ABC' } });
    fireEvent.click(screen.getByRole('button', { name: 'Join room' }));

    expect(screen.getByRole('alert').textContent).toContain('six-character room code');
  });
});
