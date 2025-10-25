import React from 'react';
import { Typography, Button, Chip } from '@mui/material';
import { Videocam, Lightbulb, Lock, Group, LocalPolice, Search } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { selectInvestmentTypes, selectSelectedInvestment } from '../../store/selectors/game.selectors';
import { selectInvestment } from '../../store/actions/game.actions';
import { RootState } from '../../types';
import DetectiveMarketplace from '../DetectiveMarketplace';
import './styles.scss';

const InvestmentPanel: React.FC = () => {
  const investmentTypes = useSelector(selectInvestmentTypes);
  const selectedInvestment = useSelector(selectSelectedInvestment);
  const currentBudget = useSelector((state: RootState) => state.game.currentBudget);
  const detectives = useSelector((state: RootState) => state.game.detectives);
  const dispatch = useDispatch();

  const handleSelectInvestment = (type: string) => {
    dispatch(selectInvestment(type));
  };

  const getInvestmentIcon = (effect: string) => {
    switch (effect) {
      case 'lighting': return <Lightbulb />;
      case 'security': return <Lock />;
      case 'camera': return <Videocam />;
      case 'community': return <Group />;
      case 'enforcement': return <LocalPolice />;
      case 'detective': return <Search />;
      default: return null;
    }
  };

  const getCameraQualityBadge = (quality?: string, radius?: number) => {
    if (!quality) return null;
    
    const badges: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' }> = {
      'standard': { label: `${radius || 50}m`, color: 'default' },
      'hd': { label: `${radius || 75}m HD`, color: 'primary' },
      'ai-enabled': { label: `${radius || 100}m AI`, color: 'secondary' }
    };
    
    const badge = badges[quality];
    return <Chip label={badge.label} color={badge.color} size="small" className="coverage-badge" />;
  };

  // Group investments by type
  const cameraInvestments = Object.entries(investmentTypes).filter(([_, inv]) => inv.effect === 'camera');
  const detectiveInvestments = Object.entries(investmentTypes).filter(([_, inv]) => inv.effect === 'detective');
  const otherInvestments = Object.entries(investmentTypes).filter(([_, inv]) => 
    inv.effect !== 'camera' && inv.effect !== 'detective'
  );

  return (
    <div className="card investment-panel">
      <div className="card-header">
        <Typography variant="h6" className="card-title">
          Investment Options
        </Typography>
        <div className="budget-display">
          Budget: ${currentBudget.toLocaleString()}
        </div>
      </div>
      
      <div className="card-content">
        {/* Camera Systems */}
        {cameraInvestments.length > 0 && (
          <div className="investment-category">
            <h4 className="category-title">
              <Videocam fontSize="small" /> Camera Systems
            </h4>
            <p className="category-description">
              Place cameras on the map to provide surveillance coverage
            </p>
            <div className="investment-options">
              {cameraInvestments.map(([type, investment]) => (
                <Button
                  key={type}
                  className={`investment-option camera-option ${selectedInvestment === type ? 'selected' : ''}`}
                  onClick={() => handleSelectInvestment(type)}
                  variant={selectedInvestment === type ? 'contained' : 'outlined'}
                  fullWidth
                  disabled={currentBudget < investment.cost}
                >
                  <div className="option-content">
                    <div className="option-header">
                      {getInvestmentIcon(investment.effect)}
                      <div className="option-name">{investment.name}</div>
                      {getCameraQualityBadge(investment.cameraQuality, investment.effectRadius)}
                    </div>
                    {investment.description && (
                      <div className="option-description">{investment.description}</div>
                    )}
                    <div className="option-footer">
                      <div className="option-cost">${investment.cost.toLocaleString()}</div>
                      {investment.effectRadius && (
                        <div className="option-detail">
                          Coverage: {investment.effectRadius}m radius
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Detectives */}
        <div className="investment-category">
          <h4 className="category-title">
            <Search fontSize="small" /> Detectives
          </h4>
          <p className="category-description">
            Detectives solve cases and recover bikes/money (returned to budget). Better footage = higher solve & recovery rates!
          </p>
          {detectives.length > 0 && (
            <div className="active-detectives">
              {detectives.map(detective => {
                const avgSkill = Math.round((detective.investigation + detective.forensics + detective.interviewing + detective.surveillance + detective.intuition) / 6);
                return (
                  <div key={detective.id} className="detective-card">
                    <div className="detective-info">
                      <strong>{detective.name}</strong>
                      <span className="detective-skill">Avg: {avgSkill}/20</span>
                    </div>
                    <div className="detective-stats">
                      <span>Solved: {detective.solvedCases}</span>
                      <span>Salary: ${(detective.salary || 0).toLocaleString()}/turn</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <DetectiveMarketplace />
        </div>

        {/* Other Investments */}
        {otherInvestments.length > 0 && (
          <div className="investment-category">
            <h4 className="category-title">Street Improvements</h4>
            <p className="category-description">
              Apply to selected street in list or map view
            </p>
            <div className="investment-options">
              {otherInvestments.map(([type, investment]) => (
                <Button
                  key={type}
                  className={`investment-option ${selectedInvestment === type ? 'selected' : ''}`}
                  onClick={() => handleSelectInvestment(type)}
                  variant={selectedInvestment === type ? 'contained' : 'outlined'}
                  fullWidth
                  disabled={currentBudget < investment.cost}
                >
                  <div className="option-content">
                    <div className="option-header">
                      {getInvestmentIcon(investment.effect)}
                      <div className="option-name">{investment.name}</div>
                    </div>
                    {investment.description && (
                      <div className="option-description">{investment.description}</div>
                    )}
                    <div className="option-footer">
                      <div className="option-cost">${investment.cost.toLocaleString()}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentPanel;
