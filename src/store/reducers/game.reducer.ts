import { Street, InvestmentType, GameState } from '../../types';
import { GAME_ACTION_TYPES } from '../actions/game.actions';
import { simulateThefts, investigateCases, calculateRecoveryRate } from '../../services/theftSimulation';
import { generateDetectiveMarketplace, willAcceptOffer } from '../../services/detectiveMarketplace';
import { calculatePolicePresence, getBacklashLevel, generateBacklashEmail, generateBacklashPosts } from '../../services/backlash';
import { generateVandalismIncidents, generateVandalismEmail } from '../../services/vandalism';
import { generateHireEmail, generateProgressEmail, generateQuitEmail } from '../../services/detectivePersonality';
import { calculateYearlyPerformance, generateExpectations, generatePerformanceReviewEmail, shouldBeFired } from '../../services/performanceReview';
import GAMEPLAY_CONFIG from '../../config/gameplay';

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
  currentBudget: GAMEPLAY_CONFIG.STARTING_BUDGET,
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
  totalMoneyRecovered: 0,
  recoveryRate: 0,
  policePresenceScore: 0,
  actionsLocked: false,
  backlashTurnsRemaining: 0,
  vandalismAlert: null,
  // Performance tracking
  yearlyStats: {
    year: 2025,
    totalThefts: 0,
    totalRecovered: 0,
    policeBacklashEvents: 0,
    vandalismEvents: 0,
    detectivesHired: 0,
    detectivesQuit: 0,
    budgetSpent: 0
  },
  previousYearStats: null,
  performanceWarnings: 0,
  gameOver: false
};

const calculateRiskPercentage = (street: Street): number => {
  // Comprehensive risk calculation incorporating all factors
  
  // Safety checks to prevent NaN
  if (!street || !street.bikesPerDay || !street.theftsPerMonth || !street.lightingScore) {
    console.warn('Invalid street data in calculateRiskPercentage:', street);
    return 5.0; // Return safe default
  }
  
  // 1. Base theft rate from historical data
  const monthlyBikes = (street.bikesPerDay || 1) * 30;
  const baseTheftRate = ((street.theftsPerMonth || 0) / monthlyBikes) * 100;
  
  // 2. Lighting factor: Poor lighting increases risk
  // Scale: 10 = best (no increase), 1 = worst (+45% increase)
  const lightingMultiplier = 1 + ((10 - (street.lightingScore || 5)) * 0.05);
  
  // 3. Traffic factor: More foot traffic = safer (natural surveillance)
  const trafficMultiplier = 
    street.footTraffic === 'Very High' ? 0.75 :  // 25% safer
    street.footTraffic === 'High' ? 0.85 :       // 15% safer
    street.footTraffic === 'Medium' ? 1.0 :      // Neutral
    1.15;                                        // 15% riskier (Low traffic)
  
  // 4. Investment factor: Each $10k invested reduces risk by ~5%
  const investmentMultiplier = Math.max(0.5, 1 - ((street.investment || 0) / 10000) * 0.05);
  
  // 5. Surveillance factor: Cameras provide significant deterrent
  // Scale: 10 = excellent coverage (50% risk reduction), 0 = no coverage
  const surveillanceScore = street.surveillanceScore || 0;
  const surveillanceMultiplier = 1 - (surveillanceScore / 20); // Up to 50% reduction at score 10
  
  // Calculate final risk with all factors
  const risk = baseTheftRate * lightingMultiplier * trafficMultiplier * investmentMultiplier * surveillanceMultiplier;
  
  // Ensure we never return NaN
  if (isNaN(risk) || !isFinite(risk)) {
    console.warn('NaN detected in risk calculation for street:', street.name);
    return 5.0; // Safe default
  }
  
  return Math.max(1, Math.min(15, Math.round(risk * 10) / 10));
};

/**
 * Recalculate street stats from ALL functional investments
 * Called when investments are damaged/repaired to ensure accuracy
 */
