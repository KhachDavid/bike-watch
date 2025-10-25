import { SocialPost } from '../types/social.types';

const usernames = [
  'BikerBae415', 'SF_Cyclist_Mom', 'TenderLoinTerry', 'MissionHipster', 'CastroCommuter',
  'FinancialDistrictFred', 'PotreroPete', 'MarinaBikeDad', 'NobHillNancy', 'SoMaSally',
  'HaightStreetHank', 'EmbarcaderoEmily', 'RichmondRider', 'SunsetSam', 'BayviewBella',
  'ExcelsiorEd', 'VisitationValley', 'OuterRichmondOliver', 'InnerSunsetIvy', 'PacHeightsPaul',
  'RussianHillRita', 'NorthBeachNick', 'ChinatownChen', 'JapantownJen', 'WestPortalWill',
  'GlenParkGreg', 'BernalBella', 'DogpatchDana', 'BayshoreBarry', 'PresidioPatty',
  'AngryCyclist2025', 'BikeTheftVictim', 'ThirdTimesTheCharm', 'NoMoreBikes4Me', 'MyBikeGotJacked',
  'SFCityHallWatcher', 'TaxpayerTina', 'ConcernedCitizen99', 'WhereIsMyBike', 'BikeWatchSF',
  'SanFranSally', 'BayAreaBiker', 'UrbanCyclist', 'BikeToWorkBob', 'CommuterCathy',
  'DowntownDweller', 'SFNativeSince92', 'TransplantTom', 'TechWorkerTerry', 'StartupSteve',
  'SFisTrash', 'BikeTheftCapital', 'Fed_Up_Cyclist', 'StolenBikeClub', 'CityHallFails',
  'WasteOfTaxes', 'IncompetenceWatch', 'BikeTheftDaily', 'SF_Accountability', 'AngryVoter2025',
  'RecallEveryone', 'DefundCoordinator', 'ActuallyDoSomething', 'EmbarrassingSF', 'MovingToOakland',
  'BikelessInSF', 'TheftVictim247', 'NoBikesLeft', 'SFCrimeProblem', 'FailedCity',
  'ProgressiveJoke', 'LiberalParadiseLOL', 'TechExodusNow', 'CaliforniaFailure', 'LeftistUtopia',
  'SFDyingCity', 'CrimeWatch415', 'LawlessLand', 'BikeGraveyard', 'ThiefParadise'
];

const names = [
  'Karen Martinez', 'Chad Johnson', 'Brittany Chen', 'Kyle Anderson', 'Ashley Wu',
  'Brad Thompson', 'Jennifer Garcia', 'Derek Lee', 'Michelle Rodriguez', 'Jason Park',
  'Amanda White', 'Tyler Brown', 'Stephanie Nguyen', 'Ryan Davis', 'Nicole Lopez',
  'Brandon Kim', 'Samantha Jones', 'Justin Miller', 'Rebecca Singh', 'Kevin Taylor',
  'Karen O\'Brien', 'Kevin Chang', 'Jessica Lee', 'Michael Torres', 'Sarah Cohen',
  'David Patel', 'Emily Ramirez', 'Chris Anderson', 'Lisa Tran', 'Mark Williams',
  'Rachel Green', 'Dan Cooper', 'Megan Foster', 'Alex Rivera', 'Kate Murphy',
  'Tom Brady', 'Jenny Kim', 'Steve Rogers', 'Maria Santos', 'John Smith'
];

