import React from 'react';
import { Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectTotalThefts, selectAverageRisk, selectTotalBikes } from '../../store/selectors/game.selectors';
import './styles.scss';

const StatsPanel: React.FC = () => {
  const totalThefts = useSelector(selectTotalThefts);
  const averageRisk = useSelector(selectAverageRisk);
  const totalBikes = useSelector(selectTotalBikes);

  const getRiskLevel = (risk: number) => {
    // Risk ranges: 2-10% (meaningful gameplay)
    if (risk < 4) return { level: 'Low', color: 'success' };         // < 4%
    if (risk < 7) return { level: 'Medium', color: 'warning' };      // 4% - 7%
    return { level: 'High', color: 'error' };                        // > 7%
  };

  const riskInfo = getRiskLevel(averageRisk);

  return (
    <div className="card stats-panel">
      <div className="card-header">
        <Typography variant="h6" className="card-title">
          City Statistics
        </Typography>
      </div>
      
      <div className="card-content">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{totalThefts}</div>
            <div className="stat-label">Total Thefts</div>
            <div className="stat-subtitle">This month</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{averageRisk}%</div>
            <div className="stat-label">Average Risk</div>
            <div className={`stat-subtitle risk-${riskInfo.color}`}>
              {riskInfo.level} Risk
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{totalBikes.toLocaleString()}</div>
            <div className="stat-label">Daily Traffic</div>
            <div className="stat-subtitle">Bikes per day</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;