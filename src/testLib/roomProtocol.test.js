/** @jest-environment jsdom */

import {
  addRoomPlayer,
  createRoomState,
  generateRoomCode,
  isValidRoomCode,
  normalizePlayerName,
  normalizeRoomCode,
  recordRoomWinner,
  removeRoomPlayer,
  startRoom,
  validateRoomState,
} from '../funcLib/RoomProtocol';

const game = {
  title: 'Live Team Game',
  phrases: Array.from({ length: 24 }, (_, index) => `Phrase ${index + 1}`),
};

describe('room protocol', () => {
  test('normalizes room codes and rejects ambiguous characters', () => {
    expect(normalizeRoomCode(' ab-c23! ')).toBe('ABC23');
    expect(isValidRoomCode('ABC234')).toBe(true);
    expect(isValidRoomCode('ABC01I')).toBe(false);
  });

  test('generates a six-character code from the readable alphabet', () => {
    const cryptoSource = {
      getRandomValues(values) {
        values.set([0, 1, 2, 3, 4, 5]);
        return values;
      },
    };

    expect(generateRoomCode(cryptoSource)).toBe('ABCDEF');
  });

  test('tracks lobby players, the synchronized start, and winners', () => {
    let state = createRoomState({ game, hostName: '  Taylor  ' });
    expect(state.players[0].name).toBe('Taylor');

    const joined = addRoomPlayer(state, { id: 'peer-1', name: '  Morgan  ' });
    expect(joined.error).toBeUndefined();
    state = joined.state;
    expect(state.players.map((player) => player.name)).toEqual(['Taylor', 'Morgan']);

    expect(addRoomPlayer(state, { id: 'peer-2', name: 'morgan' }).error).toMatch(/already being used/i);
    state = startRoom(state, 12345);
    expect(state.startedAt).toBe(12345);
    expect(addRoomPlayer(state, { id: 'peer-2', name: 'Jordan' }).error).toMatch(/already started/i);

    state = recordRoomWinner(state, 'peer-1', 54321);
    expect(state.winners).toEqual([{ id: 'peer-1', name: 'Morgan', wonAt: 54321 }]);
    expect(recordRoomWinner(state, 'peer-1', 60000)).toBe(state);
    expect(validateRoomState(state).error).toBeUndefined();

    state = removeRoomPlayer(state, 'peer-1');
    expect(state.players).toHaveLength(1);
  });

  test('cleans player names before they enter room state', () => {
    expect(normalizePlayerName('  Mike\u0000   Lewis  ')).toBe('Mike Lewis');
  });
});
