import { Detective } from '../types';
import { Email } from '../types/email.types';

/**
 * Detective Personality & Communication Service
 * Makes detectives feel like real agents with unique voices
 */

const PERSONALITY_TRAITS = {
  professional: [
    'Detail-Oriented',
    'By-The-Book',
    'Diplomatic',
    'Punctual',
    'Team Player'
  ],
  eager: [
    'Ambitious',
    'Quick Learner',
    'Energetic',
    'Optimistic',
    'Proactive'
  ],
  grumpy: [
    'Cynical',
    'Direct',
    'No-Nonsense',
    'Coffee Dependent',
    'Veteran Attitude'
  ],
  eccentric: [
    'Unconventional',
    'Creative Thinker',
    'Night Owl',
    'Intuitive',
    'Free Spirit'
  ],
  methodical: [
    'Analytical',
    'Patient',
    'Thorough',
    'Data-Driven',
    'Strategic'
  ],
  ambitious: [
    'Results-Oriented',
    'Competitive',
    'Fast-Paced',
    'Career-Focused',
    'High Achiever'
  ]
};

/**
 * Generate personality for a detective based on their attributes
 */
export function generatePersonality(detective: Partial<Detective>): {
  personality: Detective['personality'];
  traits: string[];
  morale: number;
} {
  const personalities: Detective['personality'][] = [
    'professional', 'eager', 'grumpy', 'eccentric', 'methodical', 'ambitious'
  ];
  
  // Influence personality by attributes
  let personality: Detective['personality'];
  
  if (detective.experience! > 15) {
    // Veterans tend to be professional or grumpy
    personality = Math.random() > 0.5 ? 'professional' : 'grumpy';
  } else if (detective.experience! < 5) {
    // Rookies tend to be eager or ambitious
    personality = Math.random() > 0.5 ? 'eager' : 'ambitious';
  } else if (detective.intuition! > 15) {
    // High intuition = eccentric
    personality = 'eccentric';
  } else if (detective.investigation! > 15) {
    // High investigation = methodical
    personality = 'methodical';
  } else {
    // Random for others
    personality = personalities[Math.floor(Math.random() * personalities.length)];
  }
  
  // Pick 2-3 traits
  const availableTraits = PERSONALITY_TRAITS[personality];
  const numTraits = 2 + Math.floor(Math.random() * 2); // 2-3 traits
  const traits: string[] = [];
  
  const shuffled = [...availableTraits].sort(() => Math.random() - 0.5);
  for (let i = 0; i < numTraits && i < shuffled.length; i++) {
    traits.push(shuffled[i]);
  }
  
  // Initial morale is random but influenced by employment status
  const morale = detective.employed ? 60 + Math.random() * 20 : 40 + Math.random() * 30;
  
  return { personality, traits, morale: Math.round(morale) };
}

/**
 * Generate introduction email when detective is hired
 */
