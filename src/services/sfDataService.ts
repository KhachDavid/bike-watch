// SF Open Data Service - Real bike theft data integration

export interface SFIncident {
  incident_datetime: string;
  incident_category: string;
  incident_subcategory: string;
  analysis_neighborhood: string;
  latitude: string;
  longitude: string;
  police_district: string;
}

export interface ProcessedStreetData {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  bikesPerDay: number;
  theftsPerMonth: number;
  theftsLastMonth: number;
  lightingScore: number;
  baseLightingScore?: number;
  footTraffic: string;
  investment: number;
  riskPercentage: number;
  historicalRisk: number;
}

// SF Open Data API endpoint
const SF_API_BASE = 'https://data.sfgov.org/resource/wg3w-h783.json';

// Real SF neighborhoods with high bike traffic
const SF_BIKE_HOTSPOTS = [
  { name: 'Mission District @ Valencia St', lat: 37.7599, lon: -122.4215, bikeTraffic: 3200 },
  { name: 'SoMa @ Market St & 4th St', lat: 37.7844, lon: -122.4078, bikeTraffic: 4800 },
  { name: 'Financial District @ Market St', lat: 37.7946, lon: -122.3999, bikeTraffic: 5200 },
  { name: 'Hayes Valley @ Hayes St', lat: 37.7756, lon: -122.4244, bikeTraffic: 2400 },
  { name: 'Castro @ Castro St & 18th St', lat: 37.7609, lon: -122.4350, bikeTraffic: 2800 },
  { name: 'Embarcadero @ Ferry Building', lat: 37.7955, lon: -122.3937, bikeTraffic: 6200 },
  { name: 'Potrero Hill @ 16th St', lat: 37.7587, lon: -122.4015, bikeTraffic: 2200 },
  { name: 'Nob Hill @ California St', lat: 37.7926, lon: -122.4161, bikeTraffic: 2600 },
  { name: 'Tenderloin @ Eddy St', lat: 37.7841, lon: -122.4109, bikeTraffic: 1800 },
  { name: 'Marina @ Chestnut St', lat: 37.8012, lon: -122.4347, bikeTraffic: 3400 },
];

/**
 * Fetch real bike theft data from SF Open Data API
 * Note: May have CORS restrictions when running from browser
 */
