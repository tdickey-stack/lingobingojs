import { Peer } from 'peerjs';
import {
  addRoomPlayer,
  createRoomState,
  normalizePlayerName,
  recordRoomWinner,
  removeRoomPlayer,
  roomPeerId,
  startRoom,
  validateRoomState,
} from './RoomProtocol';

function send(connection, message) {
  if (connection?.open) {
    connection.send(message);
  }
}

export function createHostedRoom({
  roomCode,
  hostName,
  game,
  onReady,
  onState,
  onError,
  PeerConstructor = Peer,
}) {
  let state = createRoomState({ game, hostName });
  let destroyed = false;
  const connections = new Map();
  const peer = new PeerConstructor(roomPeerId(roomCode));

  function publishState() {
    onState(state);
    connections.forEach((connection) => send(connection, { type: 'room-state', state }));
  }

  function rejectConnection(connection, message) {
    const deliverError = () => {
      send(connection, { type: 'room-error', message });
      setTimeout(() => connection.close(), 80);
    };
    if (connection.open) {
      deliverError();
    } else {
      connection.on('open', deliverError);
    }
  }

  function removeConnection(playerId) {
    connections.delete(playerId);
    const nextState = removeRoomPlayer(state, playerId);
    if (nextState.players.length !== state.players.length) {
      state = nextState;
      publishState();
    }
  }

  peer.on('open', () => {
    if (!destroyed) {
      onReady();
      publishState();
    }
  });

  peer.on('connection', (connection) => {
    const name = normalizePlayerName(connection.metadata?.name);

    connection.on('open', () => {
      if (destroyed) {
        connection.close();
        return;
      }
      const addition = addRoomPlayer(state, { id: connection.peer, name });
      if (addition.error) {
        rejectConnection(connection, addition.error);
        return;
      }
      state = addition.state;
      connections.set(connection.peer, connection);
      publishState();
    });

    connection.on('data', (message) => {
      if (message?.type !== 'bingo' || state.status !== 'playing') {
        return;
      }
      const nextState = recordRoomWinner(state, connection.peer);
      if (nextState !== state) {
        state = nextState;
        publishState();
      }
    });

    connection.on('close', () => {
      removeConnection(connection.peer);
    });

    connection.on('error', () => {
      removeConnection(connection.peer);
    });
  });

  peer.on('error', (error) => {
    if (!destroyed) {
      onError(error?.type === 'unavailable-id'
        ? 'That room code is already in use. Try creating the room again.'
        : 'The live room could not connect. Check your connection and try again.');
    }
  });

  peer.on('disconnected', () => {
    if (!destroyed) {
      onError('The live room lost its connection. Try creating it again.');
    }
  });

  return {
    start() {
      state = startRoom(state);
      publishState();
    },
    reportBingo() {
      const nextState = recordRoomWinner(state, 'host');
      if (nextState !== state) {
        state = nextState;
        publishState();
      }
    },
    destroy() {
      destroyed = true;
      connections.forEach((connection) => connection.close());
      connections.clear();
      peer.destroy();
    },
  };
}

export function joinHostedRoom({
  roomCode,
  playerName,
  onConnected,
  onState,
  onError,
  PeerConstructor = Peer,
}) {
  let destroyed = false;
  let rejected = false;
  let connection;
  const peer = new PeerConstructor();

  peer.on('open', () => {
    connection = peer.connect(roomPeerId(roomCode), {
      reliable: true,
      metadata: { name: normalizePlayerName(playerName) },
    });

    connection.on('open', () => {
      if (!destroyed) {
        onConnected(peer.id);
      }
    });

    connection.on('data', (message) => {
      if (message?.type === 'room-error') {
        rejected = true;
        onError(message.message || 'The room could not be joined.');
        return;
      }
      if (message?.type === 'room-state') {
        const validation = validateRoomState(message.state);
        if (validation.error) {
          onError(validation.error);
        } else {
          onState(validation.value);
        }
      }
    });

    connection.on('close', () => {
      if (!destroyed && !rejected) {
        onError('The host closed the room or lost their connection.');
      }
    });

    connection.on('error', () => {
      if (!destroyed) {
        onError('The room connection failed. Check the code and try again.');
      }
    });
  });

  peer.on('error', (error) => {
    if (!destroyed) {
      onError(error?.type === 'peer-unavailable'
        ? 'We could not find that room. Check the code and try again.'
        : 'The live room could not connect. Check your connection and try again.');
    }
  });

  return {
    reportBingo() {
      send(connection, { type: 'bingo' });
    },
    destroy() {
      destroyed = true;
      connection?.close();
      peer.destroy();
    },
  };
}
