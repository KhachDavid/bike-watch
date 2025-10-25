import { Street, InvestmentType, GameState } from '../../types';
import { GAME_ACTION_TYPES } from '../actions/game.actions';
import { simulateThefts, investigateCases, calculateRecoveryRate } from '../../services/theftSimulation';
import { generateDetectiveMarketplace, willAcceptOffer } from '../../services/detectiveMarketplace';

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
  lighting: { 
    name: "Street Lighting", 
    cost: 5000, 
    effect: "lighting", 
    description: "Upgrade street lighting",
    canBePlaced: true,
    effectRadius: 100
  },
  parking: { 
    name: "Secure Parking", 
    cost: 15000, 
    effect: "security", 
    description: "Install secure bike parking",
    canBePlaced: true,
    effectRadius: 50
  },
  programs: { 
    name: "Community Programs", 
    cost: 8000, 
    effect: "community", 
    description: "Community watch initiatives",
    canBePlaced: true,
    effectRadius: 150
  },
  patrols: { 
    name: "Police Patrols", 
    cost: 12000, 
    effect: "enforcement", 
    description: "Increase police presence",
    canBePlaced: true,
    effectRadius: 200
  },
  camera_standard: { 
    name: "Standard Camera", 
    cost: 2000, 
    effect: "camera",
    description: "Basic surveillance camera",
    canBePlaced: true,
    effectRadius: 50,
    cameraQuality: "standard"
  },
  camera_hd: { 
    name: "HD Camera", 
    cost: 4000, 
    effect: "camera",
    description: "High definition camera with night vision",
    canBePlaced: true,
    effectRadius: 75,
    cameraQuality: "hd"
  },
  camera_ai: { 
    name: "AI Camera", 
    cost: 8000, 
    effect: "camera",
    description: "AI-powered camera with theft detection",
    canBePlaced: true,
    effectRadius: 100,
    cameraQuality: "ai-enabled"
  }
};