const angryTemplates = [
  "STILL waiting for action on bike thefts. My neighbor just lost their THIRD bike this month. @MayorLurie do something!",
  "Cool cool cool. Another bike stolen. That's what, $800 down the drain? Thanks for nothing.",
  "At this point I should just donate my bike directly to thieves. Would save me the trouble.",
  "Day {turn} of asking: when will someone actually DO something about bike theft??",
  "My bike lasted exactly 12 hours. TWELVE. HOURS. This is unacceptable.",
  "Bought a $1200 bike lock. Bike still stolen. Please explain how this makes sense.",
  "Just saw someone cutting a bike lock in broad daylight. Called 311. Still on hold. Classic.",
  "Remember when SF was bike-friendly? Pepperidge Farm remembers.",
  "Bike #4 stolen this year. At this rate I should just Uber everywhere. Oh wait, that defeats the purpose.",
  "The lock cost more than the bike. The lock is now also gone. I'm done.",
  "Whoever is in charge of bike theft prevention should be FIRED. Absolutely useless.",
  "Another day, another bike stolen in {neighborhood}. This city is a JOKE.",
  "My rent is $3500/month and I can't even keep a bike safe. What am I paying for exactly???",
  "SF: where your bike has a higher chance of being stolen than you finding parking. Pathetic.",
  "Bike Theft Prevention Coordinator? More like Bike Theft ENABLER. DO YOUR JOB.",
  "This is why everyone is leaving SF. Can't even have nice things anymore.",
  "Incompetent doesn't even BEGIN to describe this administration's bike theft response.",
  "HELLO?? Is anyone awake at city hall?? My bike was stolen AGAIN. AGAIN!!!",
  "Every single person I know has had a bike stolen. EVERY. SINGLE. PERSON. Fix this!",
  "We're supposed to be a progressive city but can't solve basic theft? Embarrassing.",
  "Just paid $2800 for a new e-bike. Lasted 3 days. THREE DAYS. I hate this city.",
  "Watching someone unbolt my bike seat right now. Should I say hi or just accept my fate?",
  "The bike thieves have better organization than city hall. Maybe THEY should be in charge.",
  "Fun fact: I've owned 7 bikes in 2 years. Current count: ZERO. Do the math.",
  "My kid's bike was stolen from our FRONT PORCH. We live on the second floor. How???",
  "UPDATE: Thief came back for the other wheel. They're more dedicated than the coordinator.",
  "Bike theft in {neighborhood} is basically a sport now. Wonder who's winning? (Not us)",
  "I've spent more on bike locks than bikes at this point. This is not sustainable.",
  "Came outside. No bike. Surprised? No. Angry? YES. Expecting change? Also no.",
  "The city hired a COORDINATOR. Not a solver. Not a fixer. A COORDINATOR. We're doomed.",
  "Just witnessed my 5th bike theft this month. Didn't even bother calling the cops anymore.",
  "SF bike theft speedrun any% (WR: 45 minutes from purchase to stolen)",
  "My bike lock was picked so cleanly I'm almost impressed. Almost. Still furious though.",
  "There's a whole MARKET for stolen bikes and nobody does anything. NOBODY.",
  "Pretty sure the bike thieves have a better success rate than our prevention coordinator.",
  "I bought a bike with a GPS tracker. Watched it travel to Oakland. Police: 'Nothing we can do.'",
  "The Tenderloin is where bikes go to die. Change my mind. (You can't)",
  "Coordinator's job description: 1) Collect paycheck 2) Watch bikes disappear 3) Repeat",
  "Bike stolen from INSIDE my apartment building. The lobby. WITH cameras. No one cares.",
  "SF doesn't have a bike theft problem. SF IS a bike theft problem.",
];

const sarcasticTemplates = [
  "Oh great, another month of 'monitoring the situation.' That'll definitely stop the thieves 🙄",
  "Love how we're a 'bike-friendly city' where bikes get stolen constantly. Very friendly.",
  "Shoutout to whoever stole my bike from {neighborhood}. Hope you enjoy the flat tire I had.",
  "Wow, {neighborhood} theft rate is through the roof. I'm shocked. SHOCKED. (not shocked)",
  "Nothing says 'world-class city' like not being able to keep a bike for more than a week.",
  "I see we're still 'reviewing options' while bikes disappear. Incredible strategy.",
  "My bike was stolen while I was grabbing coffee. The thief works faster than city hall.",
  "Friendly reminder that thieves are more efficient than our city government.",
  "At least the bike thieves are consistent. Unlike, you know, anyone trying to stop them.",
  "Pro tip: Don't bike in SF. Just... don't. You're welcome.",
  "Bicycle Theft Prevention Coordinator lmao. What do they do all day? Watch bikes get stolen?",
  "Oh wow a whole $100k budget. That'll surely solve everything. Pack it up boys, we're saved 🙄",
  "Imagine having ONE JOB (prevent bike theft) and still failing this hard.",
  "The only thing this coordinator prevents is... nothing. Absolutely nothing.",
  "Great use of taxpayer money hiring someone who apparently does nothing all day.",
  "Month {turn} update: still no bikes, still no action, still paying taxes for this circus.",
  "I'm sure the Bicycle Theft Prevention Coordinator is VERY busy doing... what exactly?",
  "Love that we have an entire position dedicated to watching bikes disappear. Truly inspiring work.",
  "The thieves are laughing all the way to the chop shop. And who can blame them honestly.",
  "Breaking: Local coordinator discovers bikes still getting stolen. Shocked everyone (no one).",
  "They gave the coordinator a dashboard! Problem solved! (bikes still getting stolen btw)",
  "Thank god we have someone to coordinate the prevention of... oh wait bikes are still gone.",
  "Really inspiring how the city created a whole job position that accomplishes literally nothing.",
  "The coordinator is doing an amazing job at... let me check my notes... oh right, NOTHING.",
  "Shoutout to the Bike Theft Prevention Coordinator for their hard work preventing absolutely zero thefts 👏",
  "I love how we solved bike theft by giving someone a title and a budget and calling it a day.",
  "The coordinator must be so proud. They prevented... *checks notes* ...negative bikes from being stolen.",
  "Maybe the coordinator's strategy is to wait until everyone's bikes are stolen? Big brain moves.",
  "Plot twist: the coordinator IS the bike thief. Would explain a lot actually.",
  "At least when my bike gets stolen now there's someone official to ignore my complaints. Progress!",
  "I'd ask what the coordinator does all day but I'm afraid the answer would make me even angrier.",
  "The position exists purely so the city can say they're 'addressing the issue' while doing nothing.",
  "Bike Theft Prevention Coordinator: Silicon Valley's next big job title for people who don't do anything.",
  "Imagine putting this on your resume: 'Prevented: 0 bike thefts. Coordinated: also 0.'",
  "The coordinator has one of those jobs that sounds important until you realize it's completely pointless.",
  "I've seen more effective strategies from my 6-year-old niece's lemonade stand.",
  "The only thing being coordinated is how fast bikes leave our possession. Stellar work.",
  "Maybe if we changed the coordinator's title to 'Bike Theft Encouragement Specialist' it'd be more accurate?",
  "Fun drinking game: take a shot every time the coordinator prevents a bike theft. (You'll stay sober)",
  "The coordinator's success rate is so low it's actually impressive in a terrible way.",
];

