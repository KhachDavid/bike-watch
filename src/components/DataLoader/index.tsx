import React from 'react';
import { Typography, CircularProgress, Alert } from '@mui/material';
import './styles.scss';

interface DataLoaderProps {
  onDataLoaded: () => void;
}

const DataLoader: React.FC<DataLoaderProps> = () => {
  return (
    <div className="data-loader-overlay">
      <div className="data-loader-content">
        <Typography variant="h5" className="loader-title">
          🚴 Bike Watch
        </Typography>
        <Typography variant="subtitle1" className="loader-subtitle">
          San Francisco Urban Planning Simulator
        </Typography>
        
        <div className="loader-spinner">
          <CircularProgress size={40} />
        </div>
        
        <Typography variant="body2" className="loader-status">
          Loading real SFPD bike theft data...
        </Typography>
        
        <Alert severity="info" className="loader-info">
          <strong>Data:</strong> 560 real SFPD bike theft incidents (2023-2024)
          <br />
          <strong>Gameplay:</strong> Patterns preserved, numbers scaled 100-150× for INTENSE action
          <br />
          <strong>Game Start:</strong> January 2025
        </Alert>
      </div>
    </div>
  );
};

export default DataLoader;