export function generateHireEmail(detective: Detective, turn: number): Email {
  const intros = {
    professional: [
      `Thank you for the opportunity to join your team. I'm looking forward to contributing my ${detective.experience} years of experience to reduce bike theft in San Francisco.`,
      `I appreciate your confidence in bringing me aboard. Rest assured, I'll apply my investigative skills diligently to every case assigned to me.`,
      `It's a pleasure to join the Bicycle Theft Prevention Unit. I'm ready to start working cases immediately.`
    ],
    eager: [
      `I'm SO excited to be part of this team! I've been wanting to work on a project like this for ages. Let's catch some thieves!`,
      `Thank you thank you thank you for hiring me! I promise I won't let you down. Already diving into the case files!`,
      `This is amazing! I can't wait to start solving cases. Point me at the evidence and let's do this!`
    ],
    grumpy: [
      `Alright, I'm in. Send me the case files. No need for lengthy introductions—I'd rather get to work.`,
      `Fine, I'll take the job. But I work my way, understood? Results speak louder than procedure.`,
      `Let's skip the pleasantries. I've been doing this for ${detective.experience} years. Just give me the cases.`
    ],
    eccentric: [
      `Fascinating opportunity! I can already sense the patterns in this city's bike theft ecosystem. The moon phase data could be very revealing...`,
      `Hello! I work best between 2-4 AM when my intuition peaks. Don't worry, I'll solve cases you didn't even know existed.`,
      `This is going to be interesting. I have some... unconventional methods. But they work. Trust the process.`
    ],
    methodical: [
      `I've reviewed the case backlog and developed a systematic approach to tackle it. Let's establish a clear workflow and get started.`,
      `Thank you for hiring me. I'll be methodically working through cases in order of evidence quality and time-sensitivity.`,
      `I've already begun organizing the case files by priority. Systematic investigation yields results.`
    ],
    ambitious: [
      `This is exactly the career opportunity I've been looking for. I plan to have the highest solve rate on the team.`,
      `Let's set some aggressive targets. I'm here to make an impact and show what I can do.`,
      `I'm ready to prove myself. Give me the toughest cases—I thrive under pressure.`
    ]
  };
  
  const greetings = [
    `Hi there!`,
    `Hello,`,
    `Hey,`,
    `Good morning,`,
    `Greetings,`
  ];
  
  const closings = {
    professional: [`Best regards,`, `Sincerely,`, `Respectfully,`],
    eager: [`Can't wait to get started!`, `Let's do this!`, `Excited to begin!`],
    grumpy: [`- `, `Regards,`, `Sent from my desk`],
    eccentric: [`Until next time,`, `In investigation we trust,`, `Following the patterns,`],
    methodical: [`Regards,`, `Best,`, `Systematically yours,`],
    ambitious: [`Ready to excel,`, `Committed to results,`, `Onward and upward,`]
  };
  
  const intro = intros[detective.personality][Math.floor(Math.random() * intros[detective.personality].length)];
  const greeting = detective.personality === 'grumpy' ? 'Coordinator,' : greetings[Math.floor(Math.random() * greetings.length)];
  const closing = closings[detective.personality][Math.floor(Math.random() * closings[detective.personality].length)];
  
  const skillNote = detective.intuition > 13 && detective.experience > 8 
    ? `\n\nFYI: I can work cases even without camera footage. My experience and intuition usually fill in the gaps.`
    : detective.surveillance > 15
    ? `\n\nNote: I'm particularly skilled at analyzing camera footage. HD and AI cameras will help me solve cases faster.`
    : '';
  
  return {
    id: `detective-hire-${detective.id}-${turn}`,
    from: detective.name,
    fromTitle: 'Detective',
    subject: `First Day - ${detective.name}`,
    body: `${greeting}\n\n${intro}${skillNote}\n\n${closing}\n${detective.name}`,
    timestamp: new Date(),
    read: false,
    priority: 'normal'
  };
}

/**
 * Generate progress update email from detective
 */
