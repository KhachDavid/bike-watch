import { Street, InvestmentType, GameState } from '../../types';
import { GAME_ACTION_TYPES } from '../actions/game.actions';

// Start with empty streets - will be loaded dynamically from API
const initialStreets: Street[] = [];

// Keep some mock data as fallback in comments

const FALLBACK_STREETS: Street[] = [
  {
    id: 1,
    name: "Main St",
    bikesPerDay: 450,
    theftsPerMonth: 12,
    theftsLastMonth: 11,
    lightingScore: 3,
    footTraffic: "High",
    investment: 0,
    riskPercentage: 8.1,
    historicalRisk: 7.8
  },
  {
    id: 2,
    name: "Oak Ave",
    bikesPerDay: 230,
    theftsPerMonth: 2,
    theftsLastMonth: 2,
    lightingScore: 8,
    footTraffic: "Medium",
    investment: 15000,
    riskPercentage: 2.9,
    historicalRisk: 2.7
  },
  {
    id: 3,
    name: "University Blvd",
    bikesPerDay: 890,
    theftsPerMonth: 35,
    theftsLastMonth: 33,
    lightingScore: 4,
    footTraffic: "Very High",
    investment: 0,
    riskPercentage: 12.3,
    historicalRisk: 11.8
  },
  {
    id: 4,
    name: "Park Lane",
    bikesPerDay: 180,
    theftsPerMonth: 5,
    theftsLastMonth: 4,
    lightingScore: 6,
    footTraffic: "Low",
    investment: 0,
    riskPercentage: 9.2,
    historicalRisk: 8.5
  },
  {
    id: 5,
    name: "Commerce St",
    bikesPerDay: 320,
    theftsPerMonth: 8,
    theftsLastMonth: 7,
    lightingScore: 5,
    footTraffic: "Medium",
    investment: 0,
    riskPercentage: 8.3,
    historicalRisk: 7.9
  }
];


const investmentTypes: { [key: string]: InvestmentType } = {
  lighting: { name: "Street Lighting", cost: 5000, effect: "lighting" },
  parking: { name: "Secure Parking", cost: 15000, effect: "security" },
  cameras: { name: "Camera System", cost: 3000, effect: "surveillance" },
  programs: { name: "Community Programs", cost: 8000, effect: "community" },
  patrols: { name: "Police Patrols", cost: 12000, effect: "enforcement" }
};

const initialState: GameState = {
  currentBudget: 100000,
  currentTurn: 1,
  selectedStreet: null,
  selectedInvestment: null,
  streets: initialStreets,
  investmentTypes
};

const calculateRiskPercentage = (street: Street): number => {
  // Comprehensive risk calculation incorporating all factors
  
  // 1. Base theft rate from historical data
  const monthlyBikes = street.bikesPerDay * 30;
  const baseTheftRate = (street.theftsPerMonth / monthlyBikes) * 100;
  
  // 2. Lighting factor: Poor lighting increases risk
  // Scale: 10 = best (no increase), 1 = worst (+45% increase)
  const lightingMultiplier = 1 + ((10 - street.lightingScore) * 0.05);
  
  // 3. Traffic factor: More foot traffic = safer (natural surveillance)
  const trafficMultiplier = 
    street.footTraffic === 'Very High' ? 0.75 :  // 25% safer
    street.footTraffic === 'High' ? 0.85 :       // 15% safer
    street.footTraffic === 'Medium' ? 1.0 :      // Neutral
    1.15;                                        // 15% riskier (Low traffic)
  
  // 4. Investment factor: Each $10k invested reduces risk by ~5%
  const investmentMultiplier = Math.max(0.5, 1 - (street.investment / 10000) * 0.05);
  
  // Calculate final risk with all factors
  const risk = baseTheftRate * lightingMultiplier * trafficMultiplier * investmentMultiplier;
  
  return Math.max(1, Math.min(15, Math.round(risk * 10) / 10));
};

const updateStreetStats = (street: Street, investment: InvestmentType): Street => {
  let updatedStreet = { ...street };
  
  // Apply investment effects
  switch (investment.effect) {
    case 'lighting':
      // Improve lighting score (directly reduces risk via lighting multiplier)
      updatedStreet.lightingScore = Math.min(10, updatedStreet.lightingScore + 2);
      break;
    case 'security':
      // Secure parking reduces base thefts
      updatedStreet.theftsPerMonth = Math.round(updatedStreet.theftsPerMonth * 0.85);
      break;
    case 'surveillance':
      // Cameras deter theft
      updatedStreet.theftsPerMonth = Math.round(updatedStreet.theftsPerMonth * 0.90);
      break;
    case 'community':
      // Community programs increase foot traffic awareness
      if (updatedStreet.footTraffic === 'Low') updatedStreet.footTraffic = 'Medium';
      else if (updatedStreet.footTraffic === 'Medium') updatedStreet.footTraffic = 'High';
      break;
    case 'enforcement':
      // Police patrols significantly reduce thefts
      updatedStreet.theftsPerMonth = Math.round(updatedStreet.theftsPerMonth * 0.80);
      break;
  }
  
  // Recalculate risk with new factors (lighting, traffic, investment amount)
  updatedStreet.riskPercentage = calculateRiskPercentage(updatedStreet);
  updatedStreet.historicalRisk = updatedStreet.riskPercentage * 0.95; // Historical slightly lower
  
  return updatedStreet;
};

