import { TheftIncident, Street, Camera, PlacedInvestment } from '../types';

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
          if (isCoveredByInvestment(location.lat, location.lon, investment)) {
            if (investment.type.includes('camera')) {
              const quality = investment.quality || 'standard';
              const cameraDeterrence = quality === 'ai-enabled' ? 0.4 : quality === 'hd' ? 0.3 : 0.2;
              totalDeterrence += cameraDeterrence;
            } else if (investment.type.includes('lighting')) {
              enhancedLighting = true;
              totalDeterrence += 0.15; // Lighting provides deterrence
            } else if (investment.type.includes('parking')) {
              hasSecureParking = true;
              totalDeterrence += 0.25; // Secure parking strongly deters
            } else if (investment.type.includes('programs')) {
              hasCommunityProgram = true;
              totalDeterrence += 0.10; // Community watch
            } else if (investment.type.includes('patrols')) {
              hasPatrol = true;
              totalDeterrence += 0.30; // Police patrol is strong deterrent
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
        const recoveryRate = hasCameraFootage ? 
          (footageQuality === 'ai-enabled' ? 0.8 :
           footageQuality === 'hd' ? 0.6 : 0.4) : 0.1;
        
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
          assignedDetective: undefined
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
  
  // Detective can work on multiple cases per turn
  const casesPerTurn = 
    detective.skill === 'expert' ? Math.floor(Math.random() * 3) + 3 : // 3-5
    detective.skill === 'senior' ? Math.floor(Math.random() * 2) + 2 : // 2-3
    Math.floor(Math.random() * 2) + 1; // 1-2 for junior
  
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
    const timeDecay = Math.max(0.1, 1 - (turnsSinceTheft * 0.15)); // -15% per turn
    
    // Solve probability
    let solveChance = detective.solveRate * theft.recoveryRate * timeDecay;
    
    // Footage quality bonus
    if (theft.hasCameraFootage) {
      const footageBonus = 
        theft.footageQuality === 'ai-enabled' ? 1.5 :
        theft.footageQuality === 'hd' ? 1.3 : 1.1;
      solveChance *= footageBonus;
    }
    
    solveChance = Math.min(0.95, solveChance); // Cap at 95%
    
    if (Math.random() < solveChance) {
      solvedIds.push(theft.id);
    }
  });
  
  return solvedIds;
}

/**
 * Calculate overall recovery rate
 */
export function calculateRecoveryRate(thefts: TheftIncident[]): number {
  if (thefts.length === 0) return 0;
  const solved = thefts.filter(t => t.solved).length;
  return Math.round((solved / thefts.length) * 100);
}