const concernedTemplates = [
  "Genuinely worried about the bike theft situation in {neighborhood}. When will we see improvements?",
  "I want to bike to work but honestly scared to leave my bike anywhere. Anyone else feel this way?",
  "Has anyone noticed the bike theft problem getting worse? Or is it just me?",
  "Serious question: is it even worth having a bike in SF anymore? Getting discouraged.",
  "Would love to see more bike parking security in {neighborhood}. The current setup isn't working.",
  "My kid wants to bike to school but I don't feel safe letting them. This needs to change.",
  "Bike theft is making people give up on cycling. That's bad for everyone.",
  "We need better solutions. Current approach clearly isn't working.",
  "Anyone else avoiding certain neighborhoods because of bike theft? This is getting bad.",
  "When will we see actual improvements? The data keeps getting worse.",
];

const frustratedTemplates = [
  "Tried to report my stolen bike. Website down. Phone line busy. Are you KIDDING me?",
  "Spent 3 hours filing a police report for a bike theft. Spoiler: they didn't find it.",
  "City budget is how much and we can't stop bike theft? Make it make sense.",
  "{neighborhood} is basically a free bike store for thieves at this point.",
  "Every single bike rack downtown is full of cut locks. EVERY. SINGLE. ONE.",
  "We pay taxes for what exactly? Bike thieves get a free shopping mall?",
  "Tell me why I bothered registering my bike when nothing happens when it's stolen?",
  "The Tenderloin is a disaster. Mission isn't far behind. Hello? Anyone home?",
  "My bike was stolen from a 'secure' bike parking area. Secure. Sure.",
  "Budget of $100k and somehow nothing is getting better. Fascinating.",
  "So we have a whole department for this and bikes STILL getting stolen daily? What a scam.",
  "I pay $4000/month in rent and can't park a bike without it vanishing. This city is broken.",
  "Coordinator must be busy sending emails while 500 bikes get stolen monthly. Priorities!",
  "The only thing getting coordinated is how fast bikes disappear. Congrats I guess.",
  "Tenderloin has been a dumpster fire for YEARS. When will anyone actually address it?",
  "Don't worry guys, I'm sure the coordinator will send us another dashboard update while our bikes vanish.",
  "This is what happens when you hire someone who's never had a bike stolen. Out of touch.",
  "Month {turn}: Still no improvement. Still no accountability. Still paying for incompetence.",
  "Maybe if we ask REALLY nicely the thieves will stop? Since clearly that's the current strategy.",
  "The coordinator is about as useful as a screen door on a submarine.",
  "Submitted a report 3 weeks ago. Status: 'under review'. Translation: thrown in trash.",
  "The coordinator's office called me back! Just kidding. That never happened.",
  "I have a revolutionary idea: what if we actually TRIED to stop bike theft? Wild concept I know.",
  "Saw the coordinator's budget breakdown. $50k went to 'analytics.' Cool. Where's my bike though?",
  "They're analyzing data while I'm analyzing my bank account after buying bike #5.",
  "The thieves have better customer service than the prevention coordinator. At least they're efficient.",
  "My bike was stolen while locked to a POLICE STATION railing. Let that sink in.",
  "Called the coordinator's office. Got voicemail. Obviously. They're too busy preventing nothing.",
  "SF has coordinators for everything EXCEPT actually solving problems. It's a talent really.",
  "We coordinated a meeting. We coordinated a task force. We coordinated NOTHING USEFUL.",
  "Bike registration system is down. Reporting system is down. But hey, bikes are still being stolen efficiently!",
  "The coordinator probably bikes to work. Oh wait, THEY CAN'T. THEIR BIKE GOT STOLEN TOO.",
  "Can we coordinate the coordinator right out of their job? Since they're not using it anyway.",
  "This job exists solely so politicians can say 'we did something' while doing nothing.",
  "I could prevent more bike thefts by yelling at clouds. At least I'd save $100k in budget.",
  "Bike stolen from {neighborhood} AGAIN. Reporter asked coordinator for comment. Crickets. As usual.",
  "Maybe the strategy is to let everyone's bikes get stolen until there are no bikes left to steal? 4D chess.",
  "Coordinator's KPIs must be: 1) Have job 2) Bike thefts increase. Both achieved. Promotion incoming!",
  "Applied for the coordinator job. Qualifications: Ability to do nothing while collecting paycheck. I'm perfect!",
  "This is the most expensive way to accomplish nothing I've ever seen. And I work in tech.",
];

