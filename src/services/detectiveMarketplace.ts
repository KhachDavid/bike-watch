import { Detective } from '../types';
import { generatePersonality } from './detectivePersonality';

const firstNames = [
  'Sarah', 'Michael', 'Jessica', 'David', 'Emily', 'James', 'Rachel', 'Robert',
  'Amanda', 'Christopher', 'Lisa', 'Daniel', 'Jennifer', 'Matthew', 'Ashley',
  'Andrew', 'Michelle', 'Joshua', 'Stephanie', 'Kevin', 'Laura', 'Brian',
  'Melissa', 'John', 'Angela', 'Ryan', 'Kimberly', 'Jason', 'Rebecca', 'Justin',
  'Maria', 'William', 'Nicole', 'Brandon', 'Elizabeth', 'Nicholas', 'Amy',
  'Anthony', 'Katherine', 'Tyler', 'Samantha', 'Eric', 'Heather', 'Jacob',
  'Christine', 'Scott', 'Sandra', 'Alexander', 'Donna', 'Jonathan'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White',
  'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams',
  'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const employers = [
  'Oakland PD', 'San Jose PD', 'Sacramento PD', 'Fresno PD', 'Long Beach PD',
  'Private Investigation Firm', 'County Sheriff Office', 'State Police',
  'Federal Agency', 'Security Company', 'Insurance Investigation',
  'Corporate Security', 'Freelance Investigator'
];

/**
 * Generate a random attribute (0-20 scale like Football Manager)
 * Distribution: More common in middle range, rare extremes
 */
function generateAttribute(): number {
  // Use multiple random rolls for normal distribution
  const roll1 = Math.random() * 10;
  const roll2 = Math.random() * 10;
  return Math.round((roll1 + roll2) / 2 + 5); // Center around 10, range 5-15 mostly
}

/**
 * Generate attributes with some correlation
 * (e.g., experienced detectives tend to have higher skills)
 */
function generateAttributes(experience: number) {
  // Experience bonus: 0-3 points based on years
  const expBonus = Math.min(3, Math.floor(experience / 5));
  
  return {
    investigation: Math.min(20, generateAttribute() + expBonus),
    forensics: generateAttribute(),
    interviewing: generateAttribute(),
    surveillance: generateAttribute(),
    intuition: generateAttribute(),
    stamina: generateAttribute() // How many cases they can work per turn
  };
}

/**
 * Calculate desired salary based on attributes and experience
 */
function calculateDesiredSalary(detective: Partial<Detective>): number {
  const baseSalary = 2000;
  const expMultiplier = 1 + (detective.experience! / 20);
  
  // Average of all skills
  const avgSkill = (
    detective.investigation! +
    detective.forensics! +
    detective.interviewing! +
    detective.surveillance! +
    detective.intuition!
  ) / 6;
  
  const skillMultiplier = avgSkill / 10; // 10 is average
  
  const salary = Math.round(baseSalary * expMultiplier * skillMultiplier);
  
  // Unemployed detectives are more flexible (10-20% less)
  const unemploymentDiscount = detective.employed ? 1.0 : (0.8 + Math.random() * 0.1);
  
  return Math.round(salary * unemploymentDiscount);
}

/**
 * Generate a single detective
 */
function generateDetective(id: string, forceUnemployed: boolean = false): Detective {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `${firstName} ${lastName}`;
  
  const age = 25 + Math.floor(Math.random() * 30); // 25-55
  const experience = Math.max(0, age - 25 - Math.floor(Math.random() * 5));
  
  const attributes = generateAttributes(experience);
  
  // 60% employed, 40% unemployed (unless forced)
  const employed = forceUnemployed ? false : Math.random() > 0.4;
  const currentEmployer = employed ? employers[Math.floor(Math.random() * employers.length)] : undefined;
  
  // Loyalty: Higher for currently employed
  const loyalty = employed ? 40 + Math.floor(Math.random() * 40) : 20 + Math.floor(Math.random() * 30);
  
  const detective: Partial<Detective> = {
    id,
    name,
    age,
    experience,
    ...attributes,
    employed,
    currentEmployer,
    loyalty,
    activeCases: [],
    solvedCases: 0,
    successRate: 0.5 + (Math.random() * 0.3) // 50-80% base
  };
  
  // Generate personality
  const personalityData = generatePersonality(detective);
  detective.personality = personalityData.personality;
  detective.traits = personalityData.traits;
  detective.morale = personalityData.morale;
  
  const desiredSalary = calculateDesiredSalary(detective);
  detective.desiredSalary = desiredSalary;
  detective.minimumSalary = Math.round(desiredSalary * (employed ? 0.85 : 0.70)); // Employed are less flexible
  
  return detective as Detective;
}

/**
 * Generate initial detective marketplace
 * Creates a pool of 30-50 detectives with varied backgrounds
 */
