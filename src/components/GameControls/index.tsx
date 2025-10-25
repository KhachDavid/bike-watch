import React from 'react';
import { Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { nextTurn, resetGame } from '../../store/actions/game.actions';
import { selectStreets, selectCurrentTurn } from '../../store/selectors/game.selectors';
import { SOCIAL_ACTION_TYPES } from '../../store/reducers/social.reducer';
import { generateNewPosts } from '../../services/socialGenerator';
import './styles.scss';

const GameControls: React.FC = () => {
  const dispatch = useDispatch();
  const streets = useSelector(selectStreets);
  const currentTurn = useSelector(selectCurrentTurn);

  const handleNextTurn = () => {
    dispatch(nextTurn());
    
    // Generate new social media posts based on current state
    const newPosts = generateNewPosts(currentTurn + 1, streets);
    dispatch({ type: SOCIAL_ACTION_TYPES.ADD_POSTS, payload: newPosts });
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