const disappointedTemplates = [
  "Really thought this would be the year things improved. Same problems, different year.",
  "San Francisco used to be better than this. What happened to us?",
  "I believed in the bike-friendly city vision. Starting to lose hope.",
  "We can do better than this, SF. We really can.",
  "Moved here for the biking culture. Staying despite the theft problem. Barely.",
  "This isn't the SF I remember. When did we give up on solving problems?",
  "Expected more from city leadership. Bike theft shouldn't be this hard to address.",
  "Used to recommend SF to friends. Now I warn them about bike theft first.",
  "Every month it's the same story. Nothing changes. Why?",
  "We deserve better infrastructure. Our bikes deserve to be safe.",
  "The fact that we need a coordinator for this shows how badly leadership has failed us.",
  "Hired someone for bike theft prevention and somehow theft INCREASED. How is that even possible?",
  "My parents warned me about SF. Should've listened. Can't even own a bike here.",
  "This coordinator position is clearly just for show. Zero actual results.",
  "SF is becoming unlivable. Start with fixing bike theft, then maybe people will stay.",
  "Lost all faith in this administration. Bike theft is just one symptom of bigger incompetence.",
  "They're collecting data instead of preventing crime. Cool. Very helpful. Not.",
  "Another month, another failure. The pattern is clear: they don't care.",
  "I give up. Selling my bike and never looking back. SF doesn't deserve cyclists.",
  "The coordinator is either incompetent or powerless. Either way, we lose.",
  "Watched the coordinator's press conference. Lots of words. Zero action. Classic bureaucrat.",
  "Remember when cities actually solved problems instead of just hiring coordinators?",
  "We've tried nothing and we're all out of ideas. - The Coordinator, probably",
  "SF used to be innovative. Now we innovate new ways to waste taxpayer money.",
  "Other cities have bike theft under control. But sure, we're 'special.'",
  "The coordinator sends monthly reports. Know what would be better? Fewer stolen bikes.",
  "I don't want data. I don't want reports. I want my bike to still be there when I come back.",
  "This is what happens when you prioritize optics over outcomes.",
  "Coordinator got the job because they looked good on paper. Turns out paper doesn't stop thieves.",
  "We have the data. We have the budget. What we DON'T have is leadership with a spine.",
];

const hopefulTemplates = [
  "Saw they hired a Bike Theft Prevention Coordinator. Finally some action? 🤞",
  "Maybe things will actually improve now? Trying to stay optimistic...",
  "If we all work together maybe we can make SF safe for bikes again.",
  "New leadership, new hope. Please don't let us down.",
  "I believe we can fix this. But we need to actually try.",
  "Give the new coordinator a chance. At least someone's trying now.",
  "Small improvements are better than no improvements. Let's see what happens.",
  "Hope the new bike security measures work. We need a win here.",
  "Cautiously optimistic about the new prevention initiative.",
  "Let's support the efforts to reduce bike theft. We all want this fixed.",
];

