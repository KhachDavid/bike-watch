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
    grumpy: [`-`, `Regards,`, `Sent from my desk`],
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
        `Just wanted to touch base. Had a breakthrough on that Valencia Street case yesterday—witness finally came forward with footage from their doorbell camera. These things take patience, but proper procedure pays off.`,
        `Good progress this month. That SOMA bike ring we've been tracking? I think we're close to identifying the fence. Cross-referencing pawn shop records with theft patterns is tedious work, but it's paying dividends.`,
        `Wrapped up the Mission District case today. Turned out the thief was selling parts on Craigslist under different accounts. Methodical database work cracked it. The small victories add up.`,
        `Quick update: recovered a stolen bike from a garage sale in the Sunset. Owner was selling it without knowing it was hot. Proper chain of evidence led us right to them. Documentation matters.`,
        `That case near Dolores Park finally broke. Security footage from a nearby bar showed the suspect's face clearly. Sometimes you just need to knock on enough doors. Persistence over luck, every time.`,
        `Closed out three cases this week. Nothing glamorous—mostly checking OfferUp listings and matching serial numbers. But it works. Consistency beats brilliance.`,
        `Interview with a witness went well. They were hesitant at first, but establishing rapport is part of the job. Got a solid lead on where the bikes are being stored. Following proper protocol.`,
        `Found a pattern in the timing of thefts near Civic Center. Always between 2-4pm. Adjusted my surveillance schedule accordingly. Paid off—caught someone in the act yesterday. Method matters.`,
        `Spent the morning testifying in court about a case from last month. Thorough documentation means solid prosecution. The DA appreciated having everything organized. This is why I keep detailed notes.`,
        `Recovered four bikes from a storage unit in the Bayview. The warrant took two weeks to process but we did it by the book. Takes longer but it sticks.`,
        `Building a good relationship with local bike shops. They're calling me when suspicious sales come through. Community partnerships are as important as investigation skills.`,
        `Finally tracked down that vintage road bike from the Marina. Been working that case for three weeks. Owner was overjoyed. This is what the job is about.`,
      ],
      struggling: [
        `I'll be frank—many of these cases are going cold. Without camera coverage in the Tenderloin, I'm relying on witness interviews, and people aren't talking. It's frustrating when you know the bikes are out there but can't build a solid case.`,
        `These older cases are proving difficult. The trail goes cold quickly without surveillance footage. I'm doing everything by the book, but sometimes the book isn't enough. May need to reassess our evidence collection strategy.`,
        `Challenging month. Several cases where the bike was stolen in broad daylight, but no cameras nearby. I've been canvassing businesses for private footage, but it's slow going. The work is there, the results aren't yet.`,
        `Spent three days on a lead that went nowhere. The bike was already stripped and sold for parts. By the time we got there, nothing left to recover. Need faster response times.`,
        `Witness recanted their statement today. Said they "didn't want to get involved." Can't force cooperation. It's unfortunate but I have to respect their decision and move on.`,
        `Following up on older cases but the trail is ice cold. Most evidence has been overwritten or disposed of. There's only so much you can do after 30 days.`,
        `Had what I thought was a solid lead in the Richmond. Turned out to be a false positive—similar bike, different serial number. Back to square one on that one.`,
        `Cases from areas without camera infrastructure are proving nearly impossible. We're essentially operating blind. Can document that for the record but it doesn't help me now.`,
        `Interviewed five people this week. None of them saw anything useful. Sometimes witnesses just don't have information, no matter how many questions I ask.`,
        `Working a case where the owner didn't register their serial number. Makes recovery extremely difficult even if we find the bike. Prevention education needs to improve.`,
        `Several cases this month where the bikes were locked improperly. I can investigate the theft but can't change behavior. Frustrating when better practices would have prevented it.`,
        `Checked with all the usual pawn shops and second-hand dealers. Nobody's seen our bikes. They're either going out of the area or being sold through private channels we can't monitor.`,
      ],
      overwhelmed: [
        `I need to be direct—I'm drowning in open cases and can't give each one the attention it deserves. Just today I had to choose between following up on a promising lead and filing three overdue reports. This isn't sustainable for quality work.`,
        `The caseload has reached a point where I'm cutting corners I shouldn't be cutting. I pride myself on thoroughness, but right now I'm just triaging. We need to discuss priorities or bring in additional resources.`,
        `I'm working 12-hour days and still falling behind. Every case deserves a proper investigation, but I simply don't have the bandwidth. Something has to give—either the volume or the quality, and neither option sits well with me.`,
      ]
    },
    eager: {
      good: [
        `OMG you won't believe what happened! Remember that stolen fixie from Haight-Ashbury? Found it being sold at a flea market in Oakland! The owner cried when I called her. THIS is why I love this job!`,
        `So I've been experimenting with checking Instagram hashtags for stolen bikes and it's WORKING! Found three bikes this month just by scrolling through #SFBikeLife and #BayAreaCycling. Social media detective work is my new favorite thing!`,
        `Had the BEST day yesterday—tracked down a bike that was stolen six months ago. The thief painted it but forgot to file off the serial number. Rookie mistake! The owner literally didn't believe it when I showed up at their door. So rewarding!`,
        `Okay this is SO cool—I've been joining local cycling Facebook groups and just LURKING. Caught someone trying to sell a stolen bike in the "Bay Area Bike Swap" group. They didn't even change the seat! Crime doesn't pay lol`,
        `You know that feeling when everything just CLICKS? Had that today. Connected three cases that seemed unrelated and boom—same suspect for all three. I literally fist pumped in my car haha`,
        `Started carrying business cards to all the coffee shops cyclists hang out at. Already got two tips this week! Building relationships is so fun when you actually like talking to people :)`,
        `UPDATE: That bike I found last week? Owner brought me homemade cookies today!! Like actual fresh cookies. I'm definitely in the right career`,
        `Been learning about different bike models in my free time. Sounds nerdy but it's actually super interesting? And it's helping me identify stolen bikes way faster. Knowledge is power!`,
        `Recovered a kid's bike today. Like a little BMX with training wheels. The dad was so relieved. These aren't always about the $$ value you know? Sometimes it's about a kid who just wants their bike back`,
        `I've been watching tutorials on how thieves break locks and honestly it's fascinating (in a concerning way). But now I can spot their methods and it's helped with investigations!`,
        `Good week! Found a bike that was listed on THREE different selling sites under different names. Did a reverse image search and GOTTEM. Technology is amazing you guys`,
        `Made friends with a bike messenger today who knows like EVERYONE in the cycling community. Now I have eyes all over the city! Networking ftw!`,
      ],
      struggling: [
        `This has been a rough week, not gonna lie. Been chasing down leads that all hit dead ends. Spent two days tracking a bike I thought I spotted, turned out to be a different model. But hey, learning what DOESN'T work is still learning, right?`,
        `Okay so... some of these cases are really hard? Like, I thought detective work would be more Sherlock Holmes and less "stare at grainy footage for hours." Still passionate though! Just need to figure out my system.`,
        `I've been staying late every night but the cases aren't breaking. There's this one Castro theft that's driving me CRAZY—I know the bike is nearby, I can feel it. Maybe I'm trying too hard? Is that a thing?`,
        `ngl this week was rough... thought I found a bike at a yard sale but it was just a really similar model. Spent like 4 hours there for nothing? But at least I tried`,
        `Getting a little discouraged tbh. Been working this one case for two weeks and every lead is a dead end. But quitters never win right?? Gonna keep pushing`,
        `Had a moment today where I questioned if I'm cut out for this. Then I remembered why I started. Tomorrow's a new day and I'm not giving up!`,
        `These Tenderloin cases are SO HARD without cameras. Like I'm literally just hoping someone saw something. Feels more like luck than skill sometimes`,
        `Tried a new approach this week—didn't work. But that's okay! Thomas Edison failed 1000 times before inventing the light bulb. (he did right? should google that)`,
        `Some days I feel like I'm just spinning my wheels (pun intended lol). But at least I care? That counts for something`,
        `Coffee count this week: 14 cups. Sleep count: not enough. Case progress: minimal. But my attitude? Still positive! (mostly)`,
        `You ever work super hard on something and just... nothing? That's this week. But I'm gonna review my notes tonight and try again tomorrow`,
        `Met with a victim today whose bike was their only transportation to work. They were almost crying. Really hit me how much this matters. Wish I had better news for them`,
      ],
      overwhelmed: [
        `I don't want to complain but... I'm honestly exhausted. Every time I make progress on one case, three more land on my desk. I started this job so excited and now I'm just stressed all the time. Is this normal?? Am I doing something wrong?`,
        `Had a bit of a breakdown yesterday (don't worry, I'm okay!). Just realized I haven't closed a case in days because I keep getting pulled in different directions. I WANT to help everyone but I physically can't be in ten places at once...`,
        `Real talk: I might have bitten off more than I can chew. Everyone's counting on me and I feel like I'm letting people down. The stolen bikes have OWNERS waiting and I can't sleep thinking about it. Need help or guidance or... something.`,
      ]
    },
    grumpy: {
      good: [
        `Closed that Western Addition case. Bike shop owner recognized a stolen frame someone tried to sell for parts. Finally, someone who actually pays attention. More of that, less paperwork, and we might get somewhere.`,
        `Got lucky on a Potrero Hill theft—thief was dumb enough to ride the stolen bike past the same camera a week later. Can't fix stupid, but I can arrest it. Small victories.`,
        `Cracked a case because the thief used their real name on the OfferUp listing. Twenty years doing this and people still surprise me with their idiocy. Not complaining when it makes my job easier.`,
        `Caught a guy trying to sell a stolen bike literally outside a police station. Can't make this stuff up. Arrested on the spot. Finally, an easy one`,
        `Turns out if you actually put cameras where bikes get stolen, you catch thieves. Revolutionary concept, I know`,
        `Thief rode past the same camera twice. Not exactly Moriarty we're dealing with here`,
        `Pawn shop called me about a suspicious bike. Actually following protocol for once. Small miracles`,
        `Case closed because the guy posted the stolen bike on his public Instagram. With his full name. Natural selection at work`,
        `Recovered three bikes from behind a dumpster in the Mission. Not exactly CSI work but I'll take the win`,
        `Sometimes the simplest explanation is the right one. Bike was in the suspect's garage. Shocking`,
        `Witness did the right thing and came forward with good info. Rare enough that I'm mentioning it`,
        `Found a whole chop shop operation because someone called in a noise complaint. Sometimes luck beats skill`,
      ],
      struggling: [
        `Half these cases are from areas with zero camera coverage. What do you want me to do, read tea leaves? I'm a detective, not a psychic. We need infrastructure or we're just spinning wheels.`,
        `Been working the Tenderloin cases all week. No footage, no witnesses, bikes vanish into thin air. Used to be we could at least count on pawn shops keeping records. Now it's all Craigslist and Facebook Marketplace under fake names. System's broken.`,
        `Another month of cold cases piling up. The bikes were probably stripped for parts within 24 hours. By the time I get the case file, the trail's ice cold. But sure, I'll keep filing reports nobody reads.`,
        `Spent all day on paperwork instead of actual investigation. This is why good detectives leave. Too much bureaucracy, not enough police work`,
        `Witness said they'd cooperate then ghosted me. Typical. People want their bikes back but won't help with the investigation. Can't win`,
        `Three cases this week where the bike wasn't even locked. What am I supposed to do with that? I investigate crimes, not stupidity`,
        `Got assigned a case from six weeks ago. Trail's deader than dead. But sure, I'll waste my time going through the motions`,
        `Department won't approve overtime but expects miracles. Pick one—quality or quantity. Can't have both on a 40-hour week`,
        `Evidence locker lost the security footage from a key case. Now it's my fault somehow. This place is falling apart`,
        `Another lead that went nowhere. Shocking. Maybe if we had actual resources instead of empty promises`,
        `Followed up on 8 different sightings of a stolen bike. All false alarms. Public means well but they can't tell a Specialized from a Schwinn`,
      ],
      overwhelmed: [
        `I've got cases I haven't even looked at yet. Every morning brings a new stack. You know what happens to old cases? They die. We're running a bike theft morgue here, not an investigation unit.`,
        `Been doing this job for years. Never seen it this bad. Can't give any case proper attention. It's all assembly line work now—log it, check the obvious places, close it unsolved, next. This isn't detective work.`,
        `I quit jobs for less than this. Seriously considering it. Can't remember the last time I actually INVESTIGATED something instead of just processing paperwork. Either fix the workload or I'm out.`,
      ]
    },
    eccentric: {
      good: [
        `Fascinating discovery: bike thefts spike exactly 73 hours after each full moon in the Mission. Followed the pattern, staked out the usual spots at 3 AM, and caught someone red-handed. The data doesn't lie—the cosmos is quite literal sometimes.`,
        `Had an epiphany while studying weather patterns. Thieves prefer overcast days—less shadows, harder to spot on cameras. Cross-referenced this with theft times and BOOM—found our Castro bike ring. The universe speaks in data, my friend.`,
        `You know that feeling when you just KNOW something? Spent three nights watching that abandoned warehouse on 16th Street. Everyone said I was wasting time. Found a storage operation with 40+ stolen bikes. Trust the intuition.`,
      ],
      struggling: [
        `The signals are... muddy. I've been mapping theft locations against barometric pressure, but the correlations are weak. Perhaps Mercury in retrograde is affecting my analytical clarity? Or maybe we just need better cameras.`,
        `Been contemplating the psychological profile of our thieves. They operate in chaos—no pattern, no rhythm. It's like trying to predict brownian motion. My methods work best with ORDER. This randomness is... unsettling.`,
        `Interesting phenomenon: the more I stare at the data, the less sense it makes. Quantum observer effect? Started working on a geographic profiling algorithm based on ancient feng shui principles. Don't judge me until you see the results.`,
      ],
      overwhelmed: [
        `Too many frequencies. Can't isolate the signal anymore. Usually I can feel the pattern in my bones, but now it's just... static. I need silence. Contemplation. Instead I have deadline reports and budget meetings. The system is killing my gift.`,
        `My mind works like a spider's web—each case is a vibration I can trace. But there are too many vibrations now. The web is shaking apart. I can't maintain the connections. This isn't how the universe intended me to work.`,
        `I meditated for four hours last night trying to clear the noise, and all I saw were spreadsheets. SPREADSHEETS. My third eye is now a Gantt chart. This is what bureaucracy does to art. I need fewer cases or I'm useless.`,
      ]
    },
    methodical: {
      good: [
        `I've implemented a new case tracking system with color-coded priority flags and 17-point investigation checklists. Already seeing improvements—closed that Marina District case by systematically eliminating 47 possible suspects until only one remained. The spreadsheet doesn't lie.`,
        `Been cross-referencing bike serial numbers against online marketplace listings using a automated script I wrote. It runs every 4 hours and flags potential matches. Caught three thieves this month who thought they were clever. Organization beats chaos every time.`,
        `Developed a new protocol for evidence documentation—timestamp everything, categorize by theft method, link to geographic data. It's paying off. Just connected four seemingly unrelated thefts to the same operator. Patterns emerge when you document properly.`,
      ],
      struggling: [
        `I've analyzed our case closure rates and identified the bottleneck: evidence collection timeline. By the time cases reach my desk, critical footage has been deleted by auto-purge systems. We need to reduce our evidence acquisition window to 72 hours maximum.`,
        `The lack of standardized reporting is hampering investigation efficiency. I'm spending 40% of my time just parsing inconsistent witness statements and poorly documented crime scenes. Can't solve cases if the data foundation is compromised.`,
        `Ran a regression analysis on our success factors. The single strongest predictor is camera quality within 50 meters of the theft. Without proper surveillance infrastructure, my solve rate drops 73%. This is a data problem, not an investigator problem.`,
      ],
      overwhelmed: [
        `I've calculated that optimal case processing requires 4.7 hours per investigation. Current workload allows 1.2 hours per case. This is mathematically unsustainable. I'm cutting corners I specifically designed processes to avoid. The system is failing.`,
        `My investigation workflow is designed for thoroughness, not speed. Under current conditions, I can either maintain quality and let cases pile up, or rush and risk errors. Neither option is acceptable. We need to discuss resource allocation immediately.`,
        `I've created a detailed breakdown of time allocation versus case complexity. The numbers are clear: current workload exceeds capacity by 215%. I'm not being dramatic—I'm being precise. Something has to change or the entire system will collapse.`,
      ]
    },
    ambitious: {
      good: [
        `Just beat my personal record—three cases closed in one day! Found a pattern in online listings and identified a reseller moving stolen bikes through multiple accounts. This is the kind of work that gets noticed. Thinking about submitting it for a commendation.`,
        `You know that bike theft ring everyone said was untouchable? Yeah, about that. Spent my weekend tracking their movement patterns and hit the jackpot. Sometimes you have to put in extra hours to get extraordinary results. That's what separates good detectives from great ones.`,
        `Been comparing my solve rate to the department average—I'm running 40% higher. Not to brag, but I am definitely positioning myself well for that lead investigator role. Excellence speaks for itself.`,
      ],
      struggling: [
        `Had a setback this week. Was so sure I had the SOMA bike ring figured out, but my main lead went cold. It happens, but I don't like losing. Already planning a new approach—failure isn't an option, just a detour.`,
        `Going to be real with you—I'm frustrated. I'm putting in the work, doing everything right, but the results aren't matching my effort. Some of these cases are just impossible without better resources. I can only be as good as the tools I have.`,
        `This isn't acceptable. I came here to make an impact and my stats aren't reflecting my potential. Need better case assignments or better equipment—preferably both. Can't build a reputation on cold cases with no evidence.`,
      ],
      overwhelmed: [
        `Look, I'm ambitious but I'm also realistic. Right now I'm spread so thin that I'm mediocre at everything instead of excellent at anything. This isn't the trajectory I signed up for. My career goals require focused, high-quality work—not this chaos.`,
        `I didn't become a detective to be average, but that's what this workload is forcing me to be. I need cases where I can actually demonstrate my abilities, not just process paperwork. This is burning me out AND holding me back.`,
        `Between you and me, I've been contacted by other agencies. I love this work, but I'm not going to tank my career over poor resource management. Either we fix this so I can actually excel, or I'm going to start taking those calls seriously.`,
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
