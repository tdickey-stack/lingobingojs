import { validateGamePayload } from './GamePayload';

export const ROOM_CODE_LENGTH = 6;
export const MAX_PLAYER_NAME_LENGTH = 24;
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{6}$/;
export const ROOM_PEER_PREFIX = 'cp-lingo-bingo-';
export const ROOM_START_DELAY = 1800;

export function normalizeRoomCode(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, ROOM_CODE_LENGTH);
}

export function isValidRoomCode(value) {
  return ROOM_CODE_PATTERN.test(normalizeRoomCode(value));
}

export function roomPeerId(roomCode) {
  return `${ROOM_PEER_PREFIX}${normalizeRoomCode(roomCode)}`;
}

export function generateRoomCode(cryptoSource = window.crypto) {
  const values = new Uint8Array(ROOM_CODE_LENGTH);
  cryptoSource.getRandomValues(values);
  return Array.from(values, (value) => ROOM_CODE_ALPHABET[value % ROOM_CODE_ALPHABET.length]).join('');
}

export function normalizePlayerName(value) {
  return Array.from(String(value || ''))
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code > 31 && code !== 127;
    })
    .join('')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, MAX_PLAYER_NAME_LENGTH);
}

export function createRoomState({ game, hostName }) {
  const validation = validateGamePayload(game);
  if (validation.error) {
    throw new Error(validation.error);
  }

  return {
    version: 1,
    status: 'lobby',
    game: validation.value,
    players: [{ id: 'host', name: normalizePlayerName(hostName), isHost: true }],
    winners: [],
    startedAt: null,
  };
}

export function addRoomPlayer(state, player) {
  const name = normalizePlayerName(player?.name);
  if (state.status !== 'lobby') {
    return { state, error: 'This game has already started.' };
  }
  if (!name) {
    return { state, error: 'Enter a name before joining.' };
  }
  if (state.players.some((currentPlayer) => currentPlayer.id === player.id)) {
    return { state, error: 'That player is already connected to this room.' };
  }
  if (state.players.some((currentPlayer) => currentPlayer.name.toLocaleLowerCase('en-US') === name.toLocaleLowerCase('en-US'))) {
    return { state, error: 'That name is already being used in this room.' };
  }

  return {
    state: {
      ...state,
      players: [...state.players, { id: player.id, name, isHost: false }],
    },
  };
}

export function removeRoomPlayer(state, playerId) {
  return {
    ...state,
    players: state.players.filter((player) => player.id !== playerId || player.isHost),
  };
}

export function startRoom(state, startedAt = Date.now() + ROOM_START_DELAY) {
  if (state.status !== 'lobby') {
    return state;
  }
  return { ...state, status: 'playing', startedAt };
}

export function recordRoomWinner(state, playerId, wonAt = Date.now()) {
  const player = state.players.find((currentPlayer) => currentPlayer.id === playerId);
  if (state.status !== 'playing' || !player || state.winners.some((winner) => winner.id === playerId)) {
    return state;
  }

  return {
    ...state,
    winners: [...state.winners, { id: player.id, name: player.name, wonAt }],
  };
}

export function validateRoomState(value) {
  const gameValidation = validateGamePayload(value?.game);
  const playersAreValid = Array.isArray(value?.players) && value.players.every((player) => (
    typeof player?.id === 'string' &&
    normalizePlayerName(player.name) === player.name &&
    typeof player.isHost === 'boolean'
  ));
  const winnersAreValid = Array.isArray(value?.winners) && value.winners.every((winner) => (
    typeof winner?.id === 'string' &&
    normalizePlayerName(winner.name) === winner.name &&
    Number.isFinite(winner.wonAt)
  ));

  if (
    value?.version !== 1 ||
    !['lobby', 'playing'].includes(value.status) ||
    gameValidation.error ||
    !playersAreValid ||
    !winnersAreValid ||
    (value.status === 'playing' && !Number.isFinite(value.startedAt))
  ) {
    return { error: 'The room sent invalid game data.' };
  }

  return { value: { ...value, game: gameValidation.value } };
}
