import { createSelector } from 'reselect';
import { RootState } from '../../types';

const selectGameState = (state: RootState) => state.game;

export const selectCurrentBudget = createSelector(
  [selectGameState],
  (game) => game.currentBudget
);

export const selectCurrentTurn = createSelector(
  [selectGameState],
  (game) => game.currentTurn
);

export const selectSelectedStreet = createSelector(
  [selectGameState],
  (game) => game.selectedStreet
);

export const selectSelectedInvestment = createSelector(
  [selectGameState],
  (game) => game.selectedInvestment
);

export const selectStreets = createSelector(
  [selectGameState],
  (game) => game.streets
);

export const selectInvestmentTypes = createSelector(
  [selectGameState],
  (game) => game.investmentTypes
);

export const selectTotalThefts = createSelector(
  [selectStreets],
  (streets) => streets.reduce((sum, street) => sum + street.theftsPerMonth, 0)
);

export const selectAverageRisk = createSelector(
  [selectStreets],
  (streets) => Math.round(streets.reduce((sum, street) => sum + street.riskPercentage, 0) / streets.length)
);

export const selectTotalBikes = createSelector(
  [selectStreets],
  (streets) => streets.reduce((sum, street) => sum + street.bikesPerDay, 0)
);

export const selectChartData = createSelector(
  [selectStreets],
  (streets) => ({
    labels: streets.map(street => street.name),
    riskData: streets.map(street => street.riskPercentage),
    theftData: streets.map(street => street.theftsPerMonth)
  })
);

export const selectCameras = createSelector(
  [selectGameState],
  (game) => game.cameras
);

export const selectCameraMode = createSelector(
  [selectGameState],
  (game) => game.cameraMode
);

export const selectTotalCameraInvestment = createSelector(
  [selectCameras],
  (cameras) => cameras.reduce((sum, camera) => sum + camera.cost, 0)
);