import { TheftIncident, Street, Camera, PlacedInvestment } from '../types';
import GAMEPLAY_CONFIG from '../config/gameplay';

/**
 * Advanced theft simulation service
 * Generates theft incidents at specific lat/long coordinates based on:
 * - Lighting levels
 * - Camera coverage
 * - Foot traffic
 * - Time of day patterns
 */

interface TheftProbabilityFactors {
  lightingFactor: number; // 0-1, lower lighting = higher chance
  cameraDeterrence: number; // 0-1, more cameras = lower chance
  trafficFactor: number; // 0-1, more traffic = lower chance
  baseRisk: number; // From street risk percentage
}

/**
 * Calculate if a camera can see a specific location
 */
function isCoveredByCamera(
  theftLat: number,
  theftLon: number,
  camera: Camera
): boolean {
  // Haversine formula for distance
  const R = 6371000; // Earth radius in meters
  const lat1 = camera.latitude * Math.PI / 180;
  const lat2 = theftLat * Math.PI / 180;
  const dlat = (theftLat - camera.latitude) * Math.PI / 180;
  const dlon = (theftLon - camera.longitude) * Math.PI / 180;
  
  const a = Math.sin(dlat/2) * Math.sin(dlat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dlon/2) * Math.sin(dlon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance <= camera.coverageRadius;
}

/**
 * Get all cameras that can see a location
 */
function getCamerasAtLocation(
  latitude: number,
  longitude: number,
  cameras: Camera[]
): Camera[] {
  return cameras.filter(camera => 
    isCoveredByCamera(latitude, longitude, camera)
  );
}

/**
 * Calculate theft probability at a specific location
 */
function calculateTheftProbability(
  street: Street,
  latitude: number,
  longitude: number,
  cameras: Camera[]
): TheftProbabilityFactors {
  // 1. Lighting factor (poor lighting = higher theft chance)
  const lightingFactor = 1 - (street.lightingScore / 10);
  
  // 2. Camera deterrence
  const coveringCameras = getCamerasAtLocation(latitude, longitude, cameras);
  let cameraDeterrence = 0;
  
  if (coveringCameras.length > 0) {
    // Each camera provides deterrence based on quality
    const totalDeterrence = coveringCameras.reduce((sum, cam) => {
      const quality = cam.quality === 'ai-enabled' ? 0.4 :
                     cam.quality === 'hd' ? 0.3 : 0.2;
      return sum + quality;
    }, 0);
    cameraDeterrence = Math.min(0.8, totalDeterrence); // Max 80% deterrence
  }
  
  // 3. Traffic factor (natural surveillance)
  const trafficFactor = 
    street.footTraffic === 'Very High' ? 0.7 :
    street.footTraffic === 'High' ? 0.5 :
    street.footTraffic === 'Medium' ? 0.3 : 0.1;
  
  // 4. Base risk from street data
  const baseRisk = street.riskPercentage / 100;
  
  return {
    lightingFactor,
    cameraDeterrence,
    trafficFactor,
    baseRisk
  };
}

/**
 * Generate theft location within street bounds
 */
function generateTheftLocation(street: Street): { lat: number; lon: number } {
  if (!street.latitude || !street.longitude) {
    // Fallback to SF center
    return { lat: 37.7749, lon: -122.4194 };
  }
  
  // Generate random point within ~200m radius of street center
  // This simulates thefts happening along the street
  const radiusInDegrees = 200 / 111000; // ~200m in degrees
  const angle = Math.random() * 2 * Math.PI;
  const radius = Math.random() * radiusInDegrees;
  
  return {
    lat: street.latitude + (radius * Math.cos(angle)),
    lon: street.longitude + (radius * Math.sin(angle))
  };
}

/**
 * Check if location is covered by any placed investment
 */
function isCoveredByInvestment(
  latitude: number,
  longitude: number,
  investment: PlacedInvestment
): boolean {
  const R = 6371000;
  const lat1 = investment.latitude * Math.PI / 180;
  const lat2 = latitude * Math.PI / 180;
  const dlat = (latitude - investment.latitude) * Math.PI / 180;
  const dlon = (longitude - investment.longitude) * Math.PI / 180;
  
  const a = Math.sin(dlat/2) * Math.sin(dlat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dlon/2) * Math.sin(dlon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance <= investment.effectRadius;
}

/**
 * Simulate thefts for a turn
 * Returns array of theft incidents
 * NOW considers ALL placed investments, not just cameras
 */
export function simulateThefts(
  streets: Street[],
  cameras: Camera[],
  currentTurn: number,
  placedInvestments?: PlacedInvestment[]
): TheftIncident[] {
  const thefts: TheftIncident[] = [];
  
  streets.forEach(street => {
    // Calculate expected thefts this turn based on risk
    const monthlyThefts = street.theftsPerMonth;
    const expectedThefts = monthlyThefts; // One turn = one month
    
    // Generate individual theft incidents
    for (let i = 0; i < expectedThefts; i++) {
      const location = generateTheftLocation(street);
      
      // Calculate deterrence from ALL placed investments
      let totalDeterrence = 0;
      let enhancedLighting = false;
      let hasSecureParking = false;
      let hasCommunityProgram = false;
      let hasPatrol = false;
      
      if (placedInvestments) {
        placedInvestments.forEach(investment => {
          // Skip damaged investments - they don't provide coverage
          if (investment.damaged) return;
          
          if (isCoveredByInvestment(location.lat, location.lon, investment)) {
            if (investment.type.includes('camera')) {
              const quality = investment.quality || 'standard';
              const cameraDeterrence = 
                quality === 'ai-enabled' ? GAMEPLAY_CONFIG.INVESTMENT.CAMERA_AI_DETERRENCE :
                quality === 'hd' ? GAMEPLAY_CONFIG.INVESTMENT.CAMERA_HD_DETERRENCE :
                GAMEPLAY_CONFIG.INVESTMENT.CAMERA_STANDARD_DETERRENCE;
              totalDeterrence += cameraDeterrence;
            } else if (investment.type.includes('lighting')) {
              enhancedLighting = true;
              totalDeterrence += GAMEPLAY_CONFIG.INVESTMENT.LIGHTING_DETERRENCE;
            } else if (investment.type.includes('parking')) {
              hasSecureParking = true;
              totalDeterrence += GAMEPLAY_CONFIG.INVESTMENT.PARKING_DETERRENCE;
            } else if (investment.type.includes('programs')) {
              hasCommunityProgram = true;
              totalDeterrence += GAMEPLAY_CONFIG.INVESTMENT.COMMUNITY_DETERRENCE;
            } else if (investment.type.includes('patrols')) {
              hasPatrol = true;
              // Deterrence based on patrol frequency
              const freq = investment.patrolFrequency || GAMEPLAY_CONFIG.INVESTMENT.PATROL.DEFAULT_FREQUENCY;
              const patrolDeterrence = 
                freq === 'high' ? GAMEPLAY_CONFIG.INVESTMENT.PATROL.HIGH_DETERRENCE :
                freq === 'medium' ? GAMEPLAY_CONFIG.INVESTMENT.PATROL.MEDIUM_DETERRENCE :
                GAMEPLAY_CONFIG.INVESTMENT.PATROL.LOW_DETERRENCE;
              totalDeterrence += patrolDeterrence;
            }
          }
        });
      }
      
      totalDeterrence = Math.min(0.85, totalDeterrence); // Cap at 85% deterrence
      
      const factors = calculateTheftProbability(street, location.lat, location.lon, cameras);
      
      // Calculate if theft actually occurs
      const lightingMultiplier = enhancedLighting ? 0.7 : (0.7 + factors.lightingFactor * 0.3);
      const theftProbability = factors.baseRisk * 
                               (1 - totalDeterrence) *
                               (1 - factors.trafficFactor * 0.5) *
                               lightingMultiplier;
      
      // Roll for theft occurrence
      if (Math.random() < theftProbability) {
        // Check which cameras captured this
        const coveringCameras = getCamerasAtLocation(location.lat, location.lon, cameras);
        const hasCameraFootage = coveringCameras.length > 0;
        
        // Best quality footage available
        let footageQuality: 'standard' | 'hd' | 'ai-enabled' | undefined;
        if (hasCameraFootage) {
          const hasAI = coveringCameras.some(c => c.quality === 'ai-enabled');
          const hasHD = coveringCameras.some(c => c.quality === 'hd');
          footageQuality = hasAI ? 'ai-enabled' : hasHD ? 'hd' : 'standard';
        }
        
        // Calculate recovery potential (decreases over time)
        // Even without footage, detectives use other methods
        const recoveryRate = hasCameraFootage ? 
          (footageQuality === 'ai-enabled' ? 0.8 :
           footageQuality === 'hd' ? 0.6 : 0.4) : 0.3; // Increased from 0.1 to 0.3
        
        const theft: TheftIncident = {
          id: `theft-${currentTurn}-${street.id}-${Date.now()}-${Math.random()}`,
          streetId: street.id,
          streetName: street.name,
          latitude: location.lat,
          longitude: location.lon,
          timestamp: new Date(),
          turnNumber: currentTurn,
          bikeValue: Math.floor(Math.random() * 1500) + 300, // $300-$1800
          hasCameraFootage,
          footageQuality,
          capturedByCameras: coveringCameras.map(c => c.id),
          solved: false,
          recoveryRate,
          assignedDetective: undefined,
          bikeRecovered: false,
          moneyRecovered: 0
        };
        
        thefts.push(theft);
      }
    }
  });
  
  return thefts;
}

/**
 * Detective attempts to solve cases
 * Returns array of solved theft IDs
 */
export function investigateCases(
  detective: any,
  activeCases: TheftIncident[],
  currentTurn: number
): string[] {
  const solvedIds: string[] = [];
  
  // Detective can work on multiple cases per turn based on STAMINA
  const casesPerTurn = Math.max(1, Math.min(8, Math.floor(detective.stamina / 3))); // 1-8 cases based on stamina
  
  console.log(`🔍 ${detective.name}: Stamina ${detective.stamina} → Working ${casesPerTurn} cases out of ${activeCases.length} active`);
  
  // Prioritize cases with camera footage
  const sortedCases = [...activeCases].sort((a, b) => {
    if (a.hasCameraFootage && !b.hasCameraFootage) return -1;
    if (!a.hasCameraFootage && b.hasCameraFootage) return 1;
    // Then by recovery rate
    return b.recoveryRate - a.recoveryRate;
  });
  
  const casesToWork = sortedCases.slice(0, casesPerTurn);
  
  casesToWork.forEach(theft => {
    // Time decay: cases get harder to solve over time
    const turnsSinceTheft = currentTurn - theft.turnNumber;
    const timeDecay = Math.max(0.3, 1 - (turnsSinceTheft * 0.1)); // -10% per turn, min 30%
    
    // Calculate solve probability based on detective attributes
    let solveChance = 0;
    
    if (theft.hasCameraFootage) {
      // WITH FOOTAGE: Most detectives can solve these
      solveChance = (detective.surveillance / 20) * 0.4 +
                   (detective.investigation / 20) * 0.35 +
                   (detective.forensics / 20) * 0.25;
      
      // Footage quality bonus
      const footageBonus = 
        theft.footageQuality === 'ai-enabled' ? 1.8 : // AI footage is very helpful
        theft.footageQuality === 'hd' ? 1.5 : 1.3;
      solveChance *= footageBonus;
      
      // Base multiplier so even average detectives can solve with footage
      solveChance *= 1.5;
    } else {
      // WITHOUT FOOTAGE: Only skilled/experienced detectives can solve effectively
      // Requires MINIMUM thresholds:
      // - Investigation >= 11 OR
      // - Intuition >= 13 OR
      // - Experience >= 8 years
      
      const hasMinimumSkill = detective.investigation >= 11 || 
                             detective.intuition >= 13 || 
                             detective.experience >= 8;
      
      if (!hasMinimumSkill) {
        // Rookie detective struggles without footage (but not impossible)
        solveChance = 0.05; // 5% chance
      } else {
        // Skilled detective can use traditional methods
        solveChance = (detective.investigation / 20) * 0.35 +
                     (detective.intuition / 20) * 0.40 +
                     (detective.interviewing / 20) * 0.20 +
                     (detective.forensics / 20) * 0.05;
        
        // Experience is CRITICAL without footage
        const experienceBonus = Math.max(0, (detective.experience - 3) / 25); // 0% at 3 years, 108% at 30 years
        solveChance *= (1 + experienceBonus * 1.5); // Experience matters even more
      }
    }
    
    // Apply time decay
    solveChance *= timeDecay;
    
    // Success rate historical performance
    solveChance *= detective.successRate;
    
    solveChance = Math.min(0.95, Math.max(0, solveChance));
    
    if (Math.random() < solveChance) {
      solvedIds.push(theft.id);
    }
  });
  
  console.log(`   ✅ Solved: ${solvedIds.length}/${casesToWork.length} cases`);
  
  return solvedIds;
}

/**
 * Calculate overall recovery rate
 * Based on bikes actually recovered, not just solved cases
 */
export function calculateRecoveryRate(thefts: TheftIncident[]): number {
  if (thefts.length === 0) return 0;
  const recovered = thefts.filter(t => t.bikeRecovered).length;
  return Math.round((recovered / thefts.length) * 100);
}

/**
 * Recovery breakdown by footage quality and detective performance
 */
export interface RecoveryBreakdown {
  overall: {
    total: number;
    recovered: number;
    rate: number;
  };
  byFootage: {
    noFootage: { total: number; recovered: number; rate: number };
    standard: { total: number; recovered: number; rate: number };
    hd: { total: number; recovered: number; rate: number };
    ai: { total: number; recovered: number; rate: number };
  };
  bySolved: {
    solved: number;
    unsolved: number;
    solveRate: number;
  };
  trend: {
    last3Turns: number;
    improving: boolean;
  };
  insights: string[];
}

export function calculateRecoveryBreakdown(
  thefts: TheftIncident[], 
  currentTurn: number,
  detectiveCount: number
): RecoveryBreakdown {
  const total = thefts.length;
  const recovered = thefts.filter(t => t.bikeRecovered).length;
  const solved = thefts.filter(t => t.solved).length;
  const unsolved = thefts.filter(t => !t.solved).length;
  
  // By footage quality
  const noFootageThefts = thefts.filter(t => !t.hasCameraFootage);
  const standardThefts = thefts.filter(t => t.footageQuality === 'standard');
  const hdThefts = thefts.filter(t => t.footageQuality === 'hd');
  const aiThefts = thefts.filter(t => t.footageQuality === 'ai-enabled');
  
  const calcRate = (recovered: number, total: number) => 
    total > 0 ? Math.round((recovered / total) * 100) : 0;
  
  // Recent trend (last 3 turns)
  const recentThefts = thefts.filter(t => t.turnNumber >= currentTurn - 3);
  const recentRecovered = recentThefts.filter(t => t.bikeRecovered).length;
  const recentRate = calcRate(recentRecovered, recentThefts.length);
  const overallRate = calcRate(recovered, total);
  const improving = recentRate > overallRate;
  
  // Generate insights
  const insights: string[] = [];
  
  // Detective insights
  if (detectiveCount === 0) {
    insights.push('🚨 No detectives hired - recovery rate will be very low');
  } else if (detectiveCount < 3) {
    insights.push(`⚠️ Only ${detectiveCount} detective${detectiveCount === 1 ? '' : 's'} - consider hiring more`);
  }
  
  // Footage quality insights
  const withFootage = thefts.length - noFootageThefts.length;
  const footageCoverage = calcRate(withFootage, total);
  
  if (footageCoverage < 30) {
    insights.push('📹 Low camera coverage - deploy more surveillance');
  } else if (footageCoverage < 60) {
    insights.push('📹 Moderate camera coverage - expand surveillance network');
  }
  
  // HD/AI camera insights
  const premiumFootage = hdThefts.length + aiThefts.length;
  const premiumRate = calcRate(premiumFootage, withFootage);
  
  if (withFootage > 0 && premiumRate < 30) {
    insights.push('⚡ Upgrade to HD/AI cameras for better recovery rates');
  }
  
  // Performance insights
  const noFootageRecoveryRate = calcRate(
    noFootageThefts.filter(t => t.bikeRecovered).length,
    noFootageThefts.length
  );
  
  if (noFootageRecoveryRate > 10 && detectiveCount > 0) {
    insights.push('✨ Detectives solving cases even without footage!');
  }
  
  // Trend insights
  if (improving) {
    insights.push('📈 Recovery rate improving - keep it up!');
  } else if (recentThefts.length > 5 && recentRate < overallRate - 10) {
    insights.push('📉 Recent recovery rate declining - investigate why');
  }
  
  // Active case backlog
  if (unsolved > 20) {
    insights.push(`🗂️ ${unsolved} unsolved cases - hire more detectives`);
  }
  
  return {
    overall: {
      total,
      recovered,
      rate: overallRate,
    },
    byFootage: {
      noFootage: {
        total: noFootageThefts.length,
        recovered: noFootageThefts.filter(t => t.bikeRecovered).length,
        rate: calcRate(noFootageThefts.filter(t => t.bikeRecovered).length, noFootageThefts.length),
      },
      standard: {
        total: standardThefts.length,
        recovered: standardThefts.filter(t => t.bikeRecovered).length,
        rate: calcRate(standardThefts.filter(t => t.bikeRecovered).length, standardThefts.length),
      },
      hd: {
        total: hdThefts.length,
        recovered: hdThefts.filter(t => t.bikeRecovered).length,
        rate: calcRate(hdThefts.filter(t => t.bikeRecovered).length, hdThefts.length),
      },
      ai: {
        total: aiThefts.length,
        recovered: aiThefts.filter(t => t.bikeRecovered).length,
        rate: calcRate(aiThefts.filter(t => t.bikeRecovered).length, aiThefts.length),
      },
    },
    bySolved: {
      solved,
      unsolved,
      solveRate: calcRate(solved, total),
    },
    trend: {
      last3Turns: recentRate,
      improving,
    },
    insights,
  };
}
