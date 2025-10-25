/**
 * Police Backlash System
 * Too much police presence causes community backlash
 */

import { PlacedInvestment } from '../types';
import { Email } from '../types/email.types';
import { SocialPost } from '../types/social.types';
import GAMEPLAY_CONFIG from '../config/gameplay';

/**
 * Calculate police presence score (0-120+)
 * Based on number and frequency of police patrols
 */
export function calculatePolicePresence(placedInvestments: PlacedInvestment[]): number {
  const policePatrols = placedInvestments.filter(inv => inv.type.includes('patrols'));
  
  if (policePatrols.length === 0) return 0;
  
  let totalScore = 0;
  
  policePatrols.forEach(patrol => {
    // Score based on frequency
    let patrolScore = GAMEPLAY_CONFIG.POLICE_PRESENCE.PATROL_LOW_POINTS;
    
    if (patrol.patrolFrequency === 'high') {
      patrolScore = GAMEPLAY_CONFIG.POLICE_PRESENCE.PATROL_HIGH_POINTS;
    } else if (patrol.patrolFrequency === 'medium') {
      patrolScore = GAMEPLAY_CONFIG.POLICE_PRESENCE.PATROL_MEDIUM_POINTS;
    }
    
    totalScore += patrolScore;
  });
  
  return totalScore; // No cap - can exceed thresholds
}

/**
 * Get backlash level based on police presence
 */
export function getBacklashLevel(score: number): 'none' | 'warning' | 'minor' | 'major' | 'severe' {
  const { WARNING_THRESHOLD, MINOR_THRESHOLD, MAJOR_THRESHOLD, SEVERE_THRESHOLD } = GAMEPLAY_CONFIG.POLICE_PRESENCE;
  
  if (score >= SEVERE_THRESHOLD) return 'severe';
  if (score >= MAJOR_THRESHOLD) return 'major';
  if (score >= MINOR_THRESHOLD) return 'minor';
  if (score >= WARNING_THRESHOLD) return 'warning';
  return 'none';
}

/**
 * Generate backlash email from the mayor
 */
export function generateBacklashEmail(level: 'minor' | 'major' | 'severe', turn: number): Email {
  const emails = {
    minor: {
      subject: 'Community Concerns About Police Presence',
      content: `I've been hearing concerns from community leaders about the recent increase in police patrols across the city. While I understand your approach to reducing bike theft, we need to be mindful of community relations.

Several neighborhood groups have reached out expressing discomfort with the heavy police presence. This is San Francisco - we need to balance safety with community trust.

Please take a month to reassess your strategy. I'm putting a temporary hold on new police patrol deployments while we let things cool down.

We're all on the same team here, but we need to do this the right way.

Best,
Daniel Lurie
Mayor of San Francisco`
    },
    major: {
      subject: 'URGENT: Major Community Backlash',
      content: `This is serious. I've had multiple city council members in my office today, along with representatives from the ACLU and several community organizations. The level of police presence you've deployed is causing significant community backlash.

People are comparing this to broken windows policing and feeling targeted. We're seeing protests being organized. This is NOT the direction we want to go.

I'm suspending your authority to deploy ANY new resources for the next two months while we deal with this PR disaster. You need to understand - this city values civil liberties and community-based solutions.

We hired you to solve bike theft, not to turn San Francisco into a police state.

Get it together.

Daniel Lurie
Mayor of San Francisco`
    },
    severe: {
      subject: 'Your Position is in Jeopardy',
      content: `I'm going to be direct: your job is on the line.

The city is in an uproar. We have major protests planned for this weekend. The City Council is demanding I fire you. Community organizations are calling this a civil rights violation.

You've deployed so many police patrols that residents feel like they're living in an occupied zone. This is the OPPOSITE of what we asked you to do.

I'm suspending all of your operational authority for three months. No new deployments, no new hires, nothing. You're going to sit tight while we clean up this mess and try to rebuild community trust.

One more mistake like this and you're out. Do you understand?

This is your final warning.

Daniel Lurie
Mayor of San Francisco`
    }
  };
  
  const email = emails[level];
  
  return {
    id: `backlash-${level}-${turn}`,
    from: 'Mayor Daniel Lurie',
    fromTitle: 'Mayor of San Francisco',
    subject: email.subject,
    body: email.content,
    timestamp: new Date(),
    read: false,
    priority: 'high'
  };
}

/**
 * Generate backlash social media posts
 */
