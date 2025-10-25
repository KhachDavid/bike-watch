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
  TOGGLE_PLACEMENT_MODE: 'TOGGLE_PLACEMENT_MODE',
  PLACE_INVESTMENT: 'PLACE_INVESTMENT',
  REMOVE_INVESTMENT: 'REMOVE_INVESTMENT',
  // Legacy camera actions (kept for compatibility)
  TOGGLE_CAMERA_MODE: 'TOGGLE_CAMERA_MODE',
  PLACE_CAMERA: 'PLACE_CAMERA',
  REMOVE_CAMERA: 'REMOVE_CAMERA',
  // Detective marketplace
  MAKE_OFFER_TO_DETECTIVE: 'MAKE_OFFER_TO_DETECTIVE',
  FIRE_DETECTIVE: 'FIRE_DETECTIVE',
  REFRESH_MARKETPLACE: 'REFRESH_MARKETPLACE',
  // Vandalism
  DISMISS_VANDALISM_ALERT: 'DISMISS_VANDALISM_ALERT',
  REPAIR_INVESTMENT: 'REPAIR_INVESTMENT',
  REMOVE_DAMAGED_INVESTMENT: 'REMOVE_DAMAGED_INVESTMENT',
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

export const toggleCameraMode = () => ({
  type: GAME_ACTION_TYPES.TOGGLE_CAMERA_MODE,
});

export const placeCamera = (latitude: number, longitude: number) => ({
  type: GAME_ACTION_TYPES.PLACE_CAMERA,
  payload: { latitude, longitude },
});

export const removeCamera = (cameraId: string) => ({
  type: GAME_ACTION_TYPES.REMOVE_CAMERA,
  payload: cameraId,
});

export const togglePlacementMode = () => ({
  type: GAME_ACTION_TYPES.TOGGLE_PLACEMENT_MODE,
});

export const placeInvestment = (latitude: number, longitude: number, patrolFrequency?: 'low' | 'medium' | 'high') => ({
  type: GAME_ACTION_TYPES.PLACE_INVESTMENT,
  payload: { latitude, longitude, patrolFrequency },
});

export const removeInvestment = (investmentId: string) => ({
  type: GAME_ACTION_TYPES.REMOVE_INVESTMENT,
  payload: investmentId,
});

export const makeOfferToDetective = (detectiveId: string, offeredSalary: number) => ({
  type: GAME_ACTION_TYPES.MAKE_OFFER_TO_DETECTIVE,
  payload: { detectiveId, offeredSalary },
});

export const fireDetective = (detectiveId: string) => ({
  type: GAME_ACTION_TYPES.FIRE_DETECTIVE,
  payload: detectiveId,
});

export const refreshMarketplace = () => ({
  type: GAME_ACTION_TYPES.REFRESH_MARKETPLACE,
});

export const dismissVandalismAlert = () => ({
  type: GAME_ACTION_TYPES.DISMISS_VANDALISM_ALERT,
});

export const repairInvestment = (investmentId: string) => ({
  type: GAME_ACTION_TYPES.REPAIR_INVESTMENT,
  payload: investmentId,
});

export const removeDamagedInvestment = (investmentId: string) => ({
  type: GAME_ACTION_TYPES.REMOVE_DAMAGED_INVESTMENT,
  payload: investmentId,
});