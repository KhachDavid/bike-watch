import { InvestmentType, Street } from '../../types';

export const GAME_ACTION_TYPES = {
  INITIALIZE_GAME: 'INITIALIZE_GAME',
  LOAD_STREETS_DATA: 'LOAD_STREETS_DATA',
  SELECT_STREET: 'SELECT_STREET',
  SELECT_INVESTMENT: 'SELECT_INVESTMENT',
  APPLY_INVESTMENT: 'APPLY_INVESTMENT',
  NEXT_TURN: 'NEXT_TURN',
  RESET_GAME: 'RESET_GAME',
  UPDATE_STREET_STATS: 'UPDATE_STREET_STATS',
  SIMULATE_RANDOM_EVENTS: 'SIMULATE_RANDOM_EVENTS',
} as const;

export const initializeGame = () => ({
  type: GAME_ACTION_TYPES.INITIALIZE_GAME,
});

export const selectStreet = (streetId: number) => ({
  type: GAME_ACTION_TYPES.SELECT_STREET,
  payload: streetId,
});

export const selectInvestment = (investmentType: string) => ({
  type: GAME_ACTION_TYPES.SELECT_INVESTMENT,
  payload: investmentType,
});

export const applyInvestment = () => ({
  type: GAME_ACTION_TYPES.APPLY_INVESTMENT,
});

export const nextTurn = () => ({
  type: GAME_ACTION_TYPES.NEXT_TURN,
});

export const resetGame = () => ({
  type: GAME_ACTION_TYPES.RESET_GAME,
});

export const updateStreetStats = (streetId: number, investment: InvestmentType) => ({
  type: GAME_ACTION_TYPES.UPDATE_STREET_STATS,
  payload: { streetId, investment },
});

export const simulateRandomEvents = () => ({
  type: GAME_ACTION_TYPES.SIMULATE_RANDOM_EVENTS,
});

export const loadStreetsData = (streets: Street[]) => ({
  type: GAME_ACTION_TYPES.LOAD_STREETS_DATA,
  payload: streets,
});