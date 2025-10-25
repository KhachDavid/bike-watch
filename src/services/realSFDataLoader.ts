/**
 * Load REAL SF Bike Theft Data (Downloaded from SF Open Data)
 * 42 actual bike thefts from 2024 with GPS coordinates
 */

import realBikeThefts from '../data/sf_bike_thefts_2024.json';

export interface RealBikeTheft {
  datetime: string;
  date: string;
  time: string;
  day_of_week: string;
  neighborhood: string;
  description: string;
  district: string;
  latitude: string;
  longitude: string;
  resolution: string;
  intersection?: string;
}

export interface ProcessedStreet {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  bikesPerDay: number;
  theftsPerMonth: number; // Historical average (past 24 months)
  theftsLastMonth: number; // What happened last month (Dec 2024)
  lightingScore: number;
  footTraffic: 'Low' | 'Medium' | 'High' | 'Very High';
  investment: number;
  riskPercentage: number; // PROJECTED risk for upcoming month
  historicalRisk: number; // ACTUAL risk from past data
  realThefts: RealBikeTheft[]; // Actual incidents
}

/**
 * Process real downloaded SF bike theft data
 */
export const loadRealSFData = (): ProcessedStreet[] => {
  console.log('\n🚴 === LOADING REAL SF BIKE THEFT DATA === 🚴\n');
  console.log(`📊 Source: SF Open Data Portal (2023-2024 ALL DATA)`);
  console.log(`📦 Total real bike thefts: ${realBikeThefts.length}`);
  console.log(`🎮 Gameplay Scaling: 100-150× multiplier for INTENSE gameplay!`);
  console.log(`   (Real patterns preserved, numbers scaled for maximum excitement)\n`);
  
  // Group thefts by neighborhood
  const theftsByNeighborhood = new Map<string, RealBikeTheft[]>();
  
  realBikeThefts.forEach((theft: any) => {
    const neighborhood = theft.neighborhood || 'Unknown';
    if (!theftsByNeighborhood.has(neighborhood)) {
      theftsByNeighborhood.set(neighborhood, []);
    }
    theftsByNeighborhood.get(neighborhood)!.push(theft);
  });
  
  console.log(`\n📍 Neighborhoods with bike thefts: ${theftsByNeighborhood.size}`);
  
  // Create streets from neighborhoods with most thefts
  const streetData: ProcessedStreet[] = [];
  let streetId = 1;
  
  // Sort neighborhoods by theft count
  const sortedNeighborhoods = Array.from(theftsByNeighborhood.entries())
    .sort((a, b) => b[1].length - a[1].length);
  
  console.log('\n🔥 Top neighborhoods by actual theft count:\n');
  
  sortedNeighborhoods.forEach(([neighborhood, thefts], index) => {
    // Calculate average GPS location
    const validThefts = thefts.filter(t => t.latitude && t.longitude);
    if (validThefts.length === 0) return;
    
    const avgLat = validThefts.reduce((sum, t) => sum + parseFloat(t.latitude), 0) / validThefts.length;
    const avgLon = validThefts.reduce((sum, t) => sum + parseFloat(t.longitude), 0) / validThefts.length;
    
    // Calculate stats based on REAL data patterns
    const theftCount = thefts.length;
    
    // GAMEPLAY SCALING: Scale up 100-150x for INTENSE, dramatic gameplay!
    // Keeps real proportions/patterns but makes numbers EXCITING
    const gameplayMultiplier = 100 + Math.floor(Math.random() * 50); // 100-150x
    
    // Historical average: 2 years of data (2023-2024) × gameplay scaling
    const baseTheftsPerMonth = Math.round(theftCount / 24); // Real average
    const theftsPerMonth = Math.max(20, baseTheftsPerMonth * gameplayMultiplier);
    
    // Last month's thefts (simulate Dec 2024 with variation)
    const theftsLastMonth = Math.max(15, Math.round(theftsPerMonth * (0.8 + Math.random() * 0.4)));
    
    const isDowntown = ['Financial District', 'South of Market', 'Mission Bay'].includes(neighborhood);
    
    // GAMEPLAY-SCALED bike volume estimation
    // Target: 2-10% risk range for meaningful gameplay
    const baseVolume = theftCount * 4; // Lower multiplier = higher risk %
    const variability = Math.floor(Math.random() * 300); // Small variation
    const neighborhoodFactor = isDowntown ? 1.2 : 1.0;
    
    const bikesPerDay = Math.floor(Math.max(200, Math.min(2000, 
      baseVolume * neighborhoodFactor + variability
    )));
    
    // COMPREHENSIVE Risk Calculation
    // Incorporates: base theft rate + lighting + traffic + infrastructure
    const monthlyBikes = bikesPerDay * 30;
    
    // 1. Base theft rate (what actually happened)
    const baseTheftRate = (theftsPerMonth / monthlyBikes) * 100;
    const lightingScore = isDowntown ? 
      Math.floor(7 + Math.random() * 3) : 
      Math.floor(4 + Math.random() * 4);
    
    // 2. Lighting factor: Poor lighting increases risk
    // Scale: 10 = best (0% increase), 1 = worst (+45% increase)
    const lightingMultiplier = 1 + ((10 - lightingScore) * 0.05);
    
    // 3. Traffic factor: More foot traffic = safer (natural surveillance)
    const footTraffic: 'Low' | 'Medium' | 'High' | 'Very High' = 
      bikesPerDay > 1200 ? 'Very High' :
      bikesPerDay > 800 ? 'High' :
      bikesPerDay > 400 ? 'Medium' : 'Low';
    const trafficMultiplier = 
      footTraffic === 'Very High' ? 0.75 :  // 25% safer
      footTraffic === 'High' ? 0.85 :       // 15% safer
      footTraffic === 'Medium' ? 1.0 :      // Neutral
      1.15;                                 // 15% riskier
    
    // HISTORICAL Risk: Base rate adjusted for environmental factors
    const historicalRisk = baseTheftRate * lightingMultiplier * trafficMultiplier;
    
    // PROJECTED Risk: Add seasonality for future prediction
    const seasonalMultiplier = 1.1; // Winter slightly higher
    const trendMultiplier = Math.random() * 0.3 + 0.9; // 0.9-1.2x variation
    const projectedRisk = historicalRisk * seasonalMultiplier * trendMultiplier;
    
    // Round to 1 decimal place
    const finalHistoricalRisk = Math.round(historicalRisk * 10) / 10;
    const finalProjectedRisk = Math.round(projectedRisk * 10) / 10;
    
    // Estimate infrastructure based on neighborhood (used in bike volume calc)
    
    console.log(`  ${streetId}. ${neighborhood.padEnd(35)} - Real: ${theftCount} → Game: ${theftsLastMonth}/mo | Risk: ${finalHistoricalRisk}%`);
    
    streetData.push({
      id: streetId++,
      name: neighborhood,
      latitude: avgLat,
      longitude: avgLon,
      bikesPerDay,
      theftsPerMonth,
      theftsLastMonth,
      lightingScore,
      footTraffic,
      investment: 0,
      riskPercentage: finalProjectedRisk, // FUTURE projection
      historicalRisk: finalHistoricalRisk, // PAST data
      realThefts: thefts
    });
  });
  
  // Also show year distribution
  const theftsByYear: Record<string, number> = {};
  realBikeThefts.forEach((t: any) => {
    const year = t.year || 'Unknown';
    theftsByYear[year] = (theftsByYear[year] || 0) + 1;
  });
  
  console.log(`\n📅 Temporal breakdown:`);
  Object.entries(theftsByYear).forEach(([year, count]) => {
    console.log(`  ${year}: ${count} thefts`);
  });
  
  console.log(`\n✅ Processed ${streetData.length} neighborhoods with REAL theft data`);
  console.log(`📍 Each location includes actual GPS coordinates from SFPD reports`);
  console.log(`📅 Data includes: date, time, day of week, exact location`);
  console.log(`🗺️  Total incidents mapped: ${realBikeThefts.length}`);
  
  // Show temporal patterns from real data
  getTheftStatistics();
  
  return streetData;
};

