/**
 * Centralized Gameplay Configuration
 * All tunable game parameters in one place for easy balancing
 */

export const GAMEPLAY_CONFIG = {
  // ===== ECONOMY =====
  STARTING_BUDGET: 100000,
  MONTHLY_BUDGET_INCREASE: 10000,
  BUDGET_INCREASE_PER_TURN: 2000, // Multiplied by current turn
  
  // ===== BIKE THEFT SIMULATION =====
  // Scaling from real data (560 incidents) to gameplay
  THEFT_MULTIPLIER_MIN: 100, // 100x real data
  THEFT_MULTIPLIER_MAX: 150, // 150x real data
  
  // Risk calculation ranges
  RISK_MIN_PERCENT: 1,
  RISK_MAX_PERCENT: 15,
  
  // Risk level thresholds (for color coding)
  RISK_LOW_THRESHOLD: 4,     // Below 4% = Low
  RISK_MEDIUM_THRESHOLD: 7,  // 4-7% = Medium, above = High
  
  // Natural escalation (monthly increase without investment)
  ESCALATION_MIN: 0.02,  // 2% increase
  ESCALATION_MAX: 0.05,  // 5% increase
  
  // Historical risk floor (prevents collapse to 0)
  HISTORICAL_RISK_FLOOR: 0.3, // 30% of projected risk
  
  // ===== POLICE BACKLASH =====
  POLICE_PRESENCE: {
    // Points per patrol based on frequency
    PATROL_LOW_POINTS: 10,
    PATROL_MEDIUM_POINTS: 20,
    PATROL_HIGH_POINTS: 30,
    
    // Backlash thresholds (0-100 scale)
    WARNING_THRESHOLD: 60,   // Show yellow warnings (was 50)
    MINOR_THRESHOLD: 80,     // 1 turn lockout (was 70)
    MAJOR_THRESHOLD: 100,    // 2 turn lockout (was 85)
    SEVERE_THRESHOLD: 120,   // 3 turn lockout (was 100)
    
    // Lockout durations (in turns)
    MINOR_LOCKOUT: 1,
    MAJOR_LOCKOUT: 2,
    SEVERE_LOCKOUT: 3,
    
    // Social media response
    MINOR_POSTS: 15,
    MAJOR_POSTS: 30,
    SEVERE_POSTS: 50
  },
  
  // ===== DETECTIVES =====
  DETECTIVE: {
    // Attribute generation (0-20 scale)
    ATTR_MIN: 5,
    ATTR_MAX: 15,
    
    // Experience bonus per 5 years
    EXP_BONUS_PER_5_YEARS: 3,
    
    // Salary calculation
    BASE_SALARY: 2000,
    UNEMPLOYMENT_DISCOUNT: 0.1, // 10-20% less for unemployed
    
    // Requirements to solve cases without footage
    MIN_INVESTIGATION: 11,
    MIN_INTUITION: 13,
    MIN_EXPERIENCE: 8,
    
    // Solve rates
    ROOKIE_WITHOUT_FOOTAGE: 0.05,  // 5% chance
    SKILLED_BASE_BONUS: 0.0,       // No flat bonus, skills determine rate
    
    // Cases per turn based on stamina
    STAMINA_DIVISOR: 3,  // stamina / 3 = cases per turn
    MAX_CASES_PER_TURN: 8,
    
    // Investigation decay
    TIME_DECAY_PER_TURN: 0.1,  // -10% per turn
    TIME_DECAY_MIN: 0.3,       // Minimum 30% effectiveness
    
    // Marketplace
    MARKETPLACE_SIZE_MIN: 30,
    MARKETPLACE_SIZE_MAX: 50,
    MARKETPLACE_MIN_UNEMPLOYED: 10
  },
  
  // ===== RECOVERY SYSTEM =====
  RECOVERY: {
    // Base recovery rates by footage quality
    NO_FOOTAGE: 0.3,
    STANDARD_FOOTAGE: 0.4,
    HD_FOOTAGE: 0.6,
    AI_FOOTAGE: 0.8,
    
    // Time decay for recovery chance
    RECOVERY_DECAY_PER_TURN: 0.2,  // -20% per turn
    RECOVERY_DECAY_MIN: 0.2,       // Minimum 20% chance
    
    // Money recovery
    PARTIAL_RECOVERY_MIN: 0.1,  // 10% of bike value
    PARTIAL_RECOVERY_MAX: 0.3   // 30% of bike value
  },
  
  // ===== INVESTMENTS =====
  INVESTMENT: {
    // Camera deterrence by quality
    CAMERA_STANDARD_RADIUS: 50,
    CAMERA_HD_RADIUS: 75,
    CAMERA_AI_RADIUS: 100,
    
    CAMERA_STANDARD_DETERRENCE: 0.15,  // 15% reduction
    CAMERA_HD_DETERRENCE: 0.25,        // 25% reduction
    CAMERA_AI_DETERRENCE: 0.35,        // 35% reduction
    
    // Police Patrol Configuration
    // CURRENT STATE: All patrols are 'medium' frequency (hardcoded)
    //   - 20 political points per patrol
    //   - 25% theft deterrence
    //   - 100m effect radius
    // TO ENABLE CHOICE: Set ALLOW_FREQUENCY_CHOICE = true and build UI selector
    PATROL: {
      // Default frequency when placed (if no UI selector)
      DEFAULT_FREQUENCY: 'medium' as 'low' | 'medium' | 'high',
      
      // Whether player can choose frequency (UI feature toggle)
      ALLOW_FREQUENCY_CHOICE: true,  // UI selector is now implemented!
      
      // Deterrence by frequency level
      LOW_DETERRENCE: 0.15,      // 15% reduction
      MEDIUM_DETERRENCE: 0.25,   // 25% reduction
      HIGH_DETERRENCE: 0.35,     // 35% reduction
      
      // Effect radius by frequency
      LOW_RADIUS: 75,
      MEDIUM_RADIUS: 100,
      HIGH_RADIUS: 150,
      
      // Cost multipliers (if frequency choice enabled)
      LOW_COST_MULTIPLIER: 0.7,    // 70% of base cost
      MEDIUM_COST_MULTIPLIER: 1.0, // 100% of base cost
      HIGH_COST_MULTIPLIER: 1.4    // 140% of base cost
    },
    
    // Other investments
    LIGHTING_DETERRENCE: 0.20,      // 20% reduction
    PARKING_DETERRENCE: 0.15,       // 15% reduction
    COMMUNITY_DETERRENCE: 0.10,     // 10% reduction
    
    // Street stat improvements
    LIGHTING_IMPROVEMENT: 2,  // +2 to lighting score
    SECURITY_REDUCTION: 0.85, // Reduces base thefts to 85%
    SURVEILLANCE_REDUCTION: 0.90,  // Reduces base thefts to 90%
    
    // Default values for placed investments
    DEFAULTS: {
      LIGHTING_LEVEL: 8,        // 1-10 scale
      PARKING_CAPACITY: 20,     // Number of bike spaces
      COMMUNITY_RADIUS: 200     // meters
    }
  },
  
  // ===== SOCIAL MEDIA =====
  SOCIAL: {
    // Initial posts
    INITIAL_POSTS_MIN: 1500,
    INITIAL_POSTS_MAX: 2500,
    
    // Posts per turn
    POSTS_PER_TURN_MIN: 30,
    POSTS_PER_TURN_MAX: 60,
    
    // Sentiment thresholds
    PERFORMANCE_GOOD: 0.6,   // Above 60% = more positive
    PERFORMANCE_BAD: 0.4     // Below 40% = more negative
  },
  
  // ===== VANDALISM SYSTEM =====
  VANDALISM: {
    // Enable/disable vandalism
    ENABLED: true,
    
    // Base probability per turn that vandalism occurs (0-1)
    BASE_PROBABILITY: 0.15,  // 15% chance per turn
    
    // Probability increases with high-risk streets
    HIGH_RISK_MULTIPLIER: 1.5,  // 1.5x chance if avg risk > 8%
    
    // Targets - what can be vandalized
    CAMERA_TARGET_WEIGHT: 3,      // Cameras are primary target (3x weight)
    LIGHTING_TARGET_WEIGHT: 2,    // Lighting is secondary (2x weight)
    PARKING_TARGET_WEIGHT: 1.5,   // Secure parking less targeted
    COMMUNITY_TARGET_WEIGHT: 1,   // Community centers least targeted
    PATROL_TARGET_WEIGHT: 0,      // Can't vandalize patrols
    
    // Damage per incident
    MIN_TARGETS: 1,    // At least 1 thing damaged
    MAX_TARGETS: 3,    // Up to 3 things in one incident
    
    // Repair costs (multiplier of original cost)
    CAMERA_REPAIR_COST: 0.4,      // 40% of original cost
    LIGHTING_REPAIR_COST: 0.3,    // 30% of original cost
    PARKING_REPAIR_COST: 0.5,     // 50% of original cost
    COMMUNITY_REPAIR_COST: 0.35,  // 35% of original cost
  },
  
  // ===== GAME START =====
  GAME_START_DATE: new Date(2025, 0, 1), // January 2025
  DATA_PERIOD: '2023-2024',
  DATA_INCIDENTS: 560
};

export default GAMEPLAY_CONFIG;
