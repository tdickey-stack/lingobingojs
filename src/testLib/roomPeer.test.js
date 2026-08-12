/** @jest-environment jsdom */

jest.mock('peerjs', () => ({ Peer: jest.fn() }));

import { createHostedRoom, joinHostedRoom } from '../funcLib/RoomPeer';

const game = {
  title: 'Live Team Game',
  phrases: Array.from({ length: 24 }, (_, index) => `Phrase ${index + 1}`),
};

class FakeEmitter {
  constructor() {
    this.handlers = new Map();
  }

  on(eventName, handler) {
    const handlers = this.handlers.get(eventName) || [];
    this.handlers.set(eventName, [...handlers, handler]);
  }

  emit(eventName, ...args) {
    (this.handlers.get(eventName) || []).forEach((handler) => handler(...args));
  }
}

class FakeConnection extends FakeEmitter {
  constructor(peerId, metadata = {}) {
    super();
    this.peer = peerId;
    this.metadata = metadata;
    this.open = false;
    this.sent = [];
    this.closed = false;
  }

  send(message) {
    this.sent.push(message);
  }

  close() {
    this.closed = true;
    this.open = false;
  }
}

class FakePeer extends FakeEmitter {
  static instances = [];

  constructor(id = 'joining-peer') {
    super();
    this.id = id;
    this.destroyed = false;
    this.connection = null;
    FakePeer.instances.push(this);
  }

  connect(peerId, options) {
    this.connectedPeerId = peerId;
    this.connectionOptions = options;
    this.connection = new FakeConnection(peerId);
    return this.connection;
  }

  destroy() {
    this.destroyed = true;
  }
}

describe('PeerJS room transport', () => {
  beforeEach(() => {
    FakePeer.instances = [];
  });

  test('host publishes joins, start state, and Bingo winners', () => {
    const states = [];
    const controller = createHostedRoom({
      roomCode: 'ABC234',
      hostName: 'Taylor',
      game,
      onReady: jest.fn(),
      onState: (state) => states.push(state),
      onError: jest.fn(),
      PeerConstructor: FakePeer,
    });
    const hostPeer = FakePeer.instances[0];
    hostPeer.emit('open');

    const playerConnection = new FakeConnection('peer-1', { name: 'Morgan' });
    hostPeer.emit('connection', playerConnection);
    playerConnection.open = true;
    playerConnection.emit('open');
    expect(states.at(-1).players.map((player) => player.name)).toEqual(['Taylor', 'Morgan']);

    controller.start();
    expect(states.at(-1).status).toBe('playing');
    playerConnection.emit('data', { type: 'bingo' });
    expect(states.at(-1).winners[0].name).toBe('Morgan');

    controller.reportBingo();
    expect(states.at(-1).winners.map((winner) => winner.name)).toEqual(['Morgan', 'Taylor']);
    expect(playerConnection.sent.at(-1).type).toBe('room-state');

    controller.destroy();
    expect(hostPeer.destroyed).toBe(true);
  });

  test('joining player receives state and reports Bingo to the host', () => {
    const states = [];
    const connected = jest.fn();
    const controller = joinHostedRoom({
      roomCode: 'ABC234',
      playerName: 'Morgan',
      onConnected: connected,
      onState: (state) => states.push(state),
      onError: jest.fn(),
      PeerConstructor: FakePeer,
    });
    const peer = FakePeer.instances[0];
    peer.emit('open');
    expect(peer.connectionOptions.metadata).toEqual({ name: 'Morgan' });

    peer.connection.open = true;
    peer.connection.emit('open');
    expect(connected).toHaveBeenCalledWith('joining-peer');

    const roomState = {
      version: 1,
      status: 'lobby',
      game,
      players: [
        { id: 'host', name: 'Taylor', isHost: true },
        { id: 'joining-peer', name: 'Morgan', isHost: false },
      ],
      winners: [],
      startedAt: null,
    };
    peer.connection.emit('data', { type: 'room-state', state: roomState });
    expect(states.at(-1).players).toHaveLength(2);

    controller.reportBingo();
    expect(peer.connection.sent).toContainEqual({ type: 'bingo' });
  });
});
