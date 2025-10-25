import React from 'react';
import { Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectCurrentBudget, selectCurrentTurn } from '../../store/selectors/game.selectors';
import EmailInbox from '../EmailInbox';
import SocialFeed from '../SocialFeed';
import './styles.scss';

const GameHeader: React.FC = () => {
  const currentBudget = useSelector(selectCurrentBudget);
  const currentTurn = useSelector(selectCurrentTurn);
  
  // Game starts January 2025
  const gameStartDate = new Date(2025, 0, 1); // January 2025
  const currentGameDate = new Date(gameStartDate);
  currentGameDate.setMonth(currentGameDate.getMonth() + currentTurn - 1);
  
  const monthYear = currentGameDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <header className="game-header">
      <div className="game-header-content">
        <div className="game-title-section">
          <Typography variant="h4" component="h1" className="game-title">
            Bike Watch
          </Typography>
          <Typography variant="body2" className="game-subtitle">
            SF Bicycle Theft Prevention Coordinator
          </Typography>
        </div>
        
        <div className="game-stats">
          <div className="stat-item">
            <Typography variant="body2" className="stat-label">
              Current Date
            </Typography>
            <Typography variant="h6" className="stat-value">
              {monthYear}
            </Typography>
          </div>
          
          <div className="stat-item">
            <Typography variant="body2" className="stat-label">
              Budget
            </Typography>
            <Typography variant="h6" className="stat-value">
              ${currentBudget.toLocaleString()}
            </Typography>
          </div>
          
          <div className="stat-item">
            <Typography variant="body2" className="stat-label">
              Month
            </Typography>
            <Typography variant="h6" className="stat-value">
              {currentTurn}
            </Typography>
          </div>
          
          <div className="stat-item communication-item">
            <SocialFeed />
            <EmailInbox />
          </div>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;