const positiveTemplates = [
  "Wait... bike theft in {neighborhood} actually went DOWN this month?? Is this real life?",
  "Haven't had my bike stolen in 3 weeks. That's a personal record. Keep it up!",
  "Okay I'll admit it - the new lighting in {neighborhood} is actually making a difference. Impressed.",
  "Theft rate dropped from {oldRisk}% to {newRisk}%! FINALLY some good news!",
  "The coordinator is actually doing something?? And it's working??? I'm shook.",
  "My bike is still here. It's been a whole month. Thank you coordinator! 🙏",
  "Seeing real improvements in {neighborhood}. New cameras and lighting are legit helping.",
  "Citywide theft down this month! This is what we've been asking for. More of this!",
  "Coordinator deserves credit - risk in {neighborhood} dropped significantly. Actually impressed.",
  "Been parking my bike outside for 2 weeks now. No issues. Whatever you're doing, keep doing it!",
  "The investment in {neighborhood} is paying off! Theft way down. This is how you govern!",
  "Okay I was harsh before but credit where it's due - things ARE getting better. Props.",
  "My neighbor got her stolen bike recovered! First time I've heard that happen. Progress!",
  "Risk went from {oldRisk}% to {newRisk}% in {neighborhood}. That's actual progress, not just talk!",
  "The new security measures are working. My whole block still has their bikes. Wild.",
  "I owe the coordinator an apology. They're actually making a difference. Respect.",
  "Bike theft down 3 months in a row! Keep this momentum going SF!",
  "Finally some competent leadership on this issue. The improvements are real and measurable.",
  "Shoutout to whoever's actually addressing this. {neighborhood} feels safer already.",
  "Citywide average risk below 5% for the first time! This is what we needed!",
  "The coordinator is proving the haters wrong (including me). Well done. 👏",
  "Investments in lighting and cameras are actually working! More cities should do this.",
  "My bike made it through the weekend unscathed. That's... new. And amazing. Thank you!",
  "Risk in {neighborhood} cut in half! Whatever strategy you're using, it's working!",
  "First positive update I've posted in months: bike theft is actually declining. Finally!",
  "Y'all the coordinator saw all our angry tweets and ACTUALLY DID SOMETHING. Respect earned. ✊",
  "I was ready to roast the coordinator today but... bike theft is actually down??? Character development.",
  "Plot twist: the coordinator is competent. Who knew. Keep this energy!",
  "Redemption arc for the coordinator! {neighborhood} went from disaster to manageable. 🎉",
  "Never thought I'd say this but the coordinator is actually good at their job. Crazy times.",
  "The transformation of {neighborhood} is insane. From bike theft capital to actually safe. Wow.",
  "Coordinator went from villain arc to hero arc real quick. Here for it! 💪",
  "I complained LOUD and they LISTENED. Bike theft way down. This is how government should work!",
  "From 'fire the coordinator' to 'promote the coordinator' - what a turnaround!",
  "The coordinator's glow up is real. From zero to hero. Actual results speak louder than tweets.",
  "Took my bike out in {neighborhood} at night. Still there in the morning. TEARS OF JOY.",
  "This coordinator turned the ship around. Bike theft is actually under control now. Legendary.",
  "Everyone doubted but the coordinator delivered. Risk dropped citywide. Eat crow, haters (including me).",
  "The coordinator's performance review this year gonna be FIRE. In a good way. Well deserved!",
  "Who had 'coordinator actually solves bike theft' on their 2025 bingo card? Not me but I'm here for it!",
];