const initialState: GameState = {
  currentBudget: 100000,
  currentTurn: 1,
  selectedStreet: null,
  selectedInvestment: null,
  streets: initialStreets,
  investmentTypes,
  cameras: [],
  placedInvestments: [],
  placementMode: false,
  thefts: [],
  detectives: [],
  detectiveMarketplace: generateDetectiveMarketplace(),
  totalRecovered: 0,
  recoveryRate: 0
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
  
  // 5. Surveillance factor: Cameras provide significant deterrent
  // Scale: 10 = excellent coverage (50% risk reduction), 0 = no coverage
  const surveillanceScore = street.surveillanceScore || 0;
  const surveillanceMultiplier = 1 - (surveillanceScore / 20); // Up to 50% reduction at score 10
  
  // Calculate final risk with all factors
  const risk = baseTheftRate * lightingMultiplier * trafficMultiplier * investmentMultiplier * surveillanceMultiplier;
  
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
      const nextTurn = state.currentTurn + 1;
      const budgetIncrease = 10000 + (state.currentTurn * 2000);
      
      // 1. Deduct detective salaries
      const detectiveSalaries = state.detectives.reduce((sum, d) => sum + (d.salary || 0), 0);
      const budgetAfterSalaries = state.currentBudget + budgetIncrease - detectiveSalaries;
      
      // 2. Simulate thefts at specific locations (based on ALL placed investments)
      const newThefts = simulateThefts(state.streets, state.cameras, nextTurn, state.placedInvestments);
      const allThefts = [...state.thefts, ...newThefts];
      
      // 3. Detectives investigate unsolved cases
      const unsolvedThefts = allThefts.filter(t => !t.solved);
      let updatedThefts = [...allThefts];
      let totalNewSolved = 0;
      
      state.detectives.forEach(detective => {
        const solvedIds = investigateCases(detective, unsolvedThefts, nextTurn);
        totalNewSolved += solvedIds.length;
        
        // Mark thefts as solved
        updatedThefts = updatedThefts.map(theft => {
          if (solvedIds.includes(theft.id)) {
            return {
              ...theft,
              solved: true,
              solvedAt: nextTurn,
              assignedDetective: detective.id
            };
          }
          return theft;
        });
      });
      
      // 4. Calculate recovery rate
      const newRecoveryRate = calculateRecoveryRate(updatedThefts);
      const newTotalRecovered = state.totalRecovered + totalNewSolved;
      
      // 5. Update street statistics based on ACTUAL thefts that occurred
      const streetTheftCounts = new Map<number, number>();
      newThefts.forEach(theft => {
        const count = streetTheftCounts.get(theft.streetId) || 0;
        streetTheftCounts.set(theft.streetId, count + 1);
      });
      
      const recalculatedStreets = state.streets.map(street => {
        const actualThefts = streetTheftCounts.get(street.id) || 0;
        
        // NATURAL ESCALATION: If no recent investment, thefts increase 2-5% per month
        const hasRecentInvestment = street.investment > 0;
        const escalationMultiplier = hasRecentInvestment ? 1.0 : (1.02 + Math.random() * 0.03);
        
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
        const monthlyBikes = updatedStreet.bikesPerDay * 30;
        const baseRate = monthlyBikes > 0 ? (actualThefts / monthlyBikes) * 100 : 0;
        const lightingMult = 1 + ((10 - updatedStreet.lightingScore) * 0.05);
        const trafficMult = 
          updatedStreet.footTraffic === 'Very High' ? 0.75 :
          updatedStreet.footTraffic === 'High' ? 0.85 :
          updatedStreet.footTraffic === 'Medium' ? 1.0 : 1.15;
        const surveillanceMult = 1 - ((updatedStreet.surveillanceScore || 0) / 20);
        const historicalRisk = baseRate * lightingMult * trafficMult * surveillanceMult;
        
        return {
          ...updatedStreet,
          riskPercentage: newProjectedRisk,
          historicalRisk: Math.round(historicalRisk * 10) / 10
        };
      });

      return {
        ...state,
        currentTurn: nextTurn,
        currentBudget: budgetAfterSalaries,
        streets: recalculatedStreets,
        thefts: updatedThefts,
        totalRecovered: newTotalRecovered,
        recoveryRate: newRecoveryRate
      };

    case GAME_ACTION_TYPES.RESET_GAME:
      return initialState;

    case GAME_ACTION_TYPES.TOGGLE_CAMERA_MODE:
    case GAME_ACTION_TYPES.TOGGLE_PLACEMENT_MODE:
      return {
        ...state,
        placementMode: !state.placementMode,
        // If turning off placement mode and no investment selected, clear selection
        selectedInvestment: state.placementMode ? null : state.selectedInvestment
      };

    case GAME_ACTION_TYPES.PLACE_CAMERA:
    case GAME_ACTION_TYPES.PLACE_INVESTMENT:
      if (!state.selectedInvestment || !state.investmentTypes[state.selectedInvestment]?.canBePlaced) {
        return state; // No placeable investment selected
      }

      const placementInvestment = state.investmentTypes[state.selectedInvestment];
      if (state.currentBudget < placementInvestment.cost) {
        return state; // Not enough budget
      }

      // Create new placed investment
      const newPlacement: any = {
        id: `${placementInvestment.effect}-${Date.now()}-${Math.random()}`,
        type: state.selectedInvestment,
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
        effectRadius: placementInvestment.effectRadius || 50,
        cost: placementInvestment.cost,
        placedAt: state.currentTurn,
        // Type-specific data
        quality: placementInvestment.cameraQuality,
        lightingLevel: placementInvestment.effect === 'lighting' ? 8 : undefined,
        patrolFrequency: (placementInvestment.effect === 'enforcement' ? 'medium' : undefined) as 'low' | 'medium' | 'high' | undefined,
        capacity: placementInvestment.effect === 'security' ? 20 : undefined
      };

      // Legacy: Also add to cameras array if it's a camera
      const newCamera = placementInvestment.cameraQuality ? {
        id: newPlacement.id,
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
        coverageRadius: placementInvestment.effectRadius || 50,
        quality: placementInvestment.cameraQuality,
        placedAt: state.currentTurn,
        cost: placementInvestment.cost
      } : null;

      // Calculate which streets are affected by this placement
      const streetsWithUpdate = state.streets.map(street => {
        if (!street.latitude || !street.longitude) return street;
        
        // Calculate distance using Haversine formula
        const lat1 = newPlacement.latitude * Math.PI / 180;
        const lat2 = street.latitude * Math.PI / 180;
        const lon1 = newPlacement.longitude * Math.PI / 180;
        const lon2 = street.longitude * Math.PI / 180;
        const dlat = lat2 - lat1;
        const dlon = lon2 - lon1;
        const a = Math.sin(dlat/2) * Math.sin(dlat/2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(dlon/2) * Math.sin(dlon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = 6371000 * c; // Distance in meters
        
        if (distance <= newPlacement.effectRadius) {
          let updatedStreet = { ...street };
          
          // Apply effects based on investment type
          switch (placementInvestment.effect) {
            case 'camera':
              // Camera surveillance
              if (newCamera) {
                const currentCameras = street.cameras || [];
                const newCameras = [...currentCameras, newCamera];
                const qualityMultiplier = 
                  newCamera.quality === 'ai-enabled' ? 1.5 :
                  newCamera.quality === 'hd' ? 1.2 : 1.0;
                const surveillanceBoost = Math.min(3, qualityMultiplier);
                updatedStreet.cameras = newCameras;
                updatedStreet.cameraCount = newCameras.length;
                updatedStreet.surveillanceScore = Math.min(10, (street.surveillanceScore || 0) + surveillanceBoost);
              }
              break;
              
            case 'lighting':
              // Improve lighting score
              updatedStreet.lightingScore = Math.min(10, updatedStreet.lightingScore + 2);
              break;
              
            case 'security':
              // Secure parking reduces base thefts
              updatedStreet.theftsPerMonth = Math.round(updatedStreet.theftsPerMonth * 0.90);
              break;
              
            case 'community':
              // Community programs increase foot traffic
              if (updatedStreet.footTraffic === 'Low') updatedStreet.footTraffic = 'Medium';
              else if (updatedStreet.footTraffic === 'Medium') updatedStreet.footTraffic = 'High';
              else if (updatedStreet.footTraffic === 'High') updatedStreet.footTraffic = 'Very High';
              break;
              
            case 'enforcement':
              // Police patrols reduce thefts
              updatedStreet.theftsPerMonth = Math.round(updatedStreet.theftsPerMonth * 0.85);
              break;
          }
          
          // Track total investment
          updatedStreet.investment = updatedStreet.investment + placementInvestment.cost;
          
          // Recalculate risk with new factors
          updatedStreet.riskPercentage = calculateRiskPercentage(updatedStreet);
          updatedStreet.historicalRisk = updatedStreet.riskPercentage * 0.95;
          
          return updatedStreet;
        }
        
        return street;
      });

      return {
        ...state,
        cameras: newCamera ? [...state.cameras, newCamera] : state.cameras,
        placedInvestments: [...state.placedInvestments, newPlacement],
        currentBudget: state.currentBudget - placementInvestment.cost,
        streets: streetsWithUpdate,
        placementMode: false,
        selectedInvestment: null
      };

    case GAME_ACTION_TYPES.REMOVE_CAMERA:
      const cameraToRemove = state.cameras.find(c => c.id === action.payload);
      if (!cameraToRemove) return state;

      const camerasAfterRemoval = state.cameras.filter(c => c.id !== action.payload);
      
      // Remove camera from affected streets and recalculate
      const streetsAfterCameraRemoval = state.streets.map(street => {
        const cameras = street.cameras || [];
        const updatedCameras = cameras.filter(c => c.id !== action.payload);
        
        if (updatedCameras.length !== cameras.length) {
          // Camera was removed from this street
          const surveillanceScore = Math.max(0, (street.surveillanceScore || 0) - 2);
          const updatedStreet = {
            ...street,
            cameras: updatedCameras,
            cameraCount: updatedCameras.length,
            surveillanceScore
          };
          updatedStreet.riskPercentage = calculateRiskPercentage(updatedStreet);
          updatedStreet.historicalRisk = updatedStreet.riskPercentage * 0.95;
          return updatedStreet;
        }
        
        return street;
      });

      return {
        ...state,
        cameras: camerasAfterRemoval,
        streets: streetsAfterCameraRemoval
      };

    case GAME_ACTION_TYPES.REMOVE_INVESTMENT:
      const investmentToRemove = state.placedInvestments.find(i => i.id === action.payload);
      if (!investmentToRemove) return state;

      const investmentsAfterRemoval = state.placedInvestments.filter(i => i.id !== action.payload);
      const camerasAfterInvestmentRemoval = state.cameras.filter(c => c.id !== action.payload);
      
      // Recalculate affected streets (reverse the effects)
      const streetsAfterInvestmentRemoval = state.streets.map(street => {
        if (!street.latitude || !street.longitude) return street;
        
        // Check if street was affected by this investment
        const lat1 = investmentToRemove.latitude * Math.PI / 180;
        const lat2 = street.latitude * Math.PI / 180;
        const lon1 = investmentToRemove.longitude * Math.PI / 180;
        const lon2 = street.longitude * Math.PI / 180;
        const dlat = lat2 - lat1;
        const dlon = lon2 - lon1;
        const a = Math.sin(dlat/2) * Math.sin(dlat/2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(dlon/2) * Math.sin(dlon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = 6371000 * c;
        
        if (distance <= investmentToRemove.effectRadius) {
          let updatedStreet = { ...street };
          
          // Reverse effects based on investment type
          if (investmentToRemove.type.includes('camera')) {
            const cameras = street.cameras || [];
            updatedStreet.cameras = cameras.filter(c => c.id !== action.payload);
            updatedStreet.cameraCount = updatedStreet.cameras.length;
            updatedStreet.surveillanceScore = Math.max(0, (street.surveillanceScore || 0) - 2);
          } else if (investmentToRemove.type.includes('lighting')) {
            updatedStreet.lightingScore = Math.max(1, updatedStreet.lightingScore - 2);
          }
          // Note: Some effects (like reduced thefts) can't be easily reversed
          // They'll normalize over time through the simulation
          
          updatedStreet.investment = Math.max(0, updatedStreet.investment - investmentToRemove.cost);
          updatedStreet.riskPercentage = calculateRiskPercentage(updatedStreet);
          updatedStreet.historicalRisk = updatedStreet.riskPercentage * 0.95;
          
          return updatedStreet;
        }
        
        return street;
      });

      return {
        ...state,
        placedInvestments: investmentsAfterRemoval,
        cameras: camerasAfterInvestmentRemoval,
        streets: streetsAfterInvestmentRemoval
      };

    case GAME_ACTION_TYPES.MAKE_OFFER_TO_DETECTIVE:
      const { detectiveId, offeredSalary } = action.payload;
      const detective = state.detectiveMarketplace.find(d => d.id === detectiveId);
      
      if (!detective || state.currentBudget < offeredSalary) {
        return state;
      }

      // Check if detective accepts offer
      const offerResult = willAcceptOffer(detective, offeredSalary, 50);
      
      if (!offerResult.accepted) {
        // TODO: Show rejection message to player
        return state;
      }

      // Hire the detective
      const hiredDetective = {
        ...detective,
        salary: offeredSalary,
        hiredAt: state.currentTurn,
        employed: false, // No longer employed elsewhere
        currentEmployer: undefined
      };

      return {
        ...state,
        detectives: [...state.detectives, hiredDetective],
        detectiveMarketplace: state.detectiveMarketplace.filter(d => d.id !== detectiveId),
        currentBudget: state.currentBudget - offeredSalary
      };

    case GAME_ACTION_TYPES.FIRE_DETECTIVE:
      return {
        ...state,
        detectives: state.detectives.filter(d => d.id !== action.payload)
      };

    case GAME_ACTION_TYPES.REFRESH_MARKETPLACE:
      return {
        ...state,
        detectiveMarketplace: generateDetectiveMarketplace()
      };

    default:
      return state;
  }
}