const recalculateStreetFromInvestments = (
  street: Street,
  allInvestments: any[]
): Street => {
  // Safety check
  if (!street) {
    console.warn('Invalid street in recalculateStreetFromInvestments');
    return street;
  }
  
  // Start with base values
  let updatedStreet = { ...street };
  
  // Reset to base values with safety checks
  updatedStreet.lightingScore = street.baseLightingScore || street.lightingScore || 5;
  updatedStreet.surveillanceScore = 0;
  updatedStreet.cameraCount = 0;
  updatedStreet.cameras = [];
  
  // Recalculate from ALL functional investments
  const functionalInvestments = allInvestments.filter(inv => {
    if (inv.damaged) return false;
    if (!street.latitude || !street.longitude) return false;
    
    // Distance check
    const lat1 = inv.latitude * Math.PI / 180;
    const lat2 = street.latitude * Math.PI / 180;
    const lon1 = inv.longitude * Math.PI / 180;
    const lon2 = street.longitude * Math.PI / 180;
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;
    const a = Math.sin(dlat/2) * Math.sin(dlat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dlon/2) * Math.sin(dlon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = 6371000 * c;
    
    return distance <= inv.effectRadius;
  });
  
  // Apply boosts from functional investments only
  functionalInvestments.forEach(inv => {
    if (inv.type.includes('camera')) {
      updatedStreet.cameraCount = (updatedStreet.cameraCount || 0) + 1;
      const qualityMultiplier = 
        inv.quality === 'ai-enabled' ? 1.5 :
        inv.quality === 'hd' ? 1.2 : 1.0;
      const surveillanceBoost = Math.min(3, qualityMultiplier);
      updatedStreet.surveillanceScore = Math.min(10, (updatedStreet.surveillanceScore || 0) + surveillanceBoost);
    } else if (inv.type.includes('lighting')) {
      updatedStreet.lightingScore = Math.min(10, updatedStreet.lightingScore + 2);
    }
  });
  
  return updatedStreet;
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
  
  // Recalculate PROJECTED risk with new factors (lighting, traffic, investment amount)
  updatedStreet.riskPercentage = calculateRiskPercentage(updatedStreet);
  // DO NOT modify historicalRisk - it's based on fixed past data (2023-2024)
  
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
      // Ensure all streets have required fields with defaults
      const loadedStreets = (action.payload || []).map((street: Street) => ({
        ...street,
        investment: street.investment || 0,
        lightingScore: street.lightingScore || 5,
        baseLightingScore: street.baseLightingScore || street.lightingScore || 5,
        surveillanceScore: street.surveillanceScore || 0,
        cameraCount: street.cameraCount || 0,
        cameras: street.cameras || [],
        bikesPerDay: street.bikesPerDay || 100,
        theftsPerMonth: street.theftsPerMonth || 1,
        theftsLastMonth: street.theftsLastMonth || street.theftsPerMonth || 1,
        riskPercentage: street.riskPercentage || 5,
        historicalRisk: street.historicalRisk || street.riskPercentage || 5
      }));
      
      return {
        ...state,
        streets: loadedStreets
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
      const budgetIncrease = GAMEPLAY_CONFIG.MONTHLY_BUDGET_INCREASE + (state.currentTurn * GAMEPLAY_CONFIG.BUDGET_INCREASE_PER_TURN);
      
      // Check if it's a new year (January = turn 1, 13, 25, 37...)
      const isJanuary = (nextTurn - 1) % 12 === 0 && nextTurn > 1;
      const currentYear = 2025 + Math.floor((nextTurn - 1) / 12);
      
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
      let totalBikesRecovered = 0;
      let totalMoneyRecovered = 0;
      
      state.detectives.forEach(detective => {
        const solvedIds = investigateCases(detective, unsolvedThefts, nextTurn);
        totalNewSolved += solvedIds.length;
        
        // Mark thefts as solved and calculate recovery
        updatedThefts = updatedThefts.map(theft => {
          if (solvedIds.includes(theft.id)) {
            // Case is solved - now determine if bike is recovered
            // Recovery chance based on:
            // - Base recovery rate (from footage quality)
            // - Time elapsed (cases get colder)
            // - Detective skill
            
            const turnsSinceTheft = nextTurn - theft.turnNumber;
            const timeDecay = Math.max(0.2, 1 - (turnsSinceTheft * 0.2)); // -20% per turn
            
            const recoveryChance = theft.recoveryRate * timeDecay;
            const bikeRecovered = Math.random() < recoveryChance;
            
            let moneyRecovered = 0;
            if (bikeRecovered) {
              // Full bike value recovered
              moneyRecovered = theft.bikeValue;
              totalBikesRecovered++;
            } else {
              // Even if bike not recovered, solving case might recover partial value
              // (insurance, parts, etc.) - 10-30% of value
              moneyRecovered = Math.round(theft.bikeValue * (0.1 + Math.random() * 0.2));
            }
            
            totalMoneyRecovered += moneyRecovered;
            
            // Update detective stats
            detective.solvedCases++;
            
            return {
              ...theft,
              solved: true,
              solvedAt: nextTurn,
              assignedDetective: detective.id,
              bikeRecovered,
              moneyRecovered
            };
          }
          return theft;
        });
      });
      
      // 4. Calculate recovery rate (% of cases with bike recovered)
      const newRecoveryRate = calculateRecoveryRate(updatedThefts);
      const newTotalRecovered = state.totalRecovered + totalBikesRecovered;
      
      // 5. Update street statistics based on ACTUAL thefts that occurred
      const streetTheftCounts = new Map<number, number>();
      newThefts.forEach(theft => {
        const count = streetTheftCounts.get(theft.streetId) || 0;
        streetTheftCounts.set(theft.streetId, count + 1);
      });
      
      const recalculatedStreets = state.streets.map(street => {
        const actualThefts = streetTheftCounts.get(street.id) || 0;
        
        // IMPORTANT: theftsPerMonth represents BASE THREAT LEVEL (without deterrence)
        // It should only change due to natural escalation or long-term trends
        // actualThefts is AFTER deterrence, so we don't use it to update base rates directly
        
        // NATURAL ESCALATION: If no recent investment, base threat increases per month
        const hasRecentInvestment = street.investment > 0;
        const escalationMultiplier = hasRecentInvestment ? 1.0 : 
          (1 + GAMEPLAY_CONFIG.ESCALATION_MIN + Math.random() * (GAMEPLAY_CONFIG.ESCALATION_MAX - GAMEPLAY_CONFIG.ESCALATION_MIN));
        
        // Update BASE threat level (not influenced by single month's deterrence)
        // Add bounds to prevent runaway escalation or collapse
        const calculatedTheftsPerMonth = Math.round(street.theftsPerMonth * escalationMultiplier);
        
        // Bound changes: max ±20% per month to prevent wild swings
        const maxTheftIncrease = Math.round(street.theftsPerMonth * 1.20);
        const maxTheftDecrease = Math.round(street.theftsPerMonth * 0.80);
        const newTheftsPerMonth = Math.max(
          Math.min(calculatedTheftsPerMonth, maxTheftIncrease),
          maxTheftDecrease
        );
        
        // Update street with new data
        const updatedStreet = {
          ...street,
          theftsLastMonth: actualThefts, // What actually happened (after deterrence)
          theftsPerMonth: newTheftsPerMonth // Base threat level
        };
        
        // Calculate PROJECTED risk for next month (includes all current deterrence)
        const newProjectedRisk = calculateRiskPercentage(updatedStreet);
        
        // Calculate HISTORICAL risk using rolling average for continuity
        // Historical risk should change gradually, not jump wildly month-to-month
        const monthlyBikes = updatedStreet.bikesPerDay * 30;
        const thisMonthsActualRate = monthlyBikes > 0 ? (actualThefts / monthlyBikes) * 100 : 0;
        
        // Use weighted moving average: 75% previous historical risk + 25% this month's actual
        // This creates smooth, realistic trends instead of volatile jumps
        const previousHistoricalRisk = street.historicalRisk || street.riskPercentage;
        const smoothedHistoricalRisk = (previousHistoricalRisk * 0.75) + (thisMonthsActualRate * 0.25);
        
        // Apply bounds to ensure data integrity:
        // 1. Minimum floor: Even with investments, there's always some underlying risk
        const minHistoricalRisk = Math.max(1.0, newProjectedRisk * GAMEPLAY_CONFIG.HISTORICAL_RISK_FLOOR);
        
        // 2. Maximum change per month: Historical risk can't swing more than ±1.5% per month
        const maxChangePerMonth = 1.5;
        const maxIncrease = previousHistoricalRisk + maxChangePerMonth;
        const maxDecrease = Math.max(minHistoricalRisk, previousHistoricalRisk - maxChangePerMonth);
        
        // 3. Bound the smoothed value
        let boundedHistoricalRisk = Math.max(smoothedHistoricalRisk, minHistoricalRisk);
        boundedHistoricalRisk = Math.min(boundedHistoricalRisk, maxIncrease);
        boundedHistoricalRisk = Math.max(boundedHistoricalRisk, maxDecrease);
        
        // 4. Final sanity check: historical risk should generally track below or near projected risk
        // (Unless we just deployed lots of new deterrence, then historical is catching up)
        const maxHistoricalRisk = Math.max(newProjectedRisk * 1.2, previousHistoricalRisk);
        const finalHistoricalRisk = Math.min(boundedHistoricalRisk, maxHistoricalRisk);
        
        // Debug logging for first few streets to verify continuity
        if (street.id <= 3 && nextTurn <= 5) {
          console.log(`[Turn ${nextTurn}] ${street.name}:
  - Actual thefts this month: ${actualThefts}
  - This month's rate: ${thisMonthsActualRate.toFixed(2)}%
  - Previous historical: ${previousHistoricalRisk.toFixed(2)}%
  - Smoothed historical: ${smoothedHistoricalRisk.toFixed(2)}%
  - Final historical: ${finalHistoricalRisk.toFixed(2)}%
  - Projected (next): ${newProjectedRisk.toFixed(2)}%
  - Base thefts/mo: ${street.theftsPerMonth} → ${newTheftsPerMonth}`);
        }
        
        return {
          ...updatedStreet,
          riskPercentage: newProjectedRisk,
          historicalRisk: Math.max(1, Math.round(finalHistoricalRisk * 10) / 10)
        };
      });

      // 6. Vandalism - random damage to placed investments
      const vandalismIncidents = generateVandalismIncidents(state.placedInvestments, recalculatedStreets, nextTurn);
      const vandalizedIds = new Set(vandalismIncidents.map(v => v.targetId));
      const totalVandalismCost = vandalismIncidents.reduce((sum, v) => sum + v.repairCost, 0);
      
      // Mark investments as damaged (don't remove yet - let user decide)
      const investmentsWithDamage = state.placedInvestments.map(inv => {
        if (vandalizedIds.has(inv.id)) {
          const incident = vandalismIncidents.find(v => v.targetId === inv.id);
          return {
            ...inv,
            damaged: true,
            repairCost: incident?.repairCost || 0
          };
        }
        return inv;
      });
      
      // Mark cameras as damaged too
      const camerasWithDamage = state.cameras.map(cam => {
        const isVandalized = vandalizedIds.has(cam.id);
        return isVandalized ? { ...cam, damaged: true } as any : cam;
      });
      
      // Recalculate street stats - damaged items won't contribute
      const streetsAfterVandalism = recalculatedStreets.map(street =>
        recalculateStreetFromInvestments(street, investmentsWithDamage)
      );
      
      // Create vandalism alert if incidents occurred
      const vandalismAlert = vandalismIncidents.length > 0 ? {
        id: `vandalism-${nextTurn}`,
        message: `${vandalismIncidents.length} asset${vandalismIncidents.length > 1 ? 's' : ''} vandalized!`,
        items: vandalismIncidents.map(v => v.targetName),
        totalCost: totalVandalismCost,
        turn: nextTurn
      } : null;
      
      // Store vandalism email for GameControls to dispatch
      if (vandalismIncidents.length > 0) {
        (action as any).vandalismEmail = generateVandalismEmail(vandalismIncidents, nextTurn);
        (action as any).vandalismIncidents = vandalismIncidents; // For potential social media posts
      }
      
      // 6.5. Detective morale & progress emails
      const detectiveEmails: any[] = [];
      const detectivesWhoQuit: any[] = [];
      
      const detectivesWithMorale = state.detectives.map(detective => {
        // Calculate workload
        const casesPerTurn = detective.stamina / 10;
        const activeCaseCount = updatedThefts.filter(t => !t.solved && t.assignedDetective === detective.id).length;
        const workload = casesPerTurn > 0 ? activeCaseCount / casesPerTurn : 0;
        
        // Calculate cases solved this turn
        const casesSolvedThisTurn = updatedThefts.filter(t => 
          t.solved && t.assignedDetective === detective.id && t.solvedAt === nextTurn
        ).length;
        
        // Update morale based on workload
        let moraleDelta = 0;
        if (workload > 2.5) moraleDelta = -10; // Overwhelmed
        else if (workload > 1.5) moraleDelta = -5; // Struggling
        else if (workload < 0.5 && activeCaseCount > 0) moraleDelta = 5; // Manageable workload
        else if (workload >= 0.8 && workload <= 1.5) moraleDelta = 2; // Sweet spot
        
        const newMorale = Math.max(0, Math.min(100, detective.morale + moraleDelta));
        
        // Generate progress email if appropriate
        const email = generateProgressEmail(detective, nextTurn, casesSolvedThisTurn, activeCaseCount);
        if (email) {
          detectiveEmails.push(email);
        }
        
        // Check if detective quits (morale too low)
        if (newMorale < 20) {
          const quitEmail = generateQuitEmail(detective, nextTurn);
          detectiveEmails.push(quitEmail);
          detectivesWhoQuit.push(detective.id);
          return null; // Will be filtered out
        }
        
        return {
          ...detective,
          morale: newMorale,
          lastEmailTurn: email ? nextTurn : detective.lastEmailTurn,
          solvedCases: detective.solvedCases + casesSolvedThisTurn,
          activeCases: updatedThefts.filter(t => !t.solved && t.assignedDetective === detective.id).map(t => t.id)
        };
      }).filter(d => d !== null) as import('../../types').Detective[]; // Remove detectives who quit
      
      // Store detective emails for GameControls to dispatch
      if (detectiveEmails.length > 0) {
        (action as any).detectiveEmails = detectiveEmails;
      }
      
      // 7. Check for police backlash (only count non-damaged patrols)
      const functionalInvestments = investmentsWithDamage.filter(inv => !inv.damaged);
      const policePresence = calculatePolicePresence(functionalInvestments);
      const backlashLevel = getBacklashLevel(policePresence);
      
      let actionsLocked = state.actionsLocked;
      let backlashTurnsRemaining = state.backlashTurnsRemaining;
      
      // Decrease backlash cooldown if active
      if (backlashTurnsRemaining > 0) {
        backlashTurnsRemaining -= 1;
        if (backlashTurnsRemaining === 0) {
          actionsLocked = false;
        }
      }
      
      // Trigger NEW backlash if threshold exceeded (and not already locked)
      const backlashTriggered = !state.actionsLocked && backlashLevel !== 'none' && backlashLevel !== 'warning';
      if (backlashTriggered) {
        actionsLocked = true;
        backlashTurnsRemaining = backlashLevel === 'minor' ? GAMEPLAY_CONFIG.POLICE_PRESENCE.MINOR_LOCKOUT : 
                                backlashLevel === 'major' ? GAMEPLAY_CONFIG.POLICE_PRESENCE.MAJOR_LOCKOUT : 
                                GAMEPLAY_CONFIG.POLICE_PRESENCE.SEVERE_LOCKOUT;
        
        // Generate email and social posts - will be handled by GameControls component
        // Store them in action payload for GameControls to dispatch
        (action as any).backlashEmail = generateBacklashEmail(backlashLevel as any, nextTurn);
        (action as any).backlashPosts = generateBacklashPosts(backlashLevel as any, nextTurn);
      }
      
      // 8. Update yearly stats
      const updatedYearlyStats = {
        ...state.yearlyStats,
        totalThefts: state.yearlyStats.totalThefts + newThefts.length,
        totalRecovered: state.yearlyStats.totalRecovered + totalBikesRecovered,
        policeBacklashEvents: state.yearlyStats.policeBacklashEvents + (backlashTriggered ? 1 : 0),
        vandalismEvents: state.yearlyStats.vandalismEvents + (vandalismIncidents.length > 0 ? 1 : 0),
        detectivesQuit: state.yearlyStats.detectivesQuit + detectivesWhoQuit.length
      };
      
      // 8b. Check for high-performing detectives and potentially send mayor praise email
      let mayorDetectiveEmail = null;
      if (nextTurn % 6 === 0 && state.detectives.length > 0 && newRecoveryRate > 20) {
        // Every 6 months, if recovery rate is good, mayor might notice social media praise
        const topDetectives = [...state.detectives]
          .filter(d => d.solvedCases > 15)
          .sort((a, b) => b.solvedCases - a.solvedCases)
          .slice(0, 2);
        
        if (topDetectives.length > 0 && Math.random() > 0.5) {
          const detective = topDetectives[0];
          const mayorTemplates = [
            {
              subject: `Good Work - Detective ${detective.name}`,
              body: `Coordinator,\n\nI've been monitoring social media sentiment (yes, I actually read the replies), and I'm seeing positive feedback about Detective ${detective.name}.\n\n"${detective.name} recovered my bike!" "Give ${detective.name} a raise!" etc.\n\nThis is good. This is what we need. Public confidence in the program.\n\n${detective.name} has solved ${detective.solvedCases} cases - that's solid work. Make sure they have the resources and support to keep this up. High-performing detectives are hard to find and harder to keep.\n\nIf you're managing them well, keep doing it. If they're succeeding despite you, at least don't get in their way.\n\nRegards,\nDaniel Lurie\nMayor, City and County of San Francisco`
            },
            {
              subject: `Re: Public Praise for Your Team`,
              body: `Coordinator,\n\nI don't usually read Twitter but my communications director showed me a thread about Detective ${detective.name}. Multiple residents praising their work. That's rare.\n\n${detective.name}: ${detective.solvedCases} cases solved, strong public perception.\n\nThis is exactly the kind of visible success we need. The Board notices when residents are happy. Residents are talking about getting their bikes back, not complaining about theft rates.\n\nWhatever management approach you're using with ${detective.name}, apply it to the rest of your team. We need more success stories like this.\n\nKeep it up.\n\nDaniel Lurie\nMayor`
            },
            {
              subject: `Social Media Win - Detective ${detective.name}`,
              body: `Coordinator,\n\nQuick note: I saw Detective ${detective.name}'s name trending positively on local Twitter this morning. "${detective.name} is the real deal." "Finally someone who actually solves cases."\n\nPublic perception matters. ${detective.name} has ${detective.solvedCases} solved cases and people are noticing. That's good PR for the program.\n\nMake sure they're not burning out. High-performing detectives who quit become high-profile failures. Support them, give them what they need.\n\nThis is what success looks like. More of this.\n\nDaniel Lurie`
            }
          ];
          
          const template = mayorTemplates[Math.floor(Math.random() * mayorTemplates.length)];
          mayorDetectiveEmail = {
            id: `mayor-detective-praise-${nextTurn}`,
            from: 'Mayor Daniel Lurie',
            fromTitle: 'Mayor of San Francisco',
            subject: template.subject,
            body: template.body,
            timestamp: new Date(),
            read: false,
            priority: 'normal' as const
          };
          
          (action as any).mayorDetectiveEmail = mayorDetectiveEmail;
        }
      }
      
      // 9. Performance Review (if it's January)
      let performanceReviewEmail = null;
      let newPreviousYearStats = state.previousYearStats;
      let newYearlyStats = updatedYearlyStats;
      let newPerformanceWarnings = state.performanceWarnings;
      let gameOver = state.gameOver;
      let gameOverReason = state.gameOverReason;
      
      if (isJanuary) {
        // Calculate performance for the past year
        const metrics = calculateYearlyPerformance(
          currentYear - 1,
          state.previousYearStats,
          {
            totalTheftsThisYear: state.yearlyStats.totalThefts,
            totalRecovered: state.yearlyStats.totalRecovered,
            totalMoneyRecovered: state.totalMoneyRecovered,
            recoveryRate: state.recoveryRate,
            detectivesHired: state.yearlyStats.detectivesHired,
            detectivesQuit: state.yearlyStats.detectivesQuit,
            budgetSpent: state.yearlyStats.budgetSpent,
            camerasDeployed: state.placedInvestments.filter(i => i.type.includes('camera')).length,
            budgetEfficiency: state.yearlyStats.budgetSpent > 0 ? state.yearlyStats.totalRecovered / state.yearlyStats.budgetSpent : 0
          },
          {
            policeBacklash: state.yearlyStats.policeBacklashEvents,
            vandalism: state.yearlyStats.vandalismEvents
          }
        );
        
        // Check if player should be fired
        const fired = shouldBeFired(metrics, state.performanceWarnings);
        
        // Generate review email
        const expectations = generateExpectations(state.streets, metrics);
        performanceReviewEmail = generatePerformanceReviewEmail(metrics, expectations, nextTurn, fired);
        (action as any).performanceReviewEmail = performanceReviewEmail;
        
        if (fired) {
          gameOver = true;
          gameOverReason = performanceReviewEmail.body;
        }
        
        // Update warnings if poor/failing
        if (metrics.overallRating === 'failing') newPerformanceWarnings += 2;
        else if (metrics.overallRating === 'poor') newPerformanceWarnings += 1;
        else if (metrics.overallRating === 'good' || metrics.overallRating === 'excellent') newPerformanceWarnings = Math.max(0, newPerformanceWarnings - 1);
        
        // Move current stats to previous, reset current
        newPreviousYearStats = state.yearlyStats;
        newYearlyStats = {
          year: currentYear,
          totalThefts: 0,
          totalRecovered: 0,
          policeBacklashEvents: 0,
          vandalismEvents: 0,
          detectivesHired: 0,
          detectivesQuit: 0,
          budgetSpent: 0
        };
      }

      return {
        ...state,
        currentTurn: nextTurn,
        currentBudget: budgetAfterSalaries + totalMoneyRecovered, // Add recovered money (NO auto-deduction for vandalism)
        streets: streetsAfterVandalism, // Streets recalculated without damaged items
        thefts: updatedThefts,
        detectives: detectivesWithMorale, // Updated with morale & active cases
        totalRecovered: newTotalRecovered,
        totalMoneyRecovered: state.totalMoneyRecovered + totalMoneyRecovered,
        recoveryRate: newRecoveryRate,
        policePresenceScore: policePresence,
        actionsLocked,
        backlashTurnsRemaining,
        placedInvestments: investmentsWithDamage, // Items marked as damaged, not removed
        cameras: camerasWithDamage, // Cameras marked as damaged
        vandalismAlert, // Show alert with repair/remove options
        // Performance tracking
        yearlyStats: newYearlyStats,
        previousYearStats: newPreviousYearStats,
        performanceWarnings: newPerformanceWarnings,
        gameOver,
        gameOverReason
      };

    case GAME_ACTION_TYPES.RESET_GAME:
      // Reset game but preserve loaded streets data
      // Reset all streets to their original state (clear investments and recalculate)
      const resetStreets = state.streets.map(street => ({
        ...street,
        investment: 0,
        lightingScore: street.baseLightingScore || street.lightingScore,
        surveillanceScore: 0,
        cameraCount: 0,
        cameras: [],
        // Recalculate risk with no investments
        riskPercentage: calculateRiskPercentage({
          ...street,
          investment: 0,
          lightingScore: street.baseLightingScore || street.lightingScore,
          surveillanceScore: 0
        })
      }));
      
      return {
        ...initialState,
        streets: resetStreets, // Preserve the streets data
        detectiveMarketplace: generateDetectiveMarketplace() // Generate fresh marketplace
      };

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

      // Get patrol frequency from action payload or use default
      const patrolFreq = (action.payload as any).patrolFrequency || GAMEPLAY_CONFIG.INVESTMENT.PATROL.DEFAULT_FREQUENCY;
      
      // Create new placed investment
      const newPlacement: any = {
        id: `${placementInvestment.effect}-${Date.now()}-${Math.random()}`,
        type: state.selectedInvestment,
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
        effectRadius: placementInvestment.effectRadius || 50,
        cost: placementInvestment.cost,
        placedAt: state.currentTurn,
        // Type-specific data (from config)
        quality: placementInvestment.cameraQuality,
        lightingLevel: placementInvestment.effect === 'lighting' ? GAMEPLAY_CONFIG.INVESTMENT.DEFAULTS.LIGHTING_LEVEL : undefined,
        patrolFrequency: (placementInvestment.effect === 'enforcement' ? patrolFreq : undefined) as 'low' | 'medium' | 'high' | undefined,
        capacity: placementInvestment.effect === 'security' ? GAMEPLAY_CONFIG.INVESTMENT.DEFAULTS.PARKING_CAPACITY : undefined
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
          
          // Recalculate PROJECTED risk with new factors (future prediction)
          updatedStreet.riskPercentage = calculateRiskPercentage(updatedStreet);
          
          // DO NOT touch historicalRisk - it's based on past data (2023-2024) and should never change!
          // historicalRisk represents ACTUAL historical theft rates, not projections
          
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
          // DO NOT modify historicalRisk - it represents actual past data
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
          // DO NOT modify historicalRisk - it stays constant as past data
          
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
        currentEmployer: undefined,
        lastEmailTurn: state.currentTurn, // Track when they sent their intro email
        morale: 75 // Start with good morale
      };

      // Generate hire email for GameControls to dispatch
      (action as any).hireEmail = generateHireEmail(hiredDetective, state.currentTurn);

      return {
        ...state,
        detectives: [...state.detectives, hiredDetective],
        detectiveMarketplace: state.detectiveMarketplace.filter(d => d.id !== detectiveId),
        currentBudget: state.currentBudget - offeredSalary,
        yearlyStats: {
          ...state.yearlyStats,
          detectivesHired: state.yearlyStats.detectivesHired + 1
        }
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

    case GAME_ACTION_TYPES.DISMISS_VANDALISM_ALERT:
      return {
        ...state,
        vandalismAlert: null
      };

    case GAME_ACTION_TYPES.REPAIR_INVESTMENT:
      const investmentToRepair = state.placedInvestments.find(inv => inv.id === action.payload);
      if (!investmentToRepair || !investmentToRepair.damaged || !investmentToRepair.repairCost) {
        return state;
      }
      
      if (state.currentBudget < investmentToRepair.repairCost) {
        alert('Not enough budget to repair this item!');
        return state;
      }
      
      // Repair the investment
      const repairedInvestments = state.placedInvestments.map(inv => 
        inv.id === action.payload ? { ...inv, damaged: false, repairCost: undefined } : inv
      );
      
      // Recalculate street stats with repaired item now functional
      const streetsAfterRepair = state.streets.map(street =>
        recalculateStreetFromInvestments(street, repairedInvestments)
      );
      
      return {
        ...state,
        currentBudget: state.currentBudget - investmentToRepair.repairCost,
        placedInvestments: repairedInvestments,
        cameras: state.cameras.map(cam => 
          cam.id === action.payload ? { ...cam, damaged: undefined } as any : cam
        ),
        streets: streetsAfterRepair
      };

    case GAME_ACTION_TYPES.REMOVE_DAMAGED_INVESTMENT:
      // Remove the damaged investment
      const investmentsAfterDamageRemoval = state.placedInvestments.filter(inv => inv.id !== action.payload);
      
      // Recalculate street stats without removed item
      const streetsAfterDamageRemoval = state.streets.map(street =>
        recalculateStreetFromInvestments(street, investmentsAfterDamageRemoval)
      );
      
      return {
        ...state,
        placedInvestments: investmentsAfterDamageRemoval,
        cameras: state.cameras.filter(cam => cam.id !== action.payload),
        streets: streetsAfterDamageRemoval
      };

    default:
      return state;
  }
}