const brutalTemplates = [
  "The coordinator's LinkedIn probably says 'Passionate about data-driven solutions' which is code for 'does nothing'",
  "Bike Theft Prevention Coordinator is just astrology for bureaucrats. Same effectiveness too.",
  "This coordinator couldn't prevent water from being wet. Absolutely useless position.",
  "I've seen more decisive action from a traffic cone. At least the cone doesn't pretend to help.",
  "Coordinator's entire job is making PowerPoints about how bad bike theft is. We KNOW. DO SOMETHING.",
  "The position was created to give someone's nephew a city job. Prove me wrong.",
  "Bike theft coordinator meetings: 'Let's circle back on this.' Thieves: *steals 50 more bikes*",
  "POV: You're a bike in SF. Lifespan: 72 hours. Coordinator's response time: 6-8 business weeks.",
  "This coordinator has the same energy as 'thoughts and prayers.' Thanks for nothing.",
  "They hired someone whose primary skill is looking busy while accomplishing nothing. Peak SF.",
  "Coordinator's strategy: Wait for everyone to give up biking. No bikes = no theft. Genius.",
  "I've had more productive conversations with my houseplant than with the coordinator's office.",
  "The coordinator is to bike theft what a band-aid is to a bullet wound. Pointless.",
  "Imagine failing so spectacularly at your job that thousands of people roast you on Twitter daily.",
  "This person gets paid to send emails and attend meetings while bikes vanish. Living the dream.",
  "The coordinator's performance review must be interesting. 'Goals achieved: 0. Bikes saved: also 0.'",
  "Every time the coordinator has a 'brainstorming session,' three more bikes get stolen.",
  "They could replace the coordinator with a Magic 8-Ball and get better results.",
  "Coordinator's office response time: 3-5 business weeks. Bike theft time: 3-5 minutes.",
  "The position is basically a participation trophy for bureaucratic incompetence.",
  "I'd respect the coordinator more if they just admitted they have no idea what they're doing.",
  "This job is what happens when cities confuse 'doing something' with 'appearing to do something.'",
  "Coordinator spends all day in meetings about bike theft. Know what would help? PREVENTING BIKE THEFT.",
  "The coordinator's biggest achievement: convincing people they're trying. Spoiler: they're not.",
  "SF created a job for someone to watch the bike theft problem get worse. That's the job. That's it.",
  "The coordinator couldn't organize a bake sale, let alone prevent citywide bike theft.",
  "This position has the same energy as hiring a lifeguard who doesn't know how to swim.",
  "Coordinator probably has 'synergy' and 'stakeholder engagement' in their email signature. Cringe.",
  "If incompetence was an Olympic sport, this coordinator would take gold.",
  "The coordinator's to-do list: 1) Pretend to care 2) Cash paycheck 3) Ignore angry tweets",
  "I've seen more effective crisis management from a Waffle House at 3am.",
  "This job is performance art titled 'How to Get Paid While Doing Absolutely Nothing'",
  "Coordinator's superpower: turning $100k into zero results. Truly remarkable.",
  "The coordinator has successfully prevented: [ERROR: NO DATA FOUND]",
  "At this point I think the coordinator is a myth. Like Bigfoot. Except Bigfoot might actually exist.",
  "Bike Theft Prevention Coordinator is just 'Professional Email Sender' with extra steps.",
  "This person couldn't prevent a sneeze, let alone organized crime.",
  "The coordinator writes reports nobody reads about problems nobody solves. Peak bureaucracy.",
  "I have more faith in a Ouija board than in this coordinator's ability to do their job.",
  "Coordinator's crisis management plan: Step 1) Panic Step 2) Do nothing Step 3) Blame budget",
  "They hired someone to prevent bike theft and got someone who prevents... solutions apparently.",
  "This coordinator is why aliens won't visit Earth. They saw our governance and noped out.",
  "The position exists purely as a tax write-off for government incompetence.",
  "Coordinator couldn't find their way out of a paper bag even if the bag had an exit sign.",
  "If there was an award for most useless city position, this would win unanimously.",
  "The coordinator's job is basically just existing while problems get worse. They're nailing it.",
  "I'd say the coordinator is asleep at the wheel but that implies they have a wheel.",
  "This is what happens when you hire based on buzzwords instead of actual competence.",
  "Coordinator's response to crisis: 'Let me get back to you.' Narrator: They never got back.",
  "The position was probably created by ChatGPT given how useless it is.",
  "Coordinator's Zoom background is probably motivational quotes while bikes get stolen in real time.",
  "They're conducting a 'comprehensive review' of bike theft. Translation: Googling 'how to do my job'",
  "This coordinator brings new meaning to the phrase 'all talk, no action.' Actually just no action.",
  "Hiring this coordinator was like hiring a chocolate teapot. Looks official, completely useless.",
  "The coordinator's office has a suggestion box. It's full. They've never opened it.",
  "Bike Theft Prevention Coordinator is the government equivalent of 'New year new me' - empty promises.",
  "This person's resume must be wild. 'Excelled at attending meetings while Rome burned.'",
  "The coordinator is so bad at their job that the thieves are starting to feel bad for them. Starting to.",
  "SF's solution to bike theft: hire someone, give them a title, hope problem solves itself. Spoiler: it didn't.",
  "This coordinator makes DMV employees look efficient. That's how bad this is.",
  "The coordinator's action plan is so slow, evolution will solve bike theft first.",
  "I've seen faster response times from Internet Explorer. IN 2025.",
  "Coordinator's office probably has one of those 'Days Since Last Bike Saved' signs. It's at 0. Permanently.",
  "This person's entire career is proof that you can fail upward in government.",
  "The coordinator has the problem-solving skills of a pet rock. Actually the rock would be cheaper.",
  "SF hired someone to prevent bike theft and got someone who's excellent at... checking Twitter apparently.",
  "Coordinator's biggest fear isn't bike theft. It's someone asking them what they actually do all day.",
  "This job is just 'professional meeting attendee' with a fancy bike-related title slapped on.",
  "The coordinator's strategy meeting probably just them staring at a wall for 8 hours.",
  "If they fired the coordinator tomorrow, literally nothing would change. That's the saddest part.",
  "This position is the government's way of saying 'we tried' without actually trying.",
  "Coordinator couldn't coordinate a one-car parade. We're trusting them with citywide crime?",
  "The job description must have been: 'Get paid to disappoint thousands of people monthly.'",
  "At this point the coordinator is just a very expensive scarecrow. Except scarecrows actually work.",
];