const simulateRandomEvent = (streets: Street[]): Street[] => {
  const events = [
    { type: 'theft_spike', probability: 0.3, effect: 'increase_thefts' },
    { type: 'community_improvement', probability: 0.2, effect: 'decrease_risk' },
    { type: 'weather_impact', probability: 0.4, effect: 'variable' }
  ];

  return streets.map(street => {
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    
    if (Math.random() < randomEvent.probability) {
      let updatedStreet = { ...street };
      
      switch (randomEvent.effect) {
        case 'increase_thefts':
          updatedStreet.theftsPerMonth += Math.floor(Math.random() * 5) + 1;
          updatedStreet.riskPercentage = Math.min(100, updatedStreet.riskPercentage + 10);
          break;
        case 'decrease_risk':
          updatedStreet.riskPercentage = Math.max(5, updatedStreet.riskPercentage - 5);
          break;
        case 'variable':
          if (Math.random() < 0.5) {
            updatedStreet.riskPercentage = Math.max(5, updatedStreet.riskPercentage - 3);
          } else {
            updatedStreet.riskPercentage = Math.min(100, updatedStreet.riskPercentage + 3);
          }
          break;
      }
      
      return updatedStreet;
    }
    
    return street;
  });
};

export default function gameReducer(state = initialState, action: any): GameState {
  switch (action.type) {
    case GAME_ACTION_TYPES.INITIALIZE_GAME:
      return initialState;

    case GAME_ACTION_TYPES.LOAD_STREETS_DATA:
      return {
        ...state,
        streets: action.payload
      };

    case GAME_ACTION_TYPES.SELECT_STREET:
      return {
        ...state,
        selectedStreet: action.payload
      };

    case GAME_ACTION_TYPES.SELECT_INVESTMENT:
      return {
        ...state,
        selectedInvestment: action.payload
      };

    case GAME_ACTION_TYPES.APPLY_INVESTMENT:
      if (!state.selectedStreet || !state.selectedInvestment) {
        return state;
      }

      const investment = state.investmentTypes[state.selectedInvestment];
      const street = state.streets.find(s => s.id === state.selectedStreet);

      if (!street || state.currentBudget < investment.cost) {
        return state;
      }

      const updatedStreets = state.streets.map(s => 
        s.id === state.selectedStreet 
          ? updateStreetStats({ ...s, investment: s.investment + investment.cost }, investment)
          : s
      );

      return {
        ...state,
        currentBudget: state.currentBudget - investment.cost,
        streets: updatedStreets,
        selectedStreet: null,
        selectedInvestment: null
      };

    case GAME_ACTION_TYPES.NEXT_TURN:
      const budgetIncrease = 10000 + (state.currentTurn * 2000);
      const streetsWithEvents = simulateRandomEvent(state.streets);
      const recalculatedStreets = streetsWithEvents.map(street => {
        // NATURAL ESCALATION: If no recent investment, thefts increase 2-5% per month
        // This creates urgency - player MUST act or things get worse
        const monthsSinceLastInvestment = state.currentTurn - 1; // Simplified: assume investments are recent
        const hasRecentInvestment = street.investment > 0;
        const escalationMultiplier = hasRecentInvestment ? 1.0 : (1.02 + Math.random() * 0.03); // 2-5% increase
        
        // Simulate actual thefts that happened this month
        // Based on current risk (includes lighting, traffic, investments)
        const currentRisk = calculateRiskPercentage(street);
        const monthlyBikes = street.bikesPerDay * 30;
        const actualThefts = Math.round(monthlyBikes * (currentRisk / 100) * (0.8 + Math.random() * 0.4) * escalationMultiplier);
        
        // Update theft history with escalation
        const escalatedThefts = Math.round(street.theftsPerMonth * escalationMultiplier);
        const newTheftsPerMonth = Math.round((escalatedThefts * 0.7) + (actualThefts * 0.3)); // Moving average
        
        // Recalculate risks with updated data
        const updatedStreet = {
          ...street,
          theftsLastMonth: actualThefts,
          theftsPerMonth: newTheftsPerMonth
        };
        
        const newProjectedRisk = calculateRiskPercentage(updatedStreet);
        
        // Calculate historical risk from what actually happened
        const monthlyBikes2 = updatedStreet.bikesPerDay * 30;
        const baseRate = (actualThefts / monthlyBikes2) * 100;
        const lightingMult = 1 + ((10 - updatedStreet.lightingScore) * 0.05);
        const trafficMult = 
          updatedStreet.footTraffic === 'Very High' ? 0.75 :
          updatedStreet.footTraffic === 'High' ? 0.85 :
          updatedStreet.footTraffic === 'Medium' ? 1.0 : 1.15;
        const historicalRisk = baseRate * lightingMult * trafficMult;
        
        return {
          ...updatedStreet,
          riskPercentage: newProjectedRisk,
          historicalRisk: Math.round(historicalRisk * 10) / 10
        };
      });

      return {
        ...state,
        currentTurn: state.currentTurn + 1,
        currentBudget: state.currentBudget + budgetIncrease,
        streets: recalculatedStreets
      };

    case GAME_ACTION_TYPES.RESET_GAME:
      return initialState;

    default:
      return state;
  }
}