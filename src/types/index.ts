export interface Camera {
  id: string;
  latitude: number;
  longitude: number;
  coverageRadius: number; // in meters
  quality: 'standard' | 'hd' | 'ai-enabled';
  placedAt: number; // turn number
  cost: number;
}

export interface TheftIncident {
  id: string;
  streetId: number;
  streetName: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  turnNumber: number;
  bikeValue: number;
  // Investigation status
  hasCameraFootage: boolean;
  footageQuality?: 'standard' | 'hd' | 'ai-enabled'; // Best camera that captured it
  capturedByCameras: string[]; // Camera IDs that captured this
  solved: boolean;
  solvedAt?: number; // Turn number when solved
  recoveryRate: number; // 0-1, based on time since theft and footage quality
  assignedDetective?: string;
}

export interface Detective {
  id: string;
  name: string;
  age: number;
  experience: number; // Years of experience
  // Abilities (0-20 scale, like Football Manager)
  investigation: number; // General investigation skill
  forensics: number; // Technical/forensic analysis
  interviewing: number; // Getting information from people
  surveillance: number; // Reviewing camera footage
  intuition: number; // Solving cases without much evidence
  // Employment status
  employed: boolean;
  currentEmployer?: string; // If employed elsewhere
  desiredSalary: number; // What they want
  minimumSalary: number; // Lowest they'll accept
  loyalty: number; // 0-100, affects if they'll leave current job
  // Performance
  hiredAt?: number;
  salary?: number; // Actual salary if hired
  activeCases: string[];
  solvedCases: number;
  successRate: number; // Historical success rate 0-1
}

export interface PlacedInvestment {
  id: string;
  type: string; // lighting, parking, patrol, community, camera
  latitude: number;
  longitude: number;
  effectRadius: number; // Area of effect in meters
  cost: number;
  placedAt: number;
  // Type-specific data
  quality?: 'standard' | 'hd' | 'ai-enabled'; // For cameras
  lightingLevel?: number; // For lighting (1-10)
  patrolFrequency?: 'low' | 'medium' | 'high'; // For patrols
  capacity?: number; // For parking
}

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
  cameras?: Camera[]; // Cameras covering this street
  cameraCount?: number;
  surveillanceScore?: number; // 0-10 based on camera coverage
}

export interface InvestmentType {
  name: string;
  cost: number;
  effect: 'lighting' | 'security' | 'surveillance' | 'community' | 'enforcement' | 'camera' | 'detective';
  description?: string;
  canBePlaced?: boolean; // Can be placed on map
  effectRadius?: number; // Area of effect in meters
  // Camera-specific properties
  cameraQuality?: 'standard' | 'hd' | 'ai-enabled';
  // Detective-specific properties (removed, now marketplace-based)
  detectiveSkill?: 'junior' | 'senior' | 'expert';
  monthlySalary?: number;
  baseSolveRate?: number;
}

export interface GameState {
  currentBudget: number;
  currentTurn: number;
  selectedStreet: number | null;
  selectedInvestment: string | null;
  streets: Street[];
  investmentTypes: { [key: string]: InvestmentType };
  cameras: Camera[]; // All placed cameras (kept for backward compatibility)
  placedInvestments: PlacedInvestment[]; // All placed infrastructure
  placementMode: boolean; // When true, clicking map places selected investment
  thefts: TheftIncident[]; // All theft incidents (active and solved)
  detectives: Detective[]; // Hired detectives
  detectiveMarketplace: Detective[]; // Available detectives to hire
  totalRecovered: number; // Total bikes recovered
  recoveryRate: number; // Percentage of thefts solved
}

import { EmailState } from './email.types';
import { SocialState } from './social.types';

export interface RootState {
  game: GameState;
  email: EmailState;
  social: SocialState;
}

export type AppDispatch = typeof import('../configureStore').default extends (...args: any[]) => infer R ? R extends { dispatch: infer D } ? D : never : never;