export function generateInitialPosts(turn: number): SocialPost[] {
  const posts: SocialPost[] = [];
  const postCount = Math.floor(Math.random() * 1000) + 1500; // 1500-2500 initial posts (THOUSANDS of angry people!)
  
  for (let i = 0; i < postCount; i++) {
    // Initial posts are negative (performance = 0) since coordinator just started
    posts.push(generateRandomPost(turn, i, 0));
  }
  
  return posts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function generateRandomPost(turn: number, index: number, performanceMultiplier: number = 0): SocialPost {
  const sentiments: Array<'angry' | 'sarcastic' | 'concerned' | 'frustrated' | 'disappointed' | 'hopeful' | 'brutal' | 'positive'> = 
    ['angry', 'sarcastic', 'concerned', 'frustrated', 'disappointed', 'hopeful', 'brutal', 'positive'];
  
  // Weight sentiments - VERY negative by default, but adjust based on performance
  // performanceMultiplier: 0 = terrible (default angry), 1 = great (more positive)
  const baseNegative = Math.max(0.05, 0.30 - (performanceMultiplier * 0.25)); // angry: 30% -> 5%
  const baseSarcastic = Math.max(0.05, 0.25 - (performanceMultiplier * 0.20)); // sarcastic: 25% -> 5%
  const baseBrutal = Math.max(0.02, 0.15 - (performanceMultiplier * 0.13)); // brutal: 15% -> 2%
  const baseFrustrated = Math.max(0.05, 0.15 - (performanceMultiplier * 0.10)); // frustrated: 15% -> 5%
  const baseDisappointed = Math.max(0.03, 0.08 - (performanceMultiplier * 0.05)); // disappointed: 8% -> 3%
  const baseConcerned = 0.10; // stays constant
  const baseHopeful = Math.min(0.15, 0.02 + (performanceMultiplier * 0.13)); // hopeful: 2% -> 15%
  const basePositive = Math.min(0.50, 0.00 + (performanceMultiplier * 0.50)); // positive: 0% -> 50%
  
  const sentimentWeights = [baseNegative, baseSarcastic, baseConcerned, baseFrustrated, baseDisappointed, baseHopeful, baseBrutal, basePositive];
  const random = Math.random();
  let cumulative = 0;
  let sentiment: typeof sentiments[number] = 'angry';
  
  for (let i = 0; i < sentimentWeights.length; i++) {
    cumulative += sentimentWeights[i];
    if (random < cumulative) {
      sentiment = sentiments[i];
      break;
    }
  }
  
  const templates = {
    angry: angryTemplates,
    sarcastic: sarcasticTemplates,
    concerned: concernedTemplates,
    frustrated: frustratedTemplates,
    disappointed: disappointedTemplates,
    hopeful: hopefulTemplates,
    brutal: brutalTemplates,
    positive: positiveTemplates,
  };
  
  const template = templates[sentiment][Math.floor(Math.random() * templates[sentiment].length)];
  const neighborhoods = ['Tenderloin', 'Mission', 'SoMa', 'Financial District', 'Castro', 'Haight', 'Marina'];
  const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
  
  const content = template
    .replace('{turn}', turn.toString())
    .replace('{neighborhood}', neighborhood);
  
  const username = usernames[Math.floor(Math.random() * usernames.length)];
  const name = names[Math.floor(Math.random() * names.length)];
  
  // Generate timestamps spread over last few days
  const hoursAgo = Math.floor(Math.random() * 72); // Last 3 days
  const timestamp = new Date();
  timestamp.setHours(timestamp.getHours() - hoursAgo);
  
  return {
    id: `post-${Date.now()}-${index}`,
    username: `@${username}`,
    displayName: name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    content,
    timestamp,
    sentiment,
    neighborhood: Math.random() > 0.5 ? neighborhood : undefined
  };
}

export function generateNewPosts(turn: number, streets: any[]): SocialPost[] {
  const posts: SocialPost[] = [];
  const highRiskStreets = streets.filter(s => s.riskPercentage > 7);
  const lowRiskStreets = streets.filter(s => s.riskPercentage < 4);
  const investedStreets = streets.filter(s => s.investment > 10000);
  const lowInvestmentStreets = streets.filter(s => s.investment < 10000);
  const averageRisk = streets.reduce((sum, s) => sum + s.riskPercentage, 0) / streets.length;
  
  // Calculate performance multiplier (0 = terrible, 1 = excellent)
  // Based on: average risk, % of low risk streets, % of invested streets
  const riskScore = Math.max(0, Math.min(1, (10 - averageRisk) / 8)); // 10% risk = 0, 2% risk = 1
  const lowRiskScore = lowRiskStreets.length / streets.length; // % of low risk streets
  const investmentScore = investedStreets.length / streets.length; // % of invested streets
  const performanceMultiplier = (riskScore * 0.5) + (lowRiskScore * 0.3) + (investmentScore * 0.2);
  
  // Generate 30-60 new posts per turn
  const postCount = Math.floor(Math.random() * 30) + 30;
  
  for (let i = 0; i < postCount; i++) {
    // If performance is good, generate positive posts about improvements
    if (performanceMultiplier > 0.6 && Math.random() > 0.4) {
      const improvedStreets = streets.filter(s => s.investment > 10000 && s.riskPercentage < 5);
      if (improvedStreets.length > 0) {
        const street = improvedStreets[Math.floor(Math.random() * improvedStreets.length)];
        const oldRisk = (street.historicalRisk || street.riskPercentage * 1.5).toFixed(1);
        const newRisk = street.riskPercentage.toFixed(1);
        
        let content = positiveTemplates[Math.floor(Math.random() * positiveTemplates.length)];
        content = content
          .replace('{neighborhood}', street.name)
          .replace('{oldRisk}', oldRisk)
          .replace('{newRisk}', newRisk)
          .replace('{turn}', turn.toString());
        
        posts.push({
          id: `post-${Date.now()}-${i}`,
          username: `@${usernames[Math.floor(Math.random() * usernames.length)]}`,
          displayName: names[Math.floor(Math.random() * names.length)],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
          content,
          timestamp: new Date(),
          sentiment: 'positive',
          neighborhood: street.name
        });
        continue;
      }
    }
    
    // Extra brutal posts if high risk areas exist and no investments (only if performance is bad)
    if (performanceMultiplier < 0.4 && highRiskStreets.length > 0 && lowInvestmentStreets.length > 20 && Math.random() > 0.5) {
      const street = highRiskStreets[Math.floor(Math.random() * highRiskStreets.length)];
      const templates = [
        `${street.name} has ${street.riskPercentage.toFixed(1)}% risk and ZERO investment. Coordinator asleep or just incompetent?`,
        `Month {turn} and ${street.name} is STILL a warzone. But sure, keep doing nothing.`,
        `Bike stolen in ${street.name}. Coordinator's response: *cricket sounds*`,
        `${street.name} risk is ${street.riskPercentage.toFixed(1)}%. Coordinator's action plan: absolutely nothing apparently.`,
        `Hey @BikeCoordinator maybe ADDRESS ${street.name}??? Just a thought???`,
      ];
      posts.push({
        id: `post-${Date.now()}-${i}`,
        username: `@${usernames[Math.floor(Math.random() * usernames.length)]}`,
        displayName: names[Math.floor(Math.random() * names.length)],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        content: templates[Math.floor(Math.random() * templates.length)].replace('{turn}', turn.toString()),
        timestamp: new Date(),
        sentiment: Math.random() > 0.5 ? 'brutal' : 'angry',
        neighborhood: street.name
      });
    } else if (performanceMultiplier < 0.4 && averageRisk > 6 && Math.random() > 0.7) {
      // Brutal posts about overall failure if city risk is high
      const brutals = [
        `Citywide average risk is ${averageRisk.toFixed(1)}%. This is fine. Everything is fine. 🔥`,
        `Coordinator getting paid to watch risk climb to ${averageRisk.toFixed(1)}%. What a gig.`,
        `We're at ${averageRisk.toFixed(1)}% avg risk. Maybe try... doing your job?`,
      ];
      posts.push({
        id: `post-${Date.now()}-${i}`,
        username: `@${usernames[Math.floor(Math.random() * usernames.length)]}`,
        displayName: names[Math.floor(Math.random() * names.length)],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        content: brutals[Math.floor(Math.random() * brutals.length)],
        timestamp: new Date(),
        sentiment: 'brutal',
      });
    } else {
      // General posts with dynamic sentiment based on performance
      posts.push(generateRandomPost(turn, i, performanceMultiplier));
    }
  }
  
  return posts;
}
