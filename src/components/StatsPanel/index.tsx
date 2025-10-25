import React, { useState } from 'react';
import { Typography, IconButton, Collapse, LinearProgress } from '@mui/material';
import { ExpandMore, ExpandLess, Videocam, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectTotalThefts, selectAverageRisk, selectTotalBikes } from '../../store/selectors/game.selectors';
import { RootState } from '../../types';
import { calculateRecoveryBreakdown } from '../../services/theftSimulation';
import './styles.scss';

const StatsPanel: React.FC = () => {
  const [recoveryExpanded, setRecoveryExpanded] = useState(false);
  
  const totalThefts = useSelector(selectTotalThefts);
  const averageRisk = useSelector(selectAverageRisk);
  const totalBikes = useSelector(selectTotalBikes);
  const recoveryRate = useSelector((state: RootState) => state.game.recoveryRate);
  const totalRecovered = useSelector((state: RootState) => state.game.totalRecovered);
  const totalMoneyRecovered = useSelector((state: RootState) => state.game.totalMoneyRecovered);
  const activeThefts = useSelector((state: RootState) => state.game.thefts.filter(t => !t.solved).length);
  const totalTheftCases = useSelector((state: RootState) => state.game.thefts.length);
  const thefts = useSelector((state: RootState) => state.game.thefts);
  const currentTurn = useSelector((state: RootState) => state.game.currentTurn);
  const detectiveCount = useSelector((state: RootState) => state.game.detectives.length);
  
  const recoveryBreakdown = calculateRecoveryBreakdown(thefts, currentTurn, detectiveCount);

  const getRiskLevel = (risk: number) => {
    // Risk ranges: 2-10% (meaningful gameplay)
    if (risk < 4) return { level: 'Low', color: 'success' };         // < 4%
    if (risk < 7) return { level: 'Medium', color: 'warning' };      // 4% - 7%
    return { level: 'High', color: 'error' };                        // > 7%
  };

  const getRecoveryRating = (rate: number) => {
    if (rate >= 30) return { label: 'Excellent', color: 'success' };
    if (rate >= 20) return { label: 'Good', color: 'success' };
    if (rate >= 10) return { label: 'Fair', color: 'warning' };
    return { label: 'Poor', color: 'error' };
  };

  const riskInfo = getRiskLevel(averageRisk);
  const recoveryRating = getRecoveryRating(recoveryRate);

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
          
          <div className="stat-item recovery-stat-item" onClick={() => setRecoveryExpanded(!recoveryExpanded)}>
            <div className="stat-header-with-icon">
              <div className="stat-value-group">
                <div className="stat-value">{recoveryRate}%</div>
                {recoveryBreakdown.trend.improving ? (
                  <TrendingUp className="trend-icon trend-up" />
                ) : (
                  <TrendingDown className="trend-icon trend-down" />
                )}
              </div>
              <IconButton size="small" className="expand-btn">
                {recoveryExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </div>
            <div className="stat-label">Recovery Rate</div>
            <div className={`stat-subtitle recovery-rating-${recoveryRating.color}`}>
              {recoveryRating.label} • {totalRecovered} of {totalTheftCases} bikes
            </div>
            
            <Collapse in={recoveryExpanded} timeout="auto">
              <div className="recovery-breakdown">
                <div className="breakdown-header">
                  <Typography variant="caption" className="breakdown-title">
                    📊 Recovery Analysis
                  </Typography>
                </div>
                
                {/* Footage Quality Breakdown */}
                <div className="breakdown-section">
                  <Typography variant="caption" className="section-label">
                    <Videocam fontSize="inherit" /> By Camera Quality
                  </Typography>
                  
                  {recoveryBreakdown.byFootage.ai.total > 0 && (
                    <div className="breakdown-row">
                      <span className="footage-label ai-footage">AI Cameras</span>
                      <div className="breakdown-bar-container">
                        <LinearProgress 
                          variant="determinate" 
                          value={recoveryBreakdown.byFootage.ai.rate} 
                          className="recovery-bar ai-bar"
                        />
                        <span className="breakdown-value">{recoveryBreakdown.byFootage.ai.rate}%</span>
                      </div>
                      <span className="breakdown-count">({recoveryBreakdown.byFootage.ai.recovered}/{recoveryBreakdown.byFootage.ai.total})</span>
                    </div>
                  )}
                  
                  {recoveryBreakdown.byFootage.hd.total > 0 && (
                    <div className="breakdown-row">
                      <span className="footage-label hd-footage">HD Cameras</span>
                      <div className="breakdown-bar-container">
                        <LinearProgress 
                          variant="determinate" 
                          value={recoveryBreakdown.byFootage.hd.rate} 
                          className="recovery-bar hd-bar"
                        />
                        <span className="breakdown-value">{recoveryBreakdown.byFootage.hd.rate}%</span>
                      </div>
                      <span className="breakdown-count">({recoveryBreakdown.byFootage.hd.recovered}/{recoveryBreakdown.byFootage.hd.total})</span>
                    </div>
                  )}
                  
                  {recoveryBreakdown.byFootage.standard.total > 0 && (
                    <div className="breakdown-row">
                      <span className="footage-label standard-footage">Standard</span>
                      <div className="breakdown-bar-container">
                        <LinearProgress 
                          variant="determinate" 
                          value={recoveryBreakdown.byFootage.standard.rate} 
                          className="recovery-bar standard-bar"
                        />
                        <span className="breakdown-value">{recoveryBreakdown.byFootage.standard.rate}%</span>
                      </div>
                      <span className="breakdown-count">({recoveryBreakdown.byFootage.standard.recovered}/{recoveryBreakdown.byFootage.standard.total})</span>
                    </div>
                  )}
                  
                  {recoveryBreakdown.byFootage.noFootage.total > 0 && (
                    <div className="breakdown-row">
                      <span className="footage-label no-footage">No Footage</span>
                      <div className="breakdown-bar-container">
                        <LinearProgress 
                          variant="determinate" 
                          value={recoveryBreakdown.byFootage.noFootage.rate} 
                          className="recovery-bar no-footage-bar"
                        />
                        <span className="breakdown-value">{recoveryBreakdown.byFootage.noFootage.rate}%</span>
                      </div>
                      <span className="breakdown-count">({recoveryBreakdown.byFootage.noFootage.recovered}/{recoveryBreakdown.byFootage.noFootage.total})</span>
                    </div>
                  )}
                </div>
                
                {/* Case Status */}
                <div className="breakdown-section">
                  <Typography variant="caption" className="section-label">
                    📋 Case Status
                  </Typography>
                  <div className="case-status-row">
                    <span className="status-label">Solved:</span>
                    <span className="status-value solved-value">{recoveryBreakdown.bySolved.solved} ({recoveryBreakdown.bySolved.solveRate}%)</span>
                  </div>
                  <div className="case-status-row">
                    <span className="status-label">Unsolved:</span>
                    <span className="status-value unsolved-value">{recoveryBreakdown.bySolved.unsolved}</span>
                  </div>
                </div>
                
                {/* Insights */}
                {recoveryBreakdown.insights.length > 0 && (
                  <div className="breakdown-section insights-section">
                    <Typography variant="caption" className="section-label">
                      💡 Insights & Actions
                    </Typography>
                    {recoveryBreakdown.insights.map((insight, idx) => (
                      <div key={idx} className="insight-item">
                        {insight}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Collapse>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">${(totalMoneyRecovered / 1000).toFixed(1)}k</div>
            <div className="stat-label">Money Recovered</div>
            <div className="stat-subtitle">From solved cases</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{activeThefts}</div>
            <div className="stat-label">Active Cases</div>
            <div className="stat-subtitle">Unsolved thefts</div>
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