export function generateProgressEmail(detective: Detective, turn: number, casesSolved: number, casesWorking: number): Email | null {
  // Only send emails every 2-4 turns
  if (detective.lastEmailTurn && turn - detective.lastEmailTurn < (2 + Math.floor(Math.random() * 3))) {
    return null;
  }
  
  const updates = {
    professional: {
      good: [
        `I wanted to provide a brief update on my progress. I've successfully resolved ${casesSolved} cases this month, and I'm currently investigating ${casesWorking} active leads.`,
        `Status report: ${casesSolved} cases closed. I'm maintaining a steady workflow with ${casesWorking} ongoing investigations. All according to procedure.`,
      ],
      struggling: [
        `I need to be honest—the current caseload is challenging. Only ${casesSolved} solved this month with ${casesWorking} still pending. I may need additional resources or time.`,
        `Progress has been slower than I'd hoped. ${casesSolved} cases closed, but ${casesWorking} remain active. The evidence is thin on many of these.`,
      ],
      overwhelmed: [
        `I'm struggling to keep up. ${casesWorking} active cases is beyond my capacity. I've only managed ${casesSolved} closures. I need to reduce my workload to maintain quality.`,
        `This caseload is unsustainable. ${casesWorking} cases is too many to handle properly. I've closed ${casesSolved}, but quality is suffering.`,
      ]
    },
    eager: {
      good: [
        `Hey! Just wanted to share some wins! Solved ${casesSolved} cases this month! Working on ${casesWorking} more and feeling good about them!`,
        `Great news! ${casesSolved} cases cracked! I'm learning so much from each one. Currently juggling ${casesWorking} active investigations!`,
      ],
      struggling: [
        `Working really hard on these cases! Got ${casesSolved} solved, but ${casesWorking} are proving tricky. Still giving it my all though!`,
        `Bit of a tough month—only ${casesSolved} closures. But I'm not giving up on the ${casesWorking} I'm working on! Learning a lot from the challenging ones.`,
      ],
      overwhelmed: [
        `Okay, I'll be honest—${casesWorking} cases is A LOT. I've managed ${casesSolved} but I'm drowning here. Still trying my best but could really use some help or fewer cases.`,
        `I'm trying SO hard but ${casesWorking} cases is overwhelming me. Only got ${casesSolved} solved. I don't want to let you down but this is really tough!`,
      ]
    },
    grumpy: {
      good: [
        `${casesSolved} cases down. ${casesWorking} to go. That's the update.`,
        `Solved ${casesSolved}. Still got ${casesWorking} on my desk. Moving as fast as the evidence allows.`,
      ],
      struggling: [
        `Look, ${casesSolved} cases isn't great. These ${casesWorking} active cases are garbage—no footage, cold trails. I'm doing what I can with what I've got.`,
        `Only ${casesSolved} this month. Hard to solve cases when there's no evidence. Got ${casesWorking} going nowhere fast.`,
      ],
      overwhelmed: [
        `This is ridiculous. ${casesWorking} cases? Really? I've only cleared ${casesSolved} and that's because I'm barely sleeping. Either give me help or fewer cases.`,
        `Can't work miracles. ${casesWorking} active cases is insane. Managed ${casesSolved}. That's all you're getting until this workload is reasonable.`,
      ]
    },
    eccentric: {
      good: [
        `The patterns are revealing themselves! ${casesSolved} cases resolved by following the data streams. ${casesWorking} more brewing in my mind—I can feel the connections forming.`,
        `Fascinating month! ${casesSolved} solutions emerged from the chaos. Currently meditating on ${casesWorking} cases. The moon cycle suggests breakthroughs soon.`,
      ],
      struggling: [
        `The universe is testing me. Only ${casesSolved} breakthroughs this cycle. ${casesWorking} cases remain shrouded in fog. I need better data... or different coffee.`,
        `Interesting challenge. ${casesSolved} solved through intuitive leaps, but ${casesWorking} are... resistant to my methods. The patterns aren't speaking clearly.`,
      ],
      overwhelmed: [
        `My mind is fractured—too many data points! ${casesWorking} cases have created a cacophony. Only ${casesSolved} coherent solutions emerged. I need fewer cases or the patterns will be lost forever.`,
        `Cannot maintain clarity with ${casesWorking} concurrent investigations. Only ${casesSolved} successful visions. My intuition requires focused meditation, not this chaos.`,
      ]
    },
    methodical: {
      good: [
        `Monthly analysis: ${casesSolved} cases successfully completed using systematic investigation. ${casesWorking} cases in active rotation with organized timelines.`,
        `Progress report: ${casesSolved} closures achieved through structured methodology. Currently processing ${casesWorking} cases in order of priority.`,
      ],
      struggling: [
        `Analysis indicates suboptimal results: ${casesSolved} closures with ${casesWorking} pending. Root cause: insufficient evidence quality. Recommend increased surveillance infrastructure.`,
        `Current metrics: ${casesSolved} solved, ${casesWorking} active. The data suggests we need better initial evidence collection to improve closure rates.`,
      ],
      overwhelmed: [
        `Critical workload issue: ${casesWorking} concurrent cases exceeds optimal capacity. Quality assurance declining. ${casesSolved} completions below target. Recommend immediate case redistribution.`,
        `System overload: ${casesWorking} active cases compromises investigative thoroughness. ${casesSolved} closures achieved but methodology suffering. Need to reduce intake or add resources.`,
      ]
    },
    ambitious: {
      good: [
        `Strong performance this month—${casesSolved} cases closed! Working ${casesWorking} active leads. I'm aiming to beat this number next month.`,
        `Proud to report ${casesSolved} successful closures! Currently have ${casesWorking} in progress. Let's keep this momentum going!`,
      ],
      struggling: [
        `Honestly, ${casesSolved} cases isn't where I want to be. I have ${casesWorking} active, but the solve rate needs improvement. Working on strategy adjustments.`,
        `Bit frustrated—only ${casesSolved} solved with ${casesWorking} pending. I expect better from myself. Need to step up my game.`,
      ],
      overwhelmed: [
        `${casesWorking} cases is crushing my solve rate. Only managed ${casesSolved}. This workload is preventing me from excelling. I need a manageable number to hit my targets.`,
        `Can't perform at my best with ${casesWorking} cases. ${casesSolved} closures isn't impressive, I know. Either reduce my load or accept lower stats—your choice.`,
      ]
    }
  };
  
  // Determine status
  const casesPerTurn = detective.stamina / 10; // Rough capacity
  const status = casesWorking > casesPerTurn * 2.5 ? 'overwhelmed'
    : casesSolved < 2 ? 'struggling'
    : 'good';
  
  const messages = updates[detective.personality][status];
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  const closings = {
    professional: 'Regards',
    eager: 'Best',
    grumpy: '- ',
    eccentric: 'Observantly',
    methodical: 'Analytically',
    ambitious: 'Onward'
  };
  
  return {
    id: `detective-update-${detective.id}-${turn}`,
    from: detective.name,
    fromTitle: 'Detective',
    subject: status === 'overwhelmed' ? '⚠️ Workload Issue' : 
             status === 'struggling' ? 'Case Update' : 
             '✓ Progress Update',
    body: `${message}\n\n${closings[detective.personality]},\n${detective.name}`,
    timestamp: new Date(),
    read: false,
    priority: status === 'overwhelmed' ? 'high' : 'normal'
  };
}