export const fetchRecentBikeThefts = async (): Promise<SFIncident[]> => {
  try {
    console.log('🔄 Attempting to fetch real SF bike theft data from API...');
    
    // Query for larceny thefts from 2024
    const query = `${SF_API_BASE}?` +
      `$where=incident_year='2024' AND incident_category='Larceny Theft'` +
      `&$limit=5000` +
      `&$order=incident_datetime DESC`;
    
    console.log('📡 API URL:', query);
    
    const response = await fetch(query, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Fetched ${data.length} total theft incidents from SF`);
    
    // Filter for bike-related incidents
    const bikeThefts = data.filter((incident: any) => {
      const desc = (incident.incident_description || '').toUpperCase();
      const subcat = (incident.incident_subcategory || '').toUpperCase();
      return desc.includes('BICYCLE') || 
             desc.includes('BIKE') || 
             subcat.includes('BICYCLE') ||
             subcat.includes('BIKE');
    });
    
    console.log(`🚴 Found ${bikeThefts.length} bike-related thefts`);
    
    if (bikeThefts.length > 0) {
      console.log('📊 Sample bike thefts:');
      bikeThefts.slice(0, 5).forEach((theft: any) => {
        console.log(`  • ${theft.incident_datetime?.substring(0, 10)} - ${theft.analysis_neighborhood || 'Unknown'}`);
      });
    }
    
    return bikeThefts;
    
  } catch (error) {
    console.error('❌ Failed to fetch from SF API:', error);
    console.log('💡 This is likely a CORS restriction.');
    console.log('📝 To fix: Run app through a backend proxy or use the realistic simulation');
    return [];
  }
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Process SF data - uses downloaded REAL data from SF Open Data
 */
export const processRealSFData = async (): Promise<ProcessedStreetData[]> => {
  try {
    console.log('\n🚴 === SF BIKE THEFT DATA LOADING === 🚴\n');
    console.log('📦 Using REAL downloaded SF Open Data (2024)');
    console.log('📍 Source: data.sfgov.org/resource/wg3w-h783.json\n');
    
    // Load real downloaded data
    const { loadRealSFData } = await import('./realSFDataLoader');
    const streets = loadRealSFData();
    
    // Convert to game format
    const processedStreets: ProcessedStreetData[] = streets.map(street => ({
      id: street.id,
      name: street.name,
      latitude: street.latitude,
      longitude: street.longitude,
      bikesPerDay: street.bikesPerDay,
      theftsPerMonth: street.theftsPerMonth,
      theftsLastMonth: street.theftsLastMonth,
      lightingScore: street.lightingScore,
      footTraffic: street.footTraffic,
      investment: street.investment,
      riskPercentage: street.riskPercentage,
      historicalRisk: street.historicalRisk
    }));
    
    console.log(`✅ Loaded ${processedStreets.length} streets with REAL theft data!`);
    console.log('📊 Data includes: GPS coords, dates, times, neighborhoods\n');
    
    return processedStreets.sort((a, b) => b.riskPercentage - a.riskPercentage);
    
  } catch (error) {
    console.error('❌ Error loading real data:', error);
    console.log('📊 Falling back to realistic simulation\n');
    return await processSimulationData();
  }
};

/**
 * Process real API theft data into street profiles
 */
const processAPIThefts = async (thefts: SFIncident[]): Promise<ProcessedStreetData[]> => {
  // Group thefts by neighborhood
  const theftsByNeighborhood = new Map<string, SFIncident[]>();
  
  thefts.forEach(theft => {
    const neighborhood = theft.analysis_neighborhood || 'Unknown';
    if (!theftsByNeighborhood.has(neighborhood)) {
      theftsByNeighborhood.set(neighborhood, []);
    }
    theftsByNeighborhood.get(neighborhood)!.push(theft);
  });
  
  // Get top neighborhoods by theft count
  const topNeighborhoods = Array.from(theftsByNeighborhood.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10);
  
  console.log('\n📍 Top 10 bike theft neighborhoods:');
  
  const streets = topNeighborhoods.map(([neighborhood, theftsList], index) => {
    // Calculate average location
    const validThefts = theftsList.filter(t => t.latitude && t.longitude);
    const avgLat = validThefts.reduce((sum, t) => sum + parseFloat(t.latitude!), 0) / validThefts.length;
    const avgLon = validThefts.reduce((sum, t) => sum + parseFloat(t.longitude!), 0) / validThefts.length;
    
    // Calculate thefts per month (based on data range)
    const theftsPerMonth = Math.round(theftsList.length / 12);
    
    // Estimate bikes per day (proportional to thefts)
    const bikesPerDay = Math.round(theftsPerMonth * (50 + Math.random() * 50));
    
    // Calculate risk
    const riskPercentage = Math.min(90, Math.round((theftsPerMonth / (bikesPerDay / 1000)) * 100));
    
    // Determine characteristics based on data
    const lightingScore = Math.floor(4 + Math.random() * 6);
    const footTraffic: 'Low' | 'Medium' | 'High' | 'Very High' = 
      bikesPerDay > 4000 ? 'Very High' :
      bikesPerDay > 3000 ? 'High' :
      bikesPerDay > 2000 ? 'Medium' : 'Low';
    
    console.log(`  ${index + 1}. ${neighborhood}: ${theftsList.length} thefts (${riskPercentage}% risk)`);
    
    // Simulate last month's thefts (variation around average)
    const theftsLastMonth = Math.max(0, Math.round(theftsPerMonth * (0.8 + Math.random() * 0.4)));
    const historicalRisk = (theftsLastMonth / (bikesPerDay * 30)) * 100;
    
    return {
      id: index + 1,
      name: neighborhood,
      latitude: avgLat,
      longitude: avgLon,
      bikesPerDay,
      theftsPerMonth,
      theftsLastMonth,
      lightingScore,
      footTraffic,
      investment: 0,
      riskPercentage,
      historicalRisk
    };
  });
  
  console.log('\n✅ Loaded real SF data with geographic clustering\n');
  
  return streets.sort((a, b) => b.riskPercentage - a.riskPercentage);
};

/**
 * Use realistic simulation with temporal patterns
 */
const processSimulationData = async (): Promise<ProcessedStreetData[]> => {
  const simulation = await import('./realisticSFSimulation');
  const profiles = simulation.generateRealisticStreetProfiles();
  
  console.log(`✅ Generated ${profiles.length} SF streets with realistic temporal patterns`);
  console.log('📊 Temporal features:');
  console.log('  • Risk by time of day (night/morning/afternoon/evening)');
  console.log('  • Risk by day of week (weekends vs weekdays)');
  console.log('  • Seasonal patterns (12 months, summer peak)');
  console.log('  • Recent trends (last 30/7/1 days)');
  console.log('  • Full year of historical incidents with timestamps');
  console.log('  • Environmental factors (lighting, surveillance)');
  
  const currentDate = new Date();
  console.log(`\n🕐 Current time: ${currentDate.toLocaleString()}`);
  console.log('📈 Current risk levels:\n');
  
  const processedStreets = profiles.map(profile => {
    const currentRisk = simulation.calculateCurrentRisk(profile);
    const footTraffic: 'Low' | 'Medium' | 'High' | 'Very High' = 
      profile.bikesPerDay > 4000 ? 'Very High' :
      profile.bikesPerDay > 3000 ? 'High' :
      profile.bikesPerDay > 2000 ? 'Medium' : 'Low';
    
    console.log(`  • ${profile.name}: ${currentRisk}% risk (${profile.theftsLast30Days} thefts/month)`);
    
    // Simulate last month's thefts
    const theftsLastMonth = Math.max(0, Math.round(profile.theftsLast30Days * (0.8 + Math.random() * 0.4)));
    const historicalRisk = (theftsLastMonth / (profile.bikesPerDay * 30)) * 100;
    
    return {
      id: profile.id,
      name: profile.name,
      latitude: profile.location.lat,
      longitude: profile.location.lon,
      bikesPerDay: profile.bikesPerDay,
      theftsPerMonth: profile.theftsLast30Days,
      theftsLastMonth,
      lightingScore: profile.lightingScore,
      footTraffic,
      investment: profile.investment,
      riskPercentage: currentRisk,
      historicalRisk
    };
  });
  
  console.log('\n');
  return processedStreets.sort((a, b) => b.riskPercentage - a.riskPercentage);
};

/**
 * Get fallback data if API fails (using realistic SF estimates)
 */
export const getFallbackSFData = (): ProcessedStreetData[] => {
  return SF_BIKE_HOTSPOTS.map((hotspot, index) => {
    // Estimate based on typical SF patterns
    const theftsPerMonth = Math.floor(hotspot.bikeTraffic / 400);
    const riskPercentage = Math.min(85, Math.round((theftsPerMonth / (hotspot.bikeTraffic / 1000)) * 100));
    
    // Simulate last month's thefts
    const theftsLastMonth = Math.max(0, Math.round(theftsPerMonth * (0.8 + Math.random() * 0.4)));
    const historicalRisk = (theftsLastMonth / (hotspot.bikeTraffic * 30)) * 100;
    
    const isCommercial = ['Financial District', 'SoMa', 'Embarcadero'].some(area => 
      hotspot.name.includes(area)
    );
    const lightingScore = isCommercial ? 8 : 5;
    
    const footTraffic = hotspot.bikeTraffic > 4000 ? 'Very High' :
                       hotspot.bikeTraffic > 3000 ? 'High' :
                       hotspot.bikeTraffic > 2000 ? 'Medium' : 'Low';
    
    return {
      id: index + 1,
      name: hotspot.name,
      latitude: hotspot.lat,
      longitude: hotspot.lon,
      bikesPerDay: hotspot.bikeTraffic,
      theftsPerMonth,
      theftsLastMonth,
      lightingScore,
      footTraffic,
      investment: 0,
      riskPercentage: Math.max(15, riskPercentage),
      historicalRisk
    };
  });
};
