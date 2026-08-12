import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { isValidRoomCode, normalizeRoomCode } from '../funcLib/RoomProtocol';

export default function JoinRoomForm({ compact = false }) {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const normalizedCode = normalizeRoomCode(roomCode);
    if (!isValidRoomCode(normalizedCode)) {
      setError('Enter the six-character room code from your host.');
      return;
    }
    navigate(`/room/${normalizedCode}`);
  }

  return (
    <form className={compact ? 'room-code-form is-compact' : 'room-code-form'} onSubmit={handleSubmit} noValidate>
      <label htmlFor={compact ? 'room-code-compact' : 'room-code'}>Room code</label>
      <div className='room-code-control'>
        <input
          id={compact ? 'room-code-compact' : 'room-code'}
          value={roomCode}
          inputMode='text'
          autoCapitalize='characters'
          autoComplete='off'
          maxLength='6'
          placeholder='ABC234'
          onChange={(event) => {
            setRoomCode(normalizeRoomCode(event.target.value));
            setError('');
          }}
          aria-describedby={error ? 'room-code-error' : undefined}
        />
        <button className='button button-primary' type='submit'>Join room</button>
      </div>
      {error && <small className='room-code-error' id='room-code-error' role='alert'>{error}</small>}
    </form>
  );
}

JoinRoomForm.propTypes = {
  compact: PropTypes.bool,
};
