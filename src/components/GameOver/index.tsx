import React from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../types';
import { resetGame } from '../../store/actions/game.actions';
import './styles.scss';

const GameOver: React.FC = () => {
  const dispatch = useDispatch();
  const gameOver = useSelector((state: RootState) => state.game.gameOver);
  const gameOverReason = useSelector((state: RootState) => state.game.gameOverReason);
  const currentTurn = useSelector((state: RootState) => state.game.currentTurn);
  const totalRecovered = useSelector((state: RootState) => state.game.totalRecovered);
  const totalMoneyRecovered = useSelector((state: RootState) => state.game.totalMoneyRecovered);
  
  const handleRestart = () => {
    dispatch(resetGame());
  };
  
  const totalMonths = currentTurn - 1; // Total months in office
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  
  const timeInOffice = years > 0 
    ? `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `and ${months} month${months > 1 ? 's' : ''}` : ''}`
    : `${months} month${months > 1 ? 's' : ''}`;
  
  return (
    <Dialog 
      open={gameOver} 
      maxWidth="md" 
      fullWidth
      className="game-over-dialog"
      disableEscapeKeyDown
    >
      <DialogTitle className="game-over-title">
        <div className="game-over-icon">🚫</div>
        <Typography variant="h4" component="div" style={{ fontWeight: 700 }}>
          GAME OVER
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          You've been relieved of your duties
        </Typography>
      </DialogTitle>
      
      <DialogContent className="game-over-content">
        <div className="termination-notice">
          <Typography variant="h6" gutterBottom style={{ color: '#ef4444', fontWeight: 600 }}>
            📧 Termination Notice from Mayor's Office
          </Typography>
          
          <div className="termination-body">
            {gameOverReason || 'Performance did not meet expectations.'}
          </div>
        </div>
        
        <div className="final-stats">
          <Typography variant="h6" gutterBottom style={{ marginTop: '24px' }}>
            📊 Final Statistics
          </Typography>
          
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Time in Office:</span>
              <span className="stat-value">{timeInOffice}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Bikes Recovered:</span>
              <span className="stat-value">{totalRecovered.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Money Recovered:</span>
              <span className="stat-value">${totalMoneyRecovered.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="game-over-actions">
          <Button
            variant="contained"
            size="large"
            onClick={handleRestart}
            className="restart-button"
          >
            Start New Game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameOver;
