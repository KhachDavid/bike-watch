import { Street, Detective, RootState } from '../types';
import { Email } from '../types/email.types';
import GAMEPLAY_CONFIG from '../config/gameplay';

export interface PerformanceMetrics {
  year: number;
  totalThefts: number;
  bikesRecovered: number;
  moneyRecovered: number;
  theftReductionPercent: number; // vs. last year
  policeBacklashEvents: number;
  vandalismEvents: number;
  detectivesHired: number;
  detectivesQuit: number;
  budgetSpent: number;
  camerasDeployed: number;
  overallRating: 'excellent' | 'good' | 'acceptable' | 'poor' | 'failing';
}

export interface PerformanceExpectations {
  maxTheftIncrease: number; // e.g., "No more than 10% increase in thefts"
  minRecoveryRate: number; // e.g., "At least 20% recovery rate"
  maxPoliceBacklash: number; // e.g., "No more than 2 backlash events"
  targetTheftReduction: number; // e.g., "Reduce thefts by 15%"
}

/**
 * Calculate performance metrics for the past year
 */
export function calculateYearlyPerformance(
  currentYear: number,
  previousYearData: any,
  currentData: any,
  eventsThisYear: any
): PerformanceMetrics {
  const totalThefts = currentData.totalTheftsThisYear || 0;
  const previousThefts = previousYearData?.totalThefts || totalThefts * 1.2; // Default assumption if no previous data
  
  const theftChange = previousThefts > 0 ? ((totalThefts - previousThefts) / previousThefts) * 100 : 0;
  
  let overallRating: PerformanceMetrics['overallRating'];
  
  // Rating algorithm
  const score = 
    (theftChange < -20 ? 25 : theftChange < -10 ? 15 : theftChange < 0 ? 10 : theftChange < 10 ? 5 : 0) + // Theft reduction
    (currentData.recoveryRate > 30 ? 20 : currentData.recoveryRate > 20 ? 15 : currentData.recoveryRate > 10 ? 10 : 5) + // Recovery rate
    (eventsThisYear.policeBacklash === 0 ? 15 : eventsThisYear.policeBacklash === 1 ? 10 : 5) + // Low backlash
    (currentData.detectivesQuit === 0 ? 10 : currentData.detectivesQuit < 2 ? 5 : 0) + // Detective retention
    (currentData.budgetEfficiency > 0.8 ? 10 : currentData.budgetEfficiency > 0.6 ? 5 : 0); // Budget use
  
  if (score >= 70) overallRating = 'excellent';
  else if (score >= 55) overallRating = 'good';
  else if (score >= 40) overallRating = 'acceptable';
  else if (score >= 25) overallRating = 'poor';
  else overallRating = 'failing';
  
  return {
    year: currentYear,
    totalThefts,
    bikesRecovered: currentData.totalRecovered || 0,
    moneyRecovered: currentData.totalMoneyRecovered || 0,
    theftReductionPercent: -theftChange, // Negative change = reduction (good)
    policeBacklashEvents: eventsThisYear.policeBacklash || 0,
    vandalismEvents: eventsThisYear.vandalism || 0,
    detectivesHired: currentData.detectivesHired || 0,
    detectivesQuit: currentData.detectivesQuit || 0,
    budgetSpent: currentData.budgetSpent || 0,
    camerasDeployed: currentData.camerasDeployed || 0,
    overallRating
  };
}

/**
 * Generate expectations for the upcoming year based on current situation
 */