/**
 * Generate email when detective quits (low morale)
 */
export function generateQuitEmail(detective: Detective, turn: number): Email {
  const reasons = {
    professional: [
      `After careful consideration, I've decided to pursue other opportunities. While I've appreciated working here, I feel it's time for a change. Thank you for the experience.`,
      `I'm submitting my resignation, effective immediately. It's been a professional experience, but I believe my skills would be better utilized elsewhere. Best of luck to the team.`
    ],
    eager: [
      `I'm really sorry, but I have to quit. I tried my best, but this role isn't what I hoped it would be. I wish I could've done more. Good luck with everything!`,
      `This is really hard to say, but I need to leave. I'm just not thriving here like I thought I would. Thanks for the opportunity, though!`
    ],
    grumpy: [
      `I quit. This isn't working out. Good luck finding someone else.`,
      `I'm done. This job isn't what I signed up for. Moving on.`
    ],
    eccentric: [
      `The cosmic alignment suggests it's time for me to follow a different path. My intuition is clear—this chapter must close. May the patterns guide you.`,
      `I'm sensing a disturbance in my investigative flow. The universe is calling me elsewhere. Farewell, and trust your instincts.`
    ],
    methodical: [
      `Analysis complete: optimal career trajectory requires departure. Submitting formal resignation. Transition period available if needed. Thank you for the structured experience.`,
      `Data indicates misalignment between role expectations and reality. Terminating employment contract. Will ensure proper case handoff.`
    ],
    ambitious: [
      `I've received a better offer elsewhere. This role isn't advancing my career quickly enough. Thanks for the experience, but I'm moving up.`,
      `Found an opportunity that better matches my ambitions. I need to think about my career growth. Best wishes.`
    ]
  };
  
  const msgs = reasons[detective.personality];
  const reason = msgs[Math.floor(Math.random() * msgs.length)];
  
  return {
    id: `detective-quit-${detective.id}-${turn}`,
    from: detective.name,
    fromTitle: 'Detective (Former)',
    subject: '💼 Resignation',
    body: reason,
    timestamp: new Date(),
    read: false,
    priority: 'high'
  };
}
