/**
 * Vandalism System
 * Vandals can damage/destroy placed investments
 */

import { PlacedInvestment, Street } from '../types';
import { Email } from '../types/email.types';
import GAMEPLAY_CONFIG from '../config/gameplay';

export interface VandalismIncident {
  id: string;
  targetId: string;
  targetType: string;
  targetName: string;
  location: { lat: number; lon: number };
  turn: number;
  repairCost: number;
}

/**
 * Check if vandalism occurs this turn
 */
export function shouldVandalismOccur(streets: Street[]): boolean {
  if (!GAMEPLAY_CONFIG.VANDALISM.ENABLED) return false;
  
  // Base probability
  let probability = GAMEPLAY_CONFIG.VANDALISM.BASE_PROBABILITY;
  
  // Increase if there are high-risk streets
  const avgRisk = streets.reduce((sum, s) => sum + s.riskPercentage, 0) / streets.length;
  if (avgRisk > 8) {
    probability *= GAMEPLAY_CONFIG.VANDALISM.HIGH_RISK_MULTIPLIER;
  }
  
  return Math.random() < probability;
}

/**
 * Select targets for vandalism based on weights
 */
export function selectVandalismTargets(placedInvestments: PlacedInvestment[]): PlacedInvestment[] {
  if (placedInvestments.length === 0) return [];
  
  // Build weighted array of eligible targets
  const weightedTargets: { investment: PlacedInvestment; weight: number }[] = [];
  
  placedInvestments.forEach(investment => {
    let weight = 0;
    
    if (investment.type.includes('camera')) {
      weight = GAMEPLAY_CONFIG.VANDALISM.CAMERA_TARGET_WEIGHT;
    } else if (investment.type.includes('lighting')) {
      weight = GAMEPLAY_CONFIG.VANDALISM.LIGHTING_TARGET_WEIGHT;
    } else if (investment.type.includes('parking')) {
      weight = GAMEPLAY_CONFIG.VANDALISM.PARKING_TARGET_WEIGHT;
    } else if (investment.type.includes('programs')) {
      weight = GAMEPLAY_CONFIG.VANDALISM.COMMUNITY_TARGET_WEIGHT;
    } else if (investment.type.includes('patrols')) {
      weight = GAMEPLAY_CONFIG.VANDALISM.PATROL_TARGET_WEIGHT;
    }
    
    if (weight > 0) {
      weightedTargets.push({ investment, weight });
    }
  });
  
  if (weightedTargets.length === 0) return [];
  
  // Calculate total weight
  const totalWeight = weightedTargets.reduce((sum, t) => sum + t.weight, 0);
  
  // Select 1-3 targets
  const numTargets = Math.floor(
    Math.random() * (GAMEPLAY_CONFIG.VANDALISM.MAX_TARGETS - GAMEPLAY_CONFIG.VANDALISM.MIN_TARGETS + 1)
  ) + GAMEPLAY_CONFIG.VANDALISM.MIN_TARGETS;
  
  const selected: PlacedInvestment[] = [];
  const availableTargets = [...weightedTargets];
  
  for (let i = 0; i < numTargets && availableTargets.length > 0; i++) {
    // Weighted random selection
    const random = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    
    for (let j = 0; j < availableTargets.length; j++) {
      cumulativeWeight += availableTargets[j].weight;
      if (random <= cumulativeWeight) {
        selected.push(availableTargets[j].investment);
        availableTargets.splice(j, 1);
        break;
      }
    }
  }
  
  return selected;
}

/**
 * Calculate repair cost for a vandalized investment
 */
export function calculateRepairCost(investment: PlacedInvestment): number {
  let multiplier = 0.3; // Default 30%
  
  if (investment.type.includes('camera')) {
    multiplier = GAMEPLAY_CONFIG.VANDALISM.CAMERA_REPAIR_COST;
  } else if (investment.type.includes('lighting')) {
    multiplier = GAMEPLAY_CONFIG.VANDALISM.LIGHTING_REPAIR_COST;
  } else if (investment.type.includes('parking')) {
    multiplier = GAMEPLAY_CONFIG.VANDALISM.PARKING_REPAIR_COST;
  } else if (investment.type.includes('programs')) {
    multiplier = GAMEPLAY_CONFIG.VANDALISM.COMMUNITY_REPAIR_COST;
  }
  
  return Math.round(investment.cost * multiplier);
}

/**
 * Get human-readable name for investment type
 */
function getInvestmentName(investment: PlacedInvestment): string {
  if (investment.type.includes('camera')) {
    const quality = investment.quality || 'standard';
    return `${quality.toUpperCase()} Camera`;
  } else if (investment.type.includes('lighting')) {
    return 'Street Lighting';
  } else if (investment.type.includes('parking')) {
    return 'Secure Bike Parking';
  } else if (investment.type.includes('programs')) {
    return 'Community Program Center';
  }
  return 'Infrastructure';
}

/**
 * Generate vandalism incidents
 */
export function generateVandalismIncidents(
  placedInvestments: PlacedInvestment[],
  streets: Street[],
  currentTurn: number
): VandalismIncident[] {
  const incidents: VandalismIncident[] = [];
  
  if (!shouldVandalismOccur(streets)) {
    return incidents;
  }
  
  const targets = selectVandalismTargets(placedInvestments);
  
  targets.forEach(target => {
    incidents.push({
      id: `vandalism-${currentTurn}-${target.id}`,
      targetId: target.id,
      targetType: target.type,
      targetName: getInvestmentName(target),
      location: { lat: target.latitude, lon: target.longitude },
      turn: currentTurn,
      repairCost: calculateRepairCost(target)
    });
  });
  
  return incidents;
}

/**
 * Generate email notification about vandalism
 */
export function generateVandalismEmail(incidents: VandalismIncident[], turn: number): Email {
  const totalCost = incidents.reduce((sum, i) => sum + i.repairCost, 0);
  const itemList = incidents.map(i => `  • ${i.targetName} (Repair: $${i.repairCost.toLocaleString()})`).join('\n');
  
  const severity = incidents.length >= 3 ? 'MAJOR' : incidents.length >= 2 ? 'SIGNIFICANT' : 'MINOR';
  
  return {
    id: `vandalism-email-${turn}`,
    from: 'Operations Team',
    fromTitle: 'SF Bicycle Security Operations',
    subject: `${severity} VANDALISM INCIDENT - ${incidents.length} Asset${incidents.length > 1 ? 's' : ''} Damaged`,
    body: `We're reporting a vandalism incident affecting your deployed infrastructure.

INCIDENT SUMMARY:
${itemList}

TOTAL REPAIR COST: $${totalCost.toLocaleString()}

The damaged equipment has been automatically removed from service. You'll need to redeploy or choose alternative security measures.

This is unfortunately common in high-crime areas. Consider diversifying your approach - community programs may face less vandalism than cameras in some neighborhoods.

Stay safe out there.

Operations Team
SF Bicycle Security`,
    timestamp: new Date(),
    read: false,
    priority: incidents.length >= 3 ? 'high' : 'normal'
  };
}
