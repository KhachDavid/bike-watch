import React, { useState } from 'react';
import { Typography, Button, Tabs, Tab } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectStreets, selectSelectedStreet, selectSelectedInvestment, selectCurrentTurn } from '../../store/selectors/game.selectors';
import { selectStreet, applyInvestment } from '../../store/actions/game.actions';
import StreetsMap from './StreetsMap';
import './styles.scss';

const StreetsTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const streets = useSelector(selectStreets);
  const selectedStreet = useSelector(selectSelectedStreet);
  const selectedInvestment = useSelector(selectSelectedInvestment);
  const currentTurn = useSelector(selectCurrentTurn);
  const dispatch = useDispatch();
  
  // Calculate current game date
  const gameStartDate = new Date(2025, 0, 1); // January 2025
  const currentGameDate = new Date(gameStartDate);
  currentGameDate.setMonth(currentGameDate.getMonth() + currentTurn - 1);
  const currentMonth = currentGameDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const handleSelectStreet = (streetId: number) => {
    dispatch(selectStreet(streetId));
  };

  const handleApplyInvestment = () => {
    dispatch(applyInvestment());
  };

  const getRiskLevel = (risk: number) => {
    // Risk ranges: 2-10% (meaningful gameplay)
    if (risk < 4) return { level: 'Low', class: 'risk-low' };         // < 4%
    if (risk < 7) return { level: 'Medium', class: 'risk-medium' };   // 4% - 7%
    return { level: 'High', class: 'risk-high' };                     // > 7%
  };

  return (
    <div className="card streets-table">
      <div className="card-header">
        <div className="header-left">
          <Typography variant="h6" className="card-title">
            Streets Overview - Historical Data
          </Typography>
          <Typography variant="caption" className="data-context">
            📊 Based on 560 real SFPD incidents (2023-2024) • Scaled 100-150× for intense gameplay
          </Typography>
        </div>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          className="view-tabs"
        >
          <Tab label="List View" className="view-tab" />
          <Tab label="Map View" className="view-tab" />
        </Tabs>
      </div>
      
      <div className="card-content">
        {activeTab === 0 ? (
          <div className="streets-spreadsheet">
            <table className="spreadsheet-table">
              <thead>
                <tr>
                  <th>Neighborhood</th>
                  <th>Bikes/Day</th>
                  <th>Last Month<br/><span style={{fontSize: '0.65rem', fontWeight: 'normal'}}>({currentMonth})</span></th>
                  <th>Avg/Mo<br/><span style={{fontSize: '0.65rem', fontWeight: 'normal'}}>(2023-24)</span></th>
                  <th>Historical Risk %</th>
                  <th>Lighting</th>
                  <th>Traffic</th>
                  <th>Investment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {streets.map((street) => {
                  const riskInfo = getRiskLevel(street.historicalRisk);
                  const isSelected = selectedStreet === street.id;
                  
                  return (
                    <tr
                      key={street.id}
                      className={`spreadsheet-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectStreet(street.id)}
                    >
                      <td className="street-name-cell">{street.name}</td>
                      <td className="numeric-cell">{street.bikesPerDay.toLocaleString()}</td>
                      <td className="numeric-cell theft-count">{street.theftsLastMonth}</td>
                      <td className="numeric-cell">{street.theftsPerMonth}</td>
                      <td className="risk-cell">
                        <span className={`risk-value ${riskInfo.class}`}>
                          {street.historicalRisk}%
                        </span>
                      </td>
                      <td className="numeric-cell">{street.lightingScore}/10</td>
                      <td className="traffic-cell">{street.footTraffic}</td>
                      <td className="numeric-cell">${street.investment.toLocaleString()}</td>
                      <td className="action-cell">
                        <Button
                          variant="contained"
                          size="small"
                          disabled={!selectedInvestment}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyInvestment();
                          }}
                          className="apply-button"
                        >
                          Apply
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <StreetsMap 
            streets={streets}
            selectedStreet={selectedStreet}
            onSelectStreet={handleSelectStreet}
            onApplyInvestment={handleApplyInvestment}
            selectedInvestment={selectedInvestment}
          />
        )}
      </div>
    </div>
  );
};

export default StreetsTable;