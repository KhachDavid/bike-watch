import React, { useState } from 'react';
import { Typography, Tabs, Tab } from '@mui/material';
import { ArrowUpward, ArrowDownward, Map } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { selectStreets, selectSelectedStreet, selectSelectedInvestment, selectCurrentTurn } from '../../store/selectors/game.selectors';
import { selectStreet } from '../../store/actions/game.actions';
import StreetsMap from './StreetsMap';
import './styles.scss';

const StreetsTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0); // Default to first tab (Map View)
  const [sortColumn, setSortColumn] = useState<string>('historicalRisk');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
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

  const handleSelectStreetFromList = (streetId: number) => {
    dispatch(selectStreet(streetId));
    // Switch to map view to show the selected street
    setActiveTab(0);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedStreets = [...streets].sort((a, b) => {
    let aVal: any = a[sortColumn as keyof typeof a];
    let bVal: any = b[sortColumn as keyof typeof b];
    
    // Handle numeric sorting
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    // Handle string sorting
    const aStr = String(aVal || '');
    const bStr = String(bVal || '');
    return sortDirection === 'asc' 
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

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
          <Tab label="Map View" className="view-tab" />
          <Tab label="List View" className="view-tab" />
        </Tabs>
      </div>
      
      <div className="card-content">
        {activeTab === 1 ? (
          <>
            <div style={{ 
              padding: 'var(--space-2)', 
              background: 'var(--primary-50)', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: 'var(--space-3)',
              fontSize: '0.875rem',
              color: 'var(--gray-700)'
            }}>
              💡 <strong>To deploy investments:</strong> Switch to <strong>Map View</strong> and use placement mode.
              <br/>
              🗺️ <strong>Click any row</strong> to view that neighborhood on the map.
            </div>
            <div className="streets-spreadsheet">
            <table className="spreadsheet-table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('name')}>
                    Neighborhood {sortColumn === 'name' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" style={{verticalAlign: 'middle'}} /> : <ArrowDownward fontSize="small" style={{verticalAlign: 'middle'}} />)}
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('bikesPerDay')}>
                    Bikes/Day {sortColumn === 'bikesPerDay' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" style={{verticalAlign: 'middle'}} /> : <ArrowDownward fontSize="small" style={{verticalAlign: 'middle'}} />)}
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('theftsLastMonth')}>
                    Last Month<br/><span style={{fontSize: '0.65rem', fontWeight: 'normal'}}>({currentMonth})</span> {sortColumn === 'theftsLastMonth' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" style={{verticalAlign: 'middle'}} /> : <ArrowDownward fontSize="small" style={{verticalAlign: 'middle'}} />)}
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('theftsPerMonth')}>
                    Avg/Mo<br/><span style={{fontSize: '0.65rem', fontWeight: 'normal'}}>(2023-24)</span> {sortColumn === 'theftsPerMonth' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" style={{verticalAlign: 'middle'}} /> : <ArrowDownward fontSize="small" style={{verticalAlign: 'middle'}} />)}
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('historicalRisk')}>
                    Historical Risk % {sortColumn === 'historicalRisk' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" style={{verticalAlign: 'middle'}} /> : <ArrowDownward fontSize="small" style={{verticalAlign: 'middle'}} />)}
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('lightingScore')}>
                    Lighting {sortColumn === 'lightingScore' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" style={{verticalAlign: 'middle'}} /> : <ArrowDownward fontSize="small" style={{verticalAlign: 'middle'}} />)}
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('footTraffic')}>
                    Traffic {sortColumn === 'footTraffic' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" style={{verticalAlign: 'middle'}} /> : <ArrowDownward fontSize="small" style={{verticalAlign: 'middle'}} />)}
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('investment')}>
                    Investment {sortColumn === 'investment' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" style={{verticalAlign: 'middle'}} /> : <ArrowDownward fontSize="small" style={{verticalAlign: 'middle'}} />)}
                  </th>
                  <th style={{ textAlign: 'center' }}>
                    <Map fontSize="small" style={{verticalAlign: 'middle'}} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedStreets.map((street) => {
                  const riskInfo = getRiskLevel(street.historicalRisk);
                  const isSelected = selectedStreet === street.id;
                  
                  return (
                    <tr
                      key={street.id}
                      className={`spreadsheet-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectStreetFromList(street.id)}
                      title="Click to view on map"
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="street-name-cell">{street.name}</td>
                      <td className="numeric-cell">{street.bikesPerDay.toLocaleString()}</td>
                      <td className="numeric-cell theft-count">{street.theftsLastMonth}</td>
                      <td className="numeric-cell">{street.theftsPerMonth}</td>
                      <td className="risk-cell">
                        <span className={`risk-value ${riskInfo.class}`}>
                          {street.historicalRisk.toFixed(1)}%
                        </span>
                      </td>
                      <td className="numeric-cell">{street.lightingScore}/10</td>
                      <td className="traffic-cell">{street.footTraffic}</td>
                      <td className="numeric-cell">${street.investment.toLocaleString()}</td>
                      <td className="action-cell view-on-map-cell">
                        <Map fontSize="small" className="view-on-map-icon" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        ) : (
          <StreetsMap 
            streets={streets}
            selectedStreet={selectedStreet}
            onSelectStreet={handleSelectStreet}
            selectedInvestment={selectedInvestment}
          />
        )}
      </div>
    </div>
  );
};

export default StreetsTable;