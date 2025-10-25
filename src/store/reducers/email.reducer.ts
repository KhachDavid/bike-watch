import { EmailState, Email } from '../../types/email.types';
import { EMAIL_ACTION_TYPES } from '../actions/email.actions';

const onboardingEmail: Email = {
  id: 'onboarding-001',
  from: 'mayor@sf.gov',
  fromTitle: 'Mayor Daniel Lurie',
  subject: 'Welcome to Your New Role: SF Bicycle Theft Prevention Coordinator',
  body: `OFFICE OF THE MAYOR
CITY AND COUNTY OF SAN FRANCISCO

Dear Bicycle Theft Prevention Coordinator,

Congratulations on your appointment! Yes, we know it's a quirky title, but it's a real problem and you're the person we're counting on to fix it.

WHAT'S HAPPENING:
San Francisco has documented 560 bike theft incidents over the past two years. Our bike-loving residents are frustrated, and honestly, so are we. These thefts hurt our community, discourage sustainable transportation, and make people think twice about biking to work or school.

YOUR NEW JOB:
You'll manage a dedicated budget to reduce bike thefts across San Francisco neighborhoods. Think of yourself as part urban planner, part data analyst, part community advocate. You'll make investment decisions about lighting, bike parking, cameras, and community programs based on real SFPD crime data.

WHAT YOU GET TO WORK WITH:
- Starting Budget: $100,000
- Monthly Funding: $10,000 plus bonuses for good performance
- Real-time neighborhood crime statistics
- Authority to greenlight infrastructure improvements citywide

TOOLS AT YOUR DISPOSAL:
- Better street lighting (thieves hate well-lit areas)
- Security camera installations
- Protected bike parking facilities
- Community watch and education programs
- Coordinated police patrol support

WHAT WE'RE ASKING FOR:
Work toward getting our citywide bike theft risk below 5% within six months. Focus especially on neighborhoods with the highest incident rates - the data will show you where to start.

Your dashboard has everything you need: theft patterns, risk assessments, neighborhood profiles. Use the data wisely, deploy resources strategically, and help us make San Francisco a place where people can safely ride bikes again.

Good luck out there.

Mayor Daniel Lurie
City and County of San Francisco`,
  timestamp: new Date(2025, 0, 1, 8, 0, 0), // Jan 1, 2025, 8:00 AM
  read: false,
  priority: 'urgent'
};

const initialState: EmailState = {
  emails: [onboardingEmail],
  unreadCount: 1
};

export default function emailReducer(state = initialState, action: any): EmailState {
  switch (action.type) {
    case EMAIL_ACTION_TYPES.ADD_EMAIL:
      return {
        ...state,
        emails: [action.payload, ...state.emails],
        unreadCount: state.unreadCount + 1
      };

    case EMAIL_ACTION_TYPES.MARK_EMAIL_READ:
      const updatedEmails = state.emails.map(email =>
        email.id === action.payload ? { ...email, read: true } : email
      );
      const newUnreadCount = updatedEmails.filter(e => !e.read).length;
      return {
        ...state,
        emails: updatedEmails,
        unreadCount: newUnreadCount
      };

    case EMAIL_ACTION_TYPES.MARK_ALL_READ:
      return {
        ...state,
        emails: state.emails.map(email => ({ ...email, read: true })),
        unreadCount: 0
      };

    default:
      return state;
  }
}