export function generateBacklashPosts(level: 'minor' | 'major' | 'severe', turn: number): SocialPost[] {
  const posts: SocialPost[] = [];
  
  // Number of posts based on severity
  const numPosts = level === 'minor' ? GAMEPLAY_CONFIG.POLICE_PRESENCE.MINOR_POSTS : 
                   level === 'major' ? GAMEPLAY_CONFIG.POLICE_PRESENCE.MAJOR_POSTS : 
                   GAMEPLAY_CONFIG.POLICE_PRESENCE.SEVERE_POSTS;
  
  const angryContent = [
    "SF is turning into a police state because of bike theft?? Are you serious??",
    "I don't feel safer with cops on every corner. I feel watched. This isn't what we voted for.",
    "The new bike theft coordinator is treating us like criminals. This is SF, not a prison.",
    "How about instead of flooding our streets with police, you try COMMUNITY PROGRAMS?",
    "Tired of being harassed by police patrols everywhere I go. This is getting ridiculous.",
    "This city is supposed to be progressive. Why are we going full authoritarian over BIKES?",
    "Walking home feels like I'm in a dystopia with all these patrol cars. Make it stop.",
    "The cure is worse than the disease. Yes bike theft sucks but THIS IS NOT THE ANSWER.",
    "Anyone else feel like they're being followed everywhere? Police patrols are out of control.",
    "Dear SF: please fire whoever thought turning us into a surveillance state was a good idea.",
    "I voted for better bike infrastructure, not for cops on every street corner wtf",
    "The bike theft coordinator clearly doesn't understand San Francisco values AT ALL",
    "This is what happens when you hire someone who thinks police solve everything 🙄",
    "ACLU needs to get involved. This level of police presence is unconstitutional.",
    "Protest this weekend. We're not going to let SF become a police state over bicycles.",
    "Imagine living in the most progressive city in America and having MORE police than NYC",
    "The irony of making cyclists feel unsafe by deploying police to 'protect' them",
    "How much is this costing taxpayers?? We could have just bought everyone new bikes.",
    "This is racial profiling waiting to happen. We all know who gets 'patrolled' more.",
    "Community trust is DEAD because of this heavy-handed approach. Congrats.",
    "SF used to be about innovation and community. Now it's just cops everywhere. Disgusting.",
    "Your bike theft solution is worse than the actual bike theft. Let that sink in.",
    "I feel less safe now than before. Police presence ≠ safety. When will people learn?",
    "The mayor needs to fire this person before SF loses what made it special.",
    "Broken windows policing doesn't work. Read a book. Do better.",
  ];
  
  const moderateContent = [
    "The police patrol thing feels excessive. There has to be a better way?",
    "I support reducing bike theft but this seems like overkill...",
    "Can we try community-based solutions instead of just police everywhere?",
    "This doesn't feel like San Francisco anymore. Anyone else uncomfortable?",
    "I appreciate the effort but maybe dial it back a bit? This is a lot.",
    "Police patrols might reduce theft but at what cost to our community?",
    "Is there data showing this actually works? Seems like it's just making people nervous.",
    "I miss when SF focused on community solutions instead of enforcement.",
    "Not a fan of the direction we're heading with all this police presence.",
    "There's a middle ground between no enforcement and THIS. Let's find it.",
  ];
  
  const concernedContent = [
    "I support stopping bike theft but we need to think about the bigger picture here.",
    "Community leaders are raising valid concerns. Hope someone is listening.",
    "This feels very un-SF. We usually try restorative justice approaches first?",
    "The unintended consequences of over-policing are going to be worse than bike theft.",
    "Can we have a town hall about this? Community input matters.",
    "I work in public policy and this approach has red flags all over it.",
    "History shows us that heavy police presence doesn't reduce crime, it displaces it.",
    "The data on over-policing is clear: it doesn't work and it hurts communities.",
    "We need to balance safety with civil liberties. This is going too far one direction.",
    "Speaking as someone who had their bike stolen: this is NOT what I want as a solution.",
  ];
  
  const allContent = [
    ...angryContent,
    ...angryContent, // Double weight for angry
    ...moderateContent,
    ...concernedContent
  ];
  
  for (let i = 0; i < numPosts; i++) {
    const content = allContent[Math.floor(Math.random() * allContent.length)];
    const displayName = generateRandomName();
    posts.push({
      id: `backlash-post-${level}-${turn}-${i}`,
      username: `user${Math.floor(Math.random() * 10000)}`,
      displayName,
      avatar: displayName.charAt(0).toUpperCase(),
      content,
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      sentiment: 'brutal'
    });
  }
  
  return posts;
}

function generateRandomName(): string {
  const first = ['Alex', 'Sam', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Avery', 'Quinn', 'Sage', 'River', 'Dakota', 'Parker', 'Blake', 'Cameron'];
  const last = ['Chen', 'Patel', 'Kim', 'Rodriguez', 'Lee', 'Johnson', 'Williams', 'Brown', 'Davis', 'Martinez', 'Garcia', 'Miller', 'Wilson', 'Anderson', 'Thomas'];
  return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
}
