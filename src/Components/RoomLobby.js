import React from 'react';
import PropTypes from 'prop-types';

export default function RoomLobby({
  gameTitle,
  roomCode,
  players,
  isHost,
  shareUrl,
  copyState,
  onCopy,
  onStart,
}) {
  return (
    <div className='room-lobby'>
      <div className='room-lobby-heading'>
        <div>
          <span className='eyebrow'>Live game lobby</span>
          <h1>{gameTitle}</h1>
          <p>{isHost ? 'Share the room code, then start when everyone is here.' : 'You’re in. The host will start the game when everyone is ready.'}</p>
        </div>
        <div className='room-code-badge' aria-label={`Room code ${roomCode}`}>
          <small>Room code</small>
          <strong>{roomCode}</strong>
        </div>
      </div>

      {isHost && (
        <div className='room-share-card'>
          <div>
            <strong>Invite your players</strong>
            <small>Send the link or let them enter the room code from the homepage.</small>
          </div>
          <div className='copy-control'>
            <input value={shareUrl} readOnly aria-label='Live room link' onFocus={(event) => event.target.select()} />
            <button className='button button-secondary' type='button' onClick={onCopy}>{copyState}</button>
          </div>
        </div>
      )}

      <section className='player-panel' aria-labelledby='player-list-title'>
        <div className='player-panel-heading'>
          <div>
            <span className='eyebrow'>Players</span>
            <h2 id='player-list-title'>{players.length} {players.length === 1 ? 'person' : 'people'} ready</h2>
          </div>
          <span className='connection-dot'>Connected</span>
        </div>
        <ul className='player-list'>
          {players.map((player) => (
            <li key={player.id}>
              <span className='player-avatar' aria-hidden='true'>{player.name.slice(0, 1).toUpperCase()}</span>
              <strong>{player.name}</strong>
              {player.isHost && <small>Host</small>}
            </li>
          ))}
        </ul>
      </section>

      <div className='room-lobby-actions'>
        {isHost ? (
          <button className='button button-primary' type='button' onClick={onStart}>Start game</button>
        ) : (
          <span className='waiting-message'><span aria-hidden='true' /> Waiting for the host…</span>
        )}
      </div>
    </div>
  );
}

RoomLobby.propTypes = {
  gameTitle: PropTypes.string.isRequired,
  roomCode: PropTypes.string.isRequired,
  players: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    isHost: PropTypes.bool.isRequired,
  })).isRequired,
  isHost: PropTypes.bool.isRequired,
  shareUrl: PropTypes.string,
  copyState: PropTypes.string,
  onCopy: PropTypes.func,
  onStart: PropTypes.func,
};