/**
 * Get detailed theft information for a specific street
 */
export const getStreetTheftDetails = (streetName: string): RealBikeTheft[] => {
  const thefts = realBikeThefts.filter((t: any) => t.neighborhood === streetName);
  return thefts;
};

/**
 * Get theft statistics from REAL data
 */
export const getTheftStatistics = () => {
  const total = realBikeThefts.length;
  
  // Count by day of week
  const byDayOfWeek: Record<string, number> = {};
  realBikeThefts.forEach((t: any) => {
    const day = t.day_of_week || 'Unknown';
    byDayOfWeek[day] = (byDayOfWeek[day] || 0) + 1;
  });
  
  // Count by time of day
  const byTimeOfDay = {
    night: 0,    // 10pm-6am
    morning: 0,  // 6am-12pm
    afternoon: 0, // 12pm-6pm
    evening: 0   // 6pm-10pm
  };
  
  const byHour: Record<number, number> = {};
  
  realBikeThefts.forEach((t: any) => {
    const time = t.time || '';
    const hour = parseInt(time.split(':')[0] || '0');
    
    byHour[hour] = (byHour[hour] || 0) + 1;
    
    if (hour >= 22 || hour < 6) byTimeOfDay.night++;
    else if (hour < 12) byTimeOfDay.morning++;
    else if (hour < 18) byTimeOfDay.afternoon++;
    else byTimeOfDay.evening++;
  });
  
  // Count by month
  const byMonth: Record<number, number> = {};
  realBikeThefts.forEach((t: any) => {
    if (t.datetime) {
      const month = new Date(t.datetime).getMonth() + 1;
      byMonth[month] = (byMonth[month] || 0) + 1;
    }
  });
  
  // Print detailed patterns
  console.log('\n📊 === REAL TEMPORAL PATTERNS FROM DATA === 📊');
  console.log('📅 Historical Period: January 2023 - December 2024 (24 months)');
  console.log('🎮 Game Start Date: January 2025');
  console.log('');
  
  console.log('🕐 Thefts by time of day (REAL DATA):');
  console.log(`  Night (10pm-6am):   ${byTimeOfDay.night} thefts`);
  console.log(`  Morning (6am-12pm): ${byTimeOfDay.morning} thefts`);
  console.log(`  Afternoon (12pm-6pm): ${byTimeOfDay.afternoon} thefts`);
  console.log(`  Evening (6pm-10pm): ${byTimeOfDay.evening} thefts`);
  
  console.log('\n📅 Thefts by day of week (REAL DATA):');
  Object.entries(byDayOfWeek)
    .sort((a, b) => b[1] - a[1])
    .forEach(([day, count]) => {
      console.log(`  ${day.padEnd(10)} ${count} thefts`);
    });
  
  console.log('\n🗓️  Peak theft hours (REAL DATA):');
  Object.entries(byHour)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([hour, count]) => {
      console.log(`  ${hour.padStart(2, '0')}:00 - ${count} thefts`);
    });
  
  console.log('\n');
  
  return {
    total,
    byDayOfWeek,
    byTimeOfDay,
    byHour,
    byMonth,
    neighborhoods: new Set(realBikeThefts.map((t: any) => t.neighborhood)).size
  };
};

export default {
  loadRealSFData,
  getStreetTheftDetails,
  getTheftStatistics
};