export function generateDetectiveMarketplace(): Detective[] {
  const count = 30 + Math.floor(Math.random() * 21); // 30-50 detectives
  const detectives: Detective[] = [];
  
  // Ensure at least 10 unemployed (easier to hire)
  for (let i = 0; i < 10; i++) {
    detectives.push(generateDetective(`det-${i}`, true));
  }
  
  // Rest can be employed or unemployed
  for (let i = 10; i < count; i++) {
    detectives.push(generateDetective(`det-${i}`, false));
  }
  
  // Sort by overall quality (for easier browsing)
  detectives.sort((a, b) => {
    const avgA = (a.investigation + a.forensics + a.interviewing + a.surveillance + a.intuition) / 6;
    const avgB = (b.investigation + b.forensics + b.interviewing + b.surveillance + b.intuition) / 6;
    return avgB - avgA;
  });
  
  return detectives;
}

/**
 * Calculate a detective's overall solve rate based on attributes
 */
export function calculateSolveRate(detective: Detective, hasFootage: boolean): number {
  // Base rate from investigation skill
  let baseRate = detective.investigation / 20;
  
  // Boost from other relevant skills
  const forensicsBoost = detective.forensics / 100;
  const interviewingBoost = detective.interviewing / 100;
  
  let solveRate = baseRate + forensicsBoost + interviewingBoost;
  
  // Surveillance skill matters more if there's camera footage
  if (hasFootage) {
    solveRate += (detective.surveillance / 50);
  } else {
    // Intuition matters more without footage
    solveRate += (detective.intuition / 50);
  }
  
  // Experience bonus
  solveRate += (detective.experience / 200);
  
  // Success rate historical performance
  solveRate *= detective.successRate;
  
  return Math.min(0.95, solveRate);
}

/**
 * Determine if a detective will accept a salary offer
 */
export function willAcceptOffer(
  detective: Detective,
  offeredSalary: number,
  playerReputation: number = 50 // 0-100, affects negotiations
): { accepted: boolean; reason?: string } {
  // Must meet minimum salary
  if (offeredSalary < detective.minimumSalary) {
    return { accepted: false, reason: `Offer below minimum (${detective.minimumSalary})` };
  }
  
  // If unemployed and meets minimum, very likely to accept
  if (!detective.employed) {
    const acceptChance = 0.7 + (offeredSalary / detective.desiredSalary) * 0.3;
    if (Math.random() < acceptChance) {
      return { accepted: true };
    }
    return { accepted: false, reason: 'Looking for better opportunities' };
  }
  
  // If employed, need to overcome loyalty
  const offerQuality = offeredSalary / detective.desiredSalary;
  const loyaltyFactor = detective.loyalty / 100;
  const reputationBonus = (playerReputation - 50) / 100; // -0.5 to +0.5
  
  // Need to offer significantly more to poach employed detective
  const requiredOfferQuality = 1.2 - reputationBonus; // 170% of desired, less if good reputation
  
  if (offerQuality >= requiredOfferQuality) {
    // Still check loyalty
    const acceptChance = 1 - (loyaltyFactor * 0.7);
    if (Math.random() < acceptChance) {
      return { accepted: true };
    }
    return { accepted: false, reason: `Loyal to ${detective.currentEmployer}` };
  }
  
  return { accepted: false, reason: 'Offer not competitive enough' };
}

/**
 * Check if detective can solve cases without camera footage
 * Rookies struggle without footage, but experienced detectives can use traditional methods
 */
export function canSolveWithoutFootage(detective: Detective): boolean {
  return detective.investigation >= 11 || 
         detective.intuition >= 13 || 
         detective.experience >= 8;
}

/**
 * Get detective description/scouting report
 */
export function getDetectiveReport(detective: Detective): string {
  const traits: string[] = [];
  
  // CRITICAL: Show footage requirement first
  if (!canSolveWithoutFootage(detective)) {
    traits.push('⚠️ NEEDS CAMERAS (Invest: ' + detective.investigation + ', Intuit: ' + detective.intuition + ', Exp: ' + detective.experience + 'y)');
  } else {
    traits.push('✓ Can solve without cameras');
  }
  
  if (detective.investigation >= 15) traits.push('Exceptional investigator');
  if (detective.forensics >= 15) traits.push('Forensics expert');
  if (detective.surveillance >= 15) traits.push('Surveillance specialist');
  if (detective.interviewing >= 15) traits.push('Master interviewer');
  if (detective.intuition >= 16) traits.push('Brilliant intuition');
  if (detective.stamina >= 16) traits.push('Tireless worker (8 cases/turn)');
  
  if (detective.investigation <= 8 && detective.intuition <= 10) traits.push('Inexperienced');
  if (detective.stamina <= 7) traits.push('Limited capacity');
  
  if (detective.experience >= 15) traits.push('Veteran detective');
  else if (detective.experience <= 4) traits.push('Rookie');
  
  if (detective.successRate >= 0.75) traits.push('Proven track record');
  
  return traits.join(' • ');
}
