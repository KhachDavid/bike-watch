export interface Street {
  id: number;
  name: string;
  bikesPerDay: number;
  theftsPerMonth: number; // Historical average (2023-2024)
  theftsLastMonth: number; // Most recent month (Dec 2024)
  lightingScore: number;
  footTraffic: 'Low' | 'Medium' | 'High' | 'Very High';
  investment: number;
  riskPercentage: number; // PROJECTED risk for next month
  historicalRisk: number; // ACTUAL historical risk
  latitude?: number;
  longitude?: number;
}

export interface InvestmentType {
  name: string;
  cost: number;
  effect: 'lighting' | 'security' | 'surveillance' | 'community' | 'enforcement';
}

export interface GameState {
  currentBudget: number;
  currentTurn: number;
  selectedStreet: number | null;
  selectedInvestment: string | null;
  streets: Street[];
  investmentTypes: { [key: string]: InvestmentType };
}

export interface RootState {
  game: GameState;
  email: import('./email.types').EmailState;
}

export type AppDispatch = typeof import('../configureStore').default extends (...args: any[]) => infer R ? R extends { dispatch: infer D } ? D : never : never;