export function generateExpectations(streets: Street[], currentMetrics: PerformanceMetrics): PerformanceExpectations {
  // Calculate current theft rate
  const totalMonthlyThefts = streets.reduce((sum, s) => sum + s.theftsPerMonth, 0);
  
  // Set dynamic targets based on current situation
  let targetReduction = 15; // Default 15% reduction goal
  let maxIncrease = 5; // Max acceptable increase
  
  // If thefts are really bad, increase expectations
  if (totalMonthlyThefts > 10000) {
    targetReduction = 20;
    maxIncrease = 0;
  } else if (totalMonthlyThefts > 5000) {
    targetReduction = 15;
    maxIncrease = 5;
  } else {
    // If doing well, maintain
    targetReduction = 10;
    maxIncrease = 10;
  }
  
  return {
    maxTheftIncrease: maxIncrease,
    minRecoveryRate: 15, // At least 15% of thefts should result in recovery
    maxPoliceBacklash: 2, // No more than 2 backlash events
    targetTheftReduction: targetReduction
  };
}

/**
 * Generate the annual performance review email from the Mayor
 */
export function generatePerformanceReviewEmail(
  metrics: PerformanceMetrics,
  expectations: PerformanceExpectations,
  turn: number,
  isFired: boolean
): Email {
  const year = 2025 + Math.floor((turn - 1) / 12);
  const recoveryRate = metrics.totalThefts > 0 ? (metrics.bikesRecovered / metrics.totalThefts * 100).toFixed(1) : '0.0';
  const avgMonthlyThefts = (metrics.totalThefts / 12).toFixed(0);
  
  let greeting = `Coordinator,\n\nIt's time for our annual performance review for ${year}. I've spent the past week reviewing your data with the city analytics team, and I have thoughts.\n\n`;
  greeting += `Let's talk numbers.\n\n`;
  
  // Performance breakdown - MORE DETAILED
  let breakdown = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  breakdown += `📊 ${year} PERFORMANCE SUMMARY\n`;
  breakdown += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  // Theft metrics with context
  breakdown += `🚴 THEFT METRICS:\n`;
  breakdown += `• Total thefts: ${metrics.totalThefts.toLocaleString()} incidents\n`;
  breakdown += `• Monthly average: ${avgMonthlyThefts} thefts/month\n`;
  breakdown += `• Year-over-year change: ${metrics.theftReductionPercent >= 0 ? '↘️ -' : '↗️ +'}${Math.abs(metrics.theftReductionPercent).toFixed(1)}%`;
  
  if (metrics.theftReductionPercent > 0) {
    breakdown += ` (GOOD - thefts decreased)\n`;
  } else if (metrics.theftReductionPercent === 0) {
    breakdown += ` (NEUTRAL - no change)\n`;
  } else {
    breakdown += ` (BAD - thefts increased)\n`;
  }
  breakdown += `\n`;
  
  // Recovery metrics
  breakdown += `🔍 INVESTIGATION & RECOVERY:\n`;
  breakdown += `• Bikes recovered: ${metrics.bikesRecovered.toLocaleString()} (${recoveryRate}% of thefts)\n`;
  breakdown += `• Money recovered: $${metrics.moneyRecovered.toLocaleString()}\n`;
  breakdown += `• Detective team: ${metrics.detectivesHired} hired, ${metrics.detectivesQuit} quit`;
  
  if (metrics.detectivesQuit > 2) {
    breakdown += ` (HIGH TURNOVER - concerning)\n`;
  } else if (metrics.detectivesQuit === 0) {
    breakdown += ` (EXCELLENT RETENTION)\n`;
  } else {
    breakdown += `\n`;
  }
  breakdown += `\n`;
  
  // Political/community metrics
  breakdown += `🏛️ COMMUNITY & POLITICAL IMPACT:\n`;
  breakdown += `• Police backlash incidents: ${metrics.policeBacklashEvents}`;
  
  if (metrics.policeBacklashEvents === 0) {
    breakdown += ` (CLEAN - no controversies)\n`;
  } else if (metrics.policeBacklashEvents <= 2) {
    breakdown += ` (ACCEPTABLE - within limits)\n`;
  } else {
    breakdown += ` (PROBLEMATIC - Council is concerned)\n`;
  }
  
  breakdown += `• Vandalism incidents: ${metrics.vandalismEvents}`;
  if (metrics.vandalismEvents > 3) {
    breakdown += ` (Your infrastructure is getting targeted)\n`;
  } else {
    breakdown += `\n`;
  }
  breakdown += `• Budget spent: $${metrics.budgetSpent.toLocaleString()}\n`;
  breakdown += `• Infrastructure deployed: ${metrics.camerasDeployed} camera systems\n`;
  breakdown += `\n`;
  
  // Assessment based on rating - MUCH MORE DETAILED
  let assessment = '';
  let nextYearExpectations = '';
  let specificFeedback = '';
  
  // Generate specific feedback based on individual metrics
  const feedbackPoints: string[] = [];
  
  if (metrics.theftReductionPercent > 20) {
    feedbackPoints.push(`✓ Outstanding theft reduction. Whatever you're doing, keep doing it.`);
  } else if (metrics.theftReductionPercent > 10) {
    feedbackPoints.push(`✓ Solid theft reduction. You're moving the needle in the right direction.`);
  } else if (metrics.theftReductionPercent > 0) {
    feedbackPoints.push(`⚠️ Marginal theft reduction. I need to see bigger improvements.`);
  } else if (metrics.theftReductionPercent > -10) {
    feedbackPoints.push(`⚠️ Thefts increased slightly. This isn't the trajectory we need.`);
  } else {
    feedbackPoints.push(`❌ Thefts increased significantly. This is moving in the WRONG direction.`);
  }
  
  const recoveryRateNum = parseFloat(recoveryRate);
  if (recoveryRateNum > 30) {
    feedbackPoints.push(`✓ Exceptional recovery rate. Your detective team is performing well.`);
  } else if (recoveryRateNum > 20) {
    feedbackPoints.push(`✓ Good recovery rate. Decent investigative work.`);
  } else if (recoveryRateNum > 10) {
    feedbackPoints.push(`⚠️ Recovery rate is below target. Are your detectives effective?`);
  } else {
    feedbackPoints.push(`❌ Poor recovery rate. Your detectives are barely solving any cases.`);
  }
  
  if (metrics.policeBacklashEvents === 0) {
    feedbackPoints.push(`✓ No police controversies. You maintained community trust.`);
  } else if (metrics.policeBacklashEvents <= 2) {
    feedbackPoints.push(`⚠️ ${metrics.policeBacklashEvents} backlash incident(s). Stay vigilant about community relations.`);
  } else {
    feedbackPoints.push(`❌ ${metrics.policeBacklashEvents} backlash incidents. You're creating political problems.`);
  }
  
  if (metrics.detectivesQuit === 0 && metrics.detectivesHired > 0) {
    feedbackPoints.push(`✓ Perfect detective retention. Your team management is solid.`);
  } else if (metrics.detectivesQuit > 3) {
    feedbackPoints.push(`❌ High detective turnover. This suggests management problems.`);
  } else if (metrics.detectivesQuit > 0) {
    feedbackPoints.push(`⚠️ Lost ${metrics.detectivesQuit} detective(s). Monitor team morale.`);
  }
  
  if (metrics.bikesRecovered > metrics.totalThefts * 0.25) {
    feedbackPoints.push(`✓ Strong recovery numbers - ${metrics.bikesRecovered.toLocaleString()} bikes back to owners.`);
  }
  
  if (metrics.moneyRecovered > 100000) {
    feedbackPoints.push(`✓ Recovered $${metrics.moneyRecovered.toLocaleString()} - impressive financial impact.`);
  }
  
  specificFeedback = `\n📋 SPECIFIC OBSERVATIONS:\n${feedbackPoints.map(p => `${p}`).join('\n')}\n\n`;
  
  if (isFired) {
    let terminationReason = '';
    let boardQuote = '';
    
    if (metrics.policeBacklashEvents >= 4) {
      terminationReason = `The repeated police backlash incidents (${metrics.policeBacklashEvents} this year alone) have created an untenable political situation. Community groups are protesting, the ACLU is asking questions, and Council members are fielding angry calls from constituents daily.`;
      boardQuote = `"This program has done more harm than good to community relations," one supervisor said. I couldn't disagree.`;
    } else if (metrics.theftReductionPercent < -100) {
      terminationReason = `Bike thefts more than doubled under your watch—from baseline to ${metrics.totalThefts.toLocaleString()} incidents in ${year}. The San Francisco Chronicle ran a front-page story titled "Bike Theft Crisis Deepens Despite New Program." This is a disaster.`;
      boardQuote = `"We're paying someone to make the problem worse," a supervisor told me. I had no response.`;
    } else if (metrics.theftReductionPercent < -50) {
      terminationReason = `Bike thefts increased by ${Math.abs(metrics.theftReductionPercent).toFixed(1)}% this year. Residents are furious, the city is furious, and I'm running out of explanations for why this program still exists.`;
      boardQuote = `"Time to cut our losses," multiple supervisors told me. I can't argue anymore.`;
    } else {
      terminationReason = `The combination of poor performance metrics, repeated warnings, and lack of measurable progress has exhausted the Council's patience—and mine. ${metrics.policeBacklashEvents > 2 ? 'The community backlash incidents were the final straw. ' : ''}${recoveryRateNum < 10 ? 'A recovery rate under 10% is inexcusable. ' : ''}${metrics.detectivesQuit > 3 ? 'Losing ' + metrics.detectivesQuit + ' detectives suggests serious management issues. ' : ''}`;
      boardQuote = `"We gave this experiment a fair shot," the City Council said. "It failed."`;
    }
    
    assessment = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    assessment += `❌ TERMINATION NOTICE\n`;
    assessment += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    assessment += `I met with the City Council yesterday to present your annual review. After reviewing your performance data and discussing the program's impact, the Council voted unanimously to terminate your position.\n\n`;
    assessment += `I won't sugarcoat this: ${terminationReason}\n\n`;
    assessment += `${boardQuote}\n\n`;
    
    assessment += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    assessment += `FINAL PERFORMANCE SUMMARY:\n`;
    assessment += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    assessment += `• Total thefts (${year}): ${metrics.totalThefts.toLocaleString()}\n`;
    assessment += `• Year-over-year change: ${metrics.theftReductionPercent >= 0 ? '-' : '+'}${Math.abs(metrics.theftReductionPercent).toFixed(1)}%\n`;
    assessment += `• Recovery rate: ${recoveryRate}%\n`;
    assessment += `• Police backlash incidents: ${metrics.policeBacklashEvents}\n`;
    assessment += `• Budget spent: $${metrics.budgetSpent.toLocaleString()}\n`;
    assessment += `• Overall rating: FAILING\n\n`;
    
    assessment += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    assessment += `Effective immediately, you are relieved of your duties as Bicycle Theft Prevention Coordinator.\n\n`;
    
    assessment += `Please:\n`;
    assessment += `• Clear out your workspace by end of business today\n`;
    assessment += `• Transfer all active cases to your replacement\n`;
    assessment += `• Return all city equipment and credentials\n`;
    assessment += `• Contact HR regarding final compensation\n\n`;
    
    if (metrics.policeBacklashEvents >= 3) {
      assessment += `The Council has asked me to remind you that our community trust takes years to build and moments to destroy. Your approach to policing created lasting damage that will take time to repair.\n\n`;
    } else if (metrics.theftReductionPercent < -50) {
      assessment += `The Council wants you to know that when we created this position, we genuinely believed it could make a difference. The data suggests otherwise.\n\n`;
    }
    
    assessment += `I truly hoped this would work out differently. When we hired you, I believed you could solve this problem. The metrics tell a different story.\n\n`;
    
    if (metrics.bikesRecovered > 50) {
      assessment += `For what it's worth, the ${metrics.bikesRecovered} bikes you did recover meant something to those residents. That's not nothing.\n\n`;
    }
    
    assessment += `Best of luck in your future endeavors.\n\n`;
    assessment += `Daniel Lurie\n`;
    assessment += `Mayor, City and County of San Francisco\n\n`;
    assessment += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    assessment += `This position is being eliminated effective ${new Date().toLocaleDateString()}.\n`;
    assessment += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    
    return {
      id: `performance-review-fired-${turn}`,
      from: 'Mayor Daniel Lurie',
      fromTitle: 'Mayor of San Francisco',
      subject: `❌ TERMINATION NOTICE - Annual Review ${year}`,
      body: greeting + breakdown + specificFeedback + assessment,
      timestamp: new Date(),
      read: false,
      priority: 'urgent'
    };
  }
  
  switch (metrics.overallRating) {
    case 'excellent':
      assessment = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      assessment += `✅ OVERALL RATING: EXCELLENT\n`;
      assessment += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      assessment += `I'll be honest—I didn't expect results this good. You've exceeded expectations across the board.\n\n`;
      assessment += `The City Council reviewed your data last week, and they were impressed. We've seen measurable improvement in theft rates, strong recovery numbers, and you've managed to avoid the political landmines that could have sunk this program.\n\n`;
      assessment += `This is exactly what I hoped for when we created this position. You've proven that data-driven, community-focused approaches work. I'm approving a budget increase for your program, and I'll be citing your work as a model for other city initiatives.\n\n`;
      assessment += `Keep this up, and we might actually solve this problem.\n\n`;
      nextYearExpectations = `For ${year + 1}, maintain this momentum. The bar is high now—don't let me down. If you keep delivering results like this, this position could become permanent.`;
      break;
      
    case 'good':
      assessment = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      assessment += `✓ OVERALL RATING: GOOD\n`;
      assessment += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      assessment += `Solid work. You're making real progress, and the data backs it up.\n\n`;
      assessment += `I presented your metrics to the Council last week. They're cautiously optimistic. We're seeing improvement in key areas, and you've generally managed resources well. There are still some rough edges—${metrics.theftReductionPercent < 10 ? 'theft reduction could be stronger, ' : ''}${recoveryRateNum < 20 ? 'recovery rates need work, ' : ''}${metrics.policeBacklashEvents > 0 ? 'and we had some backlash incidents ' : ''}—but overall, you're moving in the right direction.\n\n`;
      assessment += `The Council is satisfied enough to continue funding. That's a win. But don't get complacent—"good" isn't "excellent," and the city needs excellence.\n\n`;
      nextYearExpectations = `For ${year + 1}, I want to see continued improvement across all metrics. Focus particularly on areas where you're still below target. Show me you can go from good to great.`;
      break;
      
    case 'acceptable':
      assessment = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      assessment += `⚠️ OVERALL RATING: ACCEPTABLE\n`;
      assessment += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      assessment += `Let me be frank: this is not impressive.\n\n`;
      assessment += `You're meeting the bare minimum requirements, but that's about it. I had to defend this program to the Council last week, and the questions were tough. ${metrics.theftReductionPercent < 5 ? '"Why aren\'t thefts going down faster?" ' : ''}${recoveryRateNum < 15 ? '"Why is the recovery rate so low?" ' : ''}${metrics.policeBacklashEvents > 1 ? '"Why are we seeing community backlash?" ' : ''}\n\n`;
      assessment += `I don't have great answers for them because the data isn't giving me great answers.\n\n`;
      assessment += `The Council approved continued funding—barely. Several councilors wanted to kill the program entirely. You're on thin ice. The city invested in this position expecting results, and "acceptable" performance on a problem this big isn't actually acceptable.\n\n`;
      nextYearExpectations = `${year + 1} needs to be significantly better. I need data I can proudly show the Council, not data I have to defend. Show me you understand the urgency here. This is your chance to prove this position deserves to exist.`;
      break;
      
    case 'poor':
      assessment = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      assessment += `⚠️ OVERALL RATING: POOR\n`;
      assessment += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      assessment += `I'm going to be direct: this isn't working.\n\n`;
      assessment += `I presented your annual report to the Council yesterday. It did not go well. ${metrics.theftReductionPercent < -10 ? 'Thefts are UP year-over-year. How do I explain that to taxpayers? ' : ''}${metrics.policeBacklashEvents > 1 ? 'We had ' + metrics.policeBacklashEvents + ' police backlash incidents—the community is losing trust. ' : ''}${metrics.detectivesQuit > 2 ? 'You lost ' + metrics.detectivesQuit + ' detectives—that screams management problems. ' : ''}\n\n`;
      assessment += `Multiple supervisors are calling for your replacement. I convinced them to give you one more year, but I'm not sure I did you a favor. The scrutiny on this program is intense now.\n\n`;
      assessment += `You need to understand something: the Council doesn't care about effort, they care about results. And the results aren't there. ${metrics.budgetSpent > 200000 ? 'We spent $' + metrics.budgetSpent.toLocaleString() + ' of taxpayer money with minimal returns. ' : ''}That's not sustainable.\n\n`;
      nextYearExpectations = `This is an official warning. ${year + 1} must show dramatic improvement or I will have to make changes. The Council won't give you another year of poor performance, and frankly, neither will I. Prove you can do this job.`;
      break;
      
    case 'failing':
      assessment = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      assessment += `❌ OVERALL RATING: FAILING\n`;
      assessment += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      assessment += `There's no easy way to say this: you're failing.\n\n`;
      assessment += `I presented your annual metrics to the City Council. They were furious. ${metrics.theftReductionPercent < -20 ? 'Bike thefts increased by ' + Math.abs(metrics.theftReductionPercent).toFixed(1) + '%. That\'s catastrophic. ' : ''}${metrics.policeBacklashEvents >= 3 ? 'Three or more police backlash incidents created a PR nightmare. ' : ''}${recoveryRateNum < 10 ? 'Your recovery rate is abysmal—barely ' + recoveryRate + '%. ' : ''}\n\n`;
      assessment += `The Council voted to put this program under immediate review. Several councilors want to terminate it entirely. I spent two hours defending your position, and I'm not sure I made the right call.\n\n`;
      assessment += `Let me be crystal clear: the city created this position to solve a problem. Instead, ${metrics.theftReductionPercent < -20 ? 'the problem got worse. ' : 'we\'ve seen minimal progress. '}Taxpayers are asking why we're funding this. Residents are asking why their bikes are still getting stolen. And I don't have good answers.\n\n`;
      assessment += `This can't continue.\n\n`;
      nextYearExpectations = `Consider this your final warning. ${year + 1} must show major, visible improvement across ALL metrics, or this position will be terminated. No excuses, no explanations—just results. The Council has lost patience, and so have I.`;
      break;
  }
  
  // Add expectations for next year - MORE DETAILED
  let expectationDetails = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  expectationDetails += `📋 YOUR TARGETS FOR ${year + 1}\n`;
  expectationDetails += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  expectationDetails += `These aren't suggestions. These are requirements:\n\n`;
  
  expectationDetails += `1. THEFT REDUCTION\n`;
  expectationDetails += `   Target: Reduce bike thefts by ${expectations.targetTheftReduction}% year-over-year\n`;
  if (expectations.targetTheftReduction > 15) {
    expectationDetails += `   Note: This is aggressive, but the situation demands it.\n\n`;
  } else {
    expectationDetails += `   Note: This should be achievable with proper strategy.\n\n`;
  }
  
  expectationDetails += `2. CASE RESOLUTION\n`;
  expectationDetails += `   Target: Maintain ${expectations.minRecoveryRate}%+ recovery rate\n`;
  expectationDetails += `   Focus: Ensure your detective team has the tools and support they need.\n\n`;
  
  expectationDetails += `3. COMMUNITY RELATIONS\n`;
  expectationDetails += `   Target: Max ${expectations.maxPoliceBacklash} police backlash incident(s)\n`;
  expectationDetails += `   Critical: Balance enforcement with community trust. Over-policing will end you.\n\n`;
  
  expectationDetails += `4. OPERATIONAL EXCELLENCE\n`;
  expectationDetails += `   • Maintain detective team morale and retention\n`;
  expectationDetails += `   • Demonstrate efficient use of budget (ROI on investments)\n`;
  expectationDetails += `   • Protect deployed infrastructure from vandalism\n`;
  expectationDetails += `   • Make data-driven decisions, not reactive ones\n\n`;
  
  expectationDetails += `5. STRATEGIC DEPLOYMENT\n`;
  expectationDetails += `   • Target high-risk areas with appropriate interventions\n`;
  expectationDetails += `   • Use mix of technology, community programs, and enforcement\n`;
  expectationDetails += `   • Monitor effectiveness and adjust strategy accordingly\n\n`;
  
  if (metrics.overallRating === 'failing' || metrics.overallRating === 'poor') {
    expectationDetails += `⚠️ CONSEQUENCES OF NON-PERFORMANCE:\n`;
    expectationDetails += `Failure to meet these targets will result in immediate review and likely termination.\n`;
    expectationDetails += `The Council has made it clear: show results or we'll find someone who can.\n\n`;
  }
  
  let closing = '';
  if (metrics.overallRating === 'excellent') {
    closing = `You've earned my confidence. Don't lose it.\n\n`;
    closing += `Regards,\nDaniel Lurie\nMayor, City and County of San Francisco\n\n`;
    closing += `P.S. - I mentioned your program in a Chronicle interview. Don't make me regret that.`;
  } else if (metrics.overallRating === 'good') {
    closing = `Keep pushing. We're making progress, but we're not done yet.\n\n`;
    closing += `Regards,\nDaniel Lurie\nMayor, City and County of San Francisco`;
  } else if (metrics.overallRating === 'acceptable') {
    closing = `The clock is ticking. Show me you can deliver.\n\n`;
    closing += `Regards,\nDaniel Lurie\nMayor, City and County of San Francisco\n\n`;
    closing += `P.S. - Next year's review will be much more critical. Be ready.`;
  } else if (metrics.overallRating === 'poor') {
    closing = `I stuck my neck out for you. Don't make me regret it.\n\n`;
    closing += `Daniel Lurie\nMayor, City and County of San Francisco\n\n`;
    closing += `P.S. - The Council is watching. So am I.`;
  } else {
    closing = `This is it. No more chances.\n\n`;
    closing += `Daniel Lurie\nMayor, City and County of San Francisco\n\n`;
    closing += `P.S. - I hope you're taking this seriously, because I am.`;
  }
  
  return {
    id: `performance-review-${year}-${turn}`,
    from: 'Mayor Daniel Lurie',
    fromTitle: 'Mayor of San Francisco',
    subject: metrics.overallRating === 'failing' || metrics.overallRating === 'poor' 
      ? `⚠️ URGENT: Annual Performance Review - ${year}` 
      : `📋 Annual Performance Review - ${year}`,
    body: greeting + breakdown + specificFeedback + assessment + expectationDetails + nextYearExpectations + '\n\n' + closing,
    timestamp: new Date(),
    read: false,
    priority: metrics.overallRating === 'failing' || metrics.overallRating === 'poor' ? 'high' : 'normal'
  };
}

/**
 * Check if player should be fired based on performance
 */
export function shouldBeFired(metrics: PerformanceMetrics, previousWarnings: number): boolean {
  // Immediate firing conditions
  if (metrics.policeBacklashEvents >= 4) return true; // Too much police controversy
  if (metrics.theftReductionPercent < -100) return true; // Thefts more than doubled
  
  // Firing after warnings
  if (previousWarnings >= 2 && metrics.overallRating === 'failing') return true;
  if (previousWarnings >= 3 && metrics.overallRating === 'poor') return true;
  
  return false;
}
