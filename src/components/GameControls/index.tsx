import React from 'react';
import { Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { nextTurn, resetGame } from '../../store/actions/game.actions';
import { selectStreets, selectCurrentTurn } from '../../store/selectors/game.selectors';
import { SOCIAL_ACTION_TYPES } from '../../store/reducers/social.reducer';
import { EMAIL_ACTION_TYPES } from '../../store/actions/email.actions';
import { generateNewPosts } from '../../services/socialGenerator';
import { RootState } from '../../types';
import { calculatePolicePresence, getBacklashLevel, generateBacklashEmail, generateBacklashPosts } from '../../services/backlash';
import { generateVandalismIncidents, generateVandalismEmail } from '../../services/vandalism';
import './styles.scss';

const GameControls: React.FC = () => {
  const dispatch = useDispatch();
  const streets = useSelector(selectStreets);
  const currentTurn = useSelector(selectCurrentTurn);
  const placedInvestments = useSelector((state: RootState) => state.game.placedInvestments);
  const actionsLocked = useSelector((state: RootState) => state.game.actionsLocked);
  const previousPolicePresence = React.useRef(0);

  const handleNextTurn = () => {
    // Store before-state for comparison
    const prevInvestmentCount = placedInvestments.length;
    
    // Check police presence BEFORE advancing turn
    const policePresence = calculatePolicePresence(placedInvestments);
    const backlashLevel = getBacklashLevel(policePresence);
    const wasAboveThreshold = backlashLevel !== 'none' && backlashLevel !== 'warning';
    
    // Check for vandalism BEFORE turn (to send email about what will happen)
    const vandalismIncidents = generateVandalismIncidents(placedInvestments, streets, currentTurn + 1);
    
    // Dispatch NEXT_TURN action (this removes vandalized items and updates state)
    dispatch(nextTurn());
    
    // Send notifications after turn advances
    setTimeout(() => {
      // Send vandalism email if incidents occurred
      if (vandalismIncidents.length > 0) {
        const vandalismEmail = generateVandalismEmail(vandalismIncidents, currentTurn + 1);
        dispatch({ type: EMAIL_ACTION_TYPES.ADD_EMAIL, payload: vandalismEmail });
      }
      
      // If backlash was triggered, send email and posts
      if (wasAboveThreshold && !actionsLocked) {
        const email = generateBacklashEmail(backlashLevel as any, currentTurn + 1);
        const posts = generateBacklashPosts(backlashLevel as any, currentTurn + 1);
        
        dispatch({ type: EMAIL_ACTION_TYPES.ADD_EMAIL, payload: email });
        dispatch({ type: SOCIAL_ACTION_TYPES.ADD_POSTS, payload: posts });
      } else {
        // Generate normal social media posts based on current state
        const newPosts = generateNewPosts(currentTurn + 1, streets);
        dispatch({ type: SOCIAL_ACTION_TYPES.ADD_POSTS, payload: newPosts });
      }
    }, 100);
    
    previousPolicePresence.current = policePresence;
  };

  const handleResetGame = () => {
    if (window.confirm('Are you sure you want to reset the game? All progress will be lost.')) {
      dispatch(resetGame());
    }
  };

  return (
    <div className="game-controls">
      <div className="simulation-section">
        <Typography variant="subtitle2" className="section-label">
          Simulation
        </Typography>
        <button 
          className="simulate-button"
          onClick={handleNextTurn}
        >
          <div className="button-content">
            <span className="button-icon">▶</span>
            <div className="button-text">
              <span className="button-label">Advance Simulation</span>
              <span className="button-sublabel">Run next turn</span>
            </div>
          </div>
        </button>
      </div>

      <button 
        className="reset-button"
        onClick={handleResetGame}
      >
        Reset Game
      </button>
    </div>
  );
};

export default GameControls;