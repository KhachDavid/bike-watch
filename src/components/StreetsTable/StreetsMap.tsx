import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { Button } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import './map-styles.scss';

interface Street {
  id: number;
  name: string;
  bikesPerDay: number;
  theftsPerMonth: number;
  lightingScore: number;
  footTraffic: string;
  investment: number;
  riskPercentage: number;
  latitude?: number;
  longitude?: number;
}

interface StreetsMapProps {
  streets: Street[];
  selectedStreet: number | null;
  onSelectStreet: (streetId: number) => void;
  onApplyInvestment: () => void;
  selectedInvestment: string | null;
}

const StreetsMap: React.FC<StreetsMapProps> = ({
  streets,
  selectedStreet,
  onSelectStreet,
  onApplyInvestment,
  selectedInvestment
}) => {
  // San Francisco coordinates - we'll use real SF data
  const center: [number, number] = [37.7749, -122.4194];

  // Assign realistic SF coordinates to streets (placeholder - will use real data)
  const streetsWithCoords = streets.map((street, index) => ({
    ...street,
    latitude: street.latitude || 37.7749 + (Math.random() - 0.5) * 0.1,
    longitude: street.longitude || -122.4194 + (Math.random() - 0.5) * 0.1
  }));

  const getRiskColor = (risk: number) => {
    if (risk < 30) return '#10b981'; // Green
    if (risk < 60) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getRiskLevel = (risk: number) => {
    if (risk < 30) return 'Low';
    if (risk < 60) return 'Medium';
    return 'High';
  };

  return (
    <div className="streets-map-container">
      <MapContainer
        center={center}
        zoom={13}
        className="streets-map"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {streetsWithCoords.map((street) => (
          <CircleMarker
            key={street.id}
            center={[street.latitude!, street.longitude!]}
            radius={selectedStreet === street.id ? 12 : 8}
            fillColor={getRiskColor(street.riskPercentage)}
            color={selectedStreet === street.id ? '#1f2937' : '#ffffff'}
            weight={selectedStreet === street.id ? 3 : 2}
            opacity={1}
            fillOpacity={0.8}
            eventHandlers={{
              click: () => onSelectStreet(street.id)
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              <div className="map-tooltip">
                <strong>{street.name}</strong>
                <div className="tooltip-risk">
                  Risk: {street.riskPercentage}% ({getRiskLevel(street.riskPercentage)})
                </div>
              </div>
            </Tooltip>
            
            <Popup>
              <div className="map-popup">
                <h3 className="popup-title">{street.name}</h3>
                
                <div className="popup-stats">
                  <div className="popup-stat">
                    <span className="stat-label">Risk Level</span>
                    <span className={`stat-value risk-${getRiskLevel(street.riskPercentage).toLowerCase()}`}>
                      {street.riskPercentage}% - {getRiskLevel(street.riskPercentage)}
                    </span>
                  </div>
                  
                  <div className="popup-stat">
                    <span className="stat-label">Bikes/Day</span>
                    <span className="stat-value">{street.bikesPerDay.toLocaleString()}</span>
                  </div>
                  
                  <div className="popup-stat">
                    <span className="stat-label">Thefts/Month</span>
                    <span className="stat-value">{street.theftsPerMonth}</span>
                  </div>
                  
                  <div className="popup-stat">
                    <span className="stat-label">Lighting Score</span>
                    <span className="stat-value">{street.lightingScore}/10</span>
                  </div>
                  
                  <div className="popup-stat">
                    <span className="stat-label">Investment</span>
                    <span className="stat-value">${street.investment.toLocaleString()}</span>
                  </div>
                </div>
                
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  disabled={!selectedInvestment}
                  onClick={(e) => {
                    e.stopPropagation();
                    onApplyInvestment();
                  }}
                  className="popup-apply-button"
                >
                  {selectedInvestment ? 'Apply Investment' : 'Select Investment First'}
                </Button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      
      <div className="map-legend">
        <h4 className="legend-title">Risk Levels</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#10b981' }}></div>
            <span>Low (&lt;30%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#f59e0b' }}></div>
            <span>Medium (30-60%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#ef4444' }}></div>
            <span>High (&gt;60%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreetsMap;
