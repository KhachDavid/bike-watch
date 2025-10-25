# Using Real San Francisco Bike Theft Data

## Data Source
San Francisco Open Data Portal provides real bike theft data:
- **API Endpoint**: `https://data.sfgov.org/resource/tmnf-yvry.json`
- **Documentation**: https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-2018-to-Present/wg3w-h783

## Sample API Query for Bike Thefts

```bash
# Get recent bike thefts in SF
curl "https://data.sfgov.org/resource/wg3w-h783.json?\$where=incident_category='Larceny Theft' AND incident_subcategory='Larceny - From Vehicle'&\$limit=100"
```

## Data Structure

Each incident includes:
- `incident_datetime`: When it occurred
- `latitude` / `longitude`: Exact location
- `police_district`: Which district
- `analysis_neighborhood`: Neighborhood name
- `incident_description`: Details about the theft

## Real SF Neighborhoods for Streets

Based on actual SF data, here are high bike traffic areas:

1. **Mission District** (37.7599, -122.4148)
   - High bike traffic
   - Mixed lighting
   - Moderate theft risk

2. **SoMa** (37.7749, -122.4094)
   - Very high bike traffic
   - Good lighting in some areas
   - High theft risk near transit

3. **Financial District** (37.7946, -122.3999)
   - High commuter traffic
   - Excellent lighting
   - Moderate risk

4. **Hayes Valley** (37.7756, -122.4244)
   - Moderate bike traffic
   - Good lighting
   - Low to moderate risk

5. **Castro** (37.7609, -122.4350)
   - High bike traffic
   - Good lighting
   - Low risk

6. **Embarcadero** (37.7955, -122.3937)
   - Very high bike traffic
   - Excellent lighting
   - Low risk (high foot traffic)

7. **Potrero Hill** (37.7587, -122.4015)
   - Moderate bike traffic
   - Mixed lighting
   - Moderate risk

8. **Nob Hill** (37.7926, -122.4161)
   - Moderate bike traffic
   - Good lighting
   - Low to moderate risk

## Implementation Steps

### 1. Update Street Data with Real Coordinates

In `src/store/reducers/game.reducer.ts`, replace mock data with:

```typescript
const REAL_SF_STREETS = [
  {
    id: 1,
    name: "Mission St & 16th St",
    latitude: 37.7647,
    longitude: -122.4194,
    bikesPerDay: 2800,
    // ... other properties
  },
  {
    id: 2,
    name: "Market St & 5th St",
    latitude: 37.7844,
    longitude: -122.4078,
    bikesPerDay: 4200,
    // ... other properties
  }
  // Add more real SF locations
];
```

### 2. Fetch Real-Time Data (Optional)

Create a service to fetch live data:

```typescript
// src/services/sfDataService.ts
export const fetchBikeTheftData = async () => {
  const response = await fetch(
    'https://data.sfgov.org/resource/wg3w-h783.json?' +
    '$where=incident_category=\'Larceny Theft\' AND ' +
    'incident_subcategory LIKE \'%Bicycle%\'&' +
    '$limit=1000&' +
    '$order=incident_datetime DESC'
  );
  return response.json();
};
```

### 3. Process Real Data

Transform SF data into game format:

```typescript
const processRealData = (incidents: any[]) => {
  // Group by neighborhood
  // Calculate theft rates
  // Map to street data structure
};
```

## Benefits of Using Real Data

✅ **Realistic simulation** - Based on actual urban patterns
✅ **Educational value** - Users learn about real bike theft hotspots
✅ **Better testing** - Real geographic clustering
✅ **Credibility** - Data-driven decision making

## Next Steps

1. Replace mock coordinates with real SF locations
2. Add more SF streets based on actual bike routes
3. Optional: Integrate live API for dynamic data
4. Add neighborhood grouping based on SF districts
