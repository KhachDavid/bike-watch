import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, Circle, Marker, useMapEvents } from 'react-leaflet';
import { Button, IconButton, Chip, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Videocam, Close, Lightbulb, Lock, Group, LocalPolice, Layers } from '@mui/icons-material';
import L from 'leaflet';
import { placeInvestment, placeCamera, removeCamera, removeInvestment, toggleCameraMode } from '../../store/actions/game.actions';
import { RootState, Camera, PlacedInvestment } from '../../types';
import 'leaflet/dist/leaflet.css';
import './map-styles.scss';

interface Street {
  id: number;
  name: string;
  bikesPerDay: number;
  theftsPerMonth: number;
  theftsLastMonth: number;
  lightingScore: number;
  footTraffic: string;
  investment: number;
  riskPercentage: number;
  historicalRisk: number;
  latitude?: number;
  longitude?: number;
  cameras?: Camera[];
  cameraCount?: number;
  surveillanceScore?: number;
}

interface StreetsMapProps {
  streets: Street[];
  selectedStreet: number | null;
  onSelectStreet: (streetId: number) => void;
  onApplyInvestment: () => void;
  selectedInvestment: string | null;
}

// Investment type icons
const createIcon = (svg: string, color: string) => new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(svg.replace('%COLOR%', color)),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const cameraIcon = createIcon(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%COLOR%" width="32" height="32">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
  </svg>
`, '#ef4444');

const lightingIcon = createIcon(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%COLOR%" width="32" height="32">
    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
  </svg>
`, '#f59e0b');

const parkingIcon = createIcon(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%COLOR%" width="32" height="32">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
  </svg>
`, '#8b5cf6');

const communityIcon = createIcon(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%COLOR%" width="32" height="32">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
`, '#10b981');

const patrolIcon = createIcon(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%COLOR%" width="32" height="32">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
  </svg>
`, '#3b82f6');

// Camera placement handler component
const CameraPlacementHandler: React.FC<{ 
  placementMode: boolean;
  onPlaceCamera: (lat: number, lng: number) => void;
}> = ({ placementMode, onPlaceCamera }) => {
  useMapEvents({
    click: (e) => {
      if (placementMode) {
        onPlaceCamera(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const StreetsMap: React.FC<StreetsMapProps> = ({
  streets,
  selectedStreet,
  onSelectStreet,
  onApplyInvestment,
  selectedInvestment
}) => {
  const dispatch = useDispatch();
  const cameras = useSelector((state: RootState) => state.game.cameras);
  const placedInvestments = useSelector((state: RootState) => state.game.placedInvestments);
  const placementMode = useSelector((state: RootState) => state.game.placementMode);
  const investmentTypes = useSelector((state: RootState) => state.game.investmentTypes);
  const currentBudget = useSelector((state: RootState) => state.game.currentBudget);
  
  // Layer visibility state
  const [visibleLayers, setVisibleLayers] = useState<string[]>(['camera', 'lighting', 'security', 'community', 'enforcement']);

  // San Francisco coordinates
  const center: [number, number] = [37.7749, -122.4194];

  const streetsWithCoords = streets.map((street, index) => ({
    ...street,
    latitude: street.latitude || 37.7749 + (Math.random() - 0.5) * 0.1,
    longitude: street.longitude || -122.4194 + (Math.random() - 0.5) * 0.1
  }));

  const getRiskColor = (risk: number) => {
    if (risk < 4) return '#10b981'; // Green
    if (risk < 7) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getRiskLevel = (risk: number) => {
    if (risk < 4) return 'Low';
    if (risk < 7) return 'Medium';
    return 'High';
  };

  const getCameraColor = (quality: string) => {
    switch (quality) {
      case 'ai-enabled': return '#8b5cf6'; // Purple
      case 'hd': return '#3b82f6'; // Blue
      default: return '#6b7280'; // Gray
    }
  };

  const handlePlaceCamera = (lat: number, lng: number) => {
    if (!selectedInvestment) {
      alert('Please select an investment type first!');
      return;
    }

    const investment = investmentTypes[selectedInvestment];
    if (!investment?.canBePlaced) {
      alert('This investment cannot be placed on the map!');
      return;
    }

    if (currentBudget < investment.cost) {
      alert('Not enough budget!');
      return;
    }

    dispatch(placeInvestment(lat, lng));
  };

  const handleRemoveCamera = (cameraId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Remove this camera?')) {
      dispatch(removeCamera(cameraId));
    }
  };

  const handleRemoveInvestment = (investmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Remove this investment?')) {
      dispatch(removeInvestment(investmentId));
    }
  };

  const handleTogglePlacementMode = () => {
    if (!placementMode && !selectedInvestment) {
      alert('Please select an investment type first!');
      return;
    }
    dispatch(toggleCameraMode());
  };

  const handleLayerToggle = (_event: React.MouseEvent<HTMLElement>, newLayers: string[]) => {
    setVisibleLayers(newLayers);
  };

  const getInvestmentIcon = (type: string) => {
    if (type.includes('camera')) return cameraIcon;
    if (type.includes('lighting')) return lightingIcon;
    if (type.includes('parking')) return parkingIcon;
    if (type.includes('programs')) return communityIcon;
    if (type.includes('patrols')) return patrolIcon;
    return cameraIcon;
  };

  const getInvestmentColor = (type: string) => {
    if (type.includes('camera')) return '#ef4444';
    if (type.includes('lighting')) return '#f59e0b';
    if (type.includes('parking')) return '#8b5cf6';
    if (type.includes('programs')) return '#10b981';
    if (type.includes('patrols')) return '#3b82f6';
    return '#6b7280';
  };

  const getInvestmentLabel = (type: string) => {
    const investment = investmentTypes[type];
    return investment?.name || type;
  };

  return (
    <div className="streets-map-container">
      {/* Placement Mode Toggle */}
      {selectedInvestment && investmentTypes[selectedInvestment]?.canBePlaced && (
        <div className="camera-mode-controls">
          <Button
            variant={placementMode ? "contained" : "outlined"}
            onClick={handleTogglePlacementMode}
            className={`camera-mode-button ${placementMode ? 'active' : ''}`}
          >
            {placementMode ? `Click map to place ${investmentTypes[selectedInvestment]?.name}` : `Enable Placement Mode`}
          </Button>
          {placementMode && (
            <Chip 
              label={`${investmentTypes[selectedInvestment]?.name} - $${investmentTypes[selectedInvestment]?.cost.toLocaleString()}`}
              color="primary"
              size="small"
            />
          )}
        </div>
      )}

      {/* Layer Controls */}
      <div className="map-layer-controls">
        <Chip icon={<Layers />} label="Layers" size="small" className="layers-label" />
        <ToggleButtonGroup
          value={visibleLayers}
          onChange={handleLayerToggle}
          aria-label="map layers"
          size="small"
          className="layer-toggles"
        >
          <ToggleButton value="camera" aria-label="cameras">
            <Videocam fontSize="small" />
            <span>Cameras ({cameras.length})</span>
          </ToggleButton>
          <ToggleButton value="lighting" aria-label="lighting">
            <Lightbulb fontSize="small" />
            <span>Lights ({placedInvestments.filter(i => i.type.includes('lighting')).length})</span>
          </ToggleButton>
          <ToggleButton value="security" aria-label="parking">
            <Lock fontSize="small" />
            <span>Parking ({placedInvestments.filter(i => i.type.includes('parking')).length})</span>
          </ToggleButton>
          <ToggleButton value="community" aria-label="community">
            <Group fontSize="small" />
            <span>Community ({placedInvestments.filter(i => i.type.includes('programs')).length})</span>
          </ToggleButton>
          <ToggleButton value="enforcement" aria-label="patrols">
            <LocalPolice fontSize="small" />
            <span>Patrols ({placedInvestments.filter(i => i.type.includes('patrols')).length})</span>
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      <MapContainer
        center={center}
        zoom={13}
        className="streets-map"
        scrollWheelZoom={true}
      >
        {/* Clean CartoDB Positron tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Camera placement handler */}
        <CameraPlacementHandler 
          placementMode={placementMode}
          onPlaceCamera={handlePlaceCamera}
        />

        {/* All Placed Investments with coverage areas */}
        {placedInvestments.map((investment) => {
          // Determine if this layer should be visible
          let layerType = 'camera';
          if (investment.type.includes('lighting')) layerType = 'lighting';
          else if (investment.type.includes('parking')) layerType = 'security';
          else if (investment.type.includes('programs')) layerType = 'community';
          else if (investment.type.includes('patrols')) layerType = 'enforcement';
          
          if (!visibleLayers.includes(layerType)) return null;

          return (
            <React.Fragment key={investment.id}>
              {/* Coverage circle */}
              <Circle
                center={[investment.latitude, investment.longitude]}
                radius={investment.effectRadius}
                pathOptions={{
                  fillColor: getInvestmentColor(investment.type),
                  fillOpacity: 0.1,
                  color: getInvestmentColor(investment.type),
                  weight: 2,
                  opacity: 0.6,
                  dashArray: '5, 5'
                }}
              />
              
              {/* Investment marker */}
              <Marker
                position={[investment.latitude, investment.longitude]}
                icon={getInvestmentIcon(investment.type)}
              >
                <Popup>
                  <div className="camera-popup">
                    <div className="camera-popup-header">
                      <span style={{ color: getInvestmentColor(investment.type) }}>
                        {getInvestmentLabel(investment.type)}
                      </span>
                      <IconButton
                        size="small"
                        onClick={(e) => handleRemoveInvestment(investment.id, e)}
                        className="remove-camera-btn"
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </div>
                    <div className="camera-popup-details">
                      <div className="detail-row">
                        <span>Coverage:</span>
                        <strong>{investment.effectRadius}m radius</strong>
                      </div>
                      <div className="detail-row">
                        <span>Installed:</span>
                        <strong>Turn {investment.placedAt}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Cost:</span>
                        <strong>${investment.cost.toLocaleString()}</strong>
                      </div>
                      {investment.quality && (
                        <div className="detail-row">
                          <span>Quality:</span>
                          <strong>{investment.quality.toUpperCase()}</strong>
                        </div>
                      )}
                      {investment.lightingLevel && (
                        <div className="detail-row">
                          <span>Lighting Level:</span>
                          <strong>{investment.lightingLevel}/10</strong>
                        </div>
                      )}
                      {investment.patrolFrequency && (
                        <div className="detail-row">
                          <span>Patrol Frequency:</span>
                          <strong>{investment.patrolFrequency}</strong>
                        </div>
                      )}
                      {investment.capacity && (
                        <div className="detail-row">
                          <span>Capacity:</span>
                          <strong>{investment.capacity} bikes</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
        
        {/* Street markers */}
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
              click: () => !placementMode && onSelectStreet(street.id)
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              <div className="map-tooltip">
                <strong>{street.name}</strong>
                <div className="tooltip-risk">
                  Risk: {street.riskPercentage.toFixed(1)}% ({getRiskLevel(street.riskPercentage)})
                </div>
                {(street.cameraCount || 0) > 0 && (
                  <div className="tooltip-cameras">
                    <Videocam fontSize="small" /> {street.cameraCount} camera{street.cameraCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </Tooltip>
            
            <Popup>
              <div className="map-popup">
                <h3 className="popup-title">{street.name}</h3>
                
                <div className="popup-stats">
                  <div className="popup-stat">
                    <span className="stat-label">Risk Level</span>
                    <span className={`stat-value risk-${getRiskLevel(street.riskPercentage).toLowerCase()}`}>
                      {street.riskPercentage.toFixed(1)}% - {getRiskLevel(street.riskPercentage)}
                    </span>
                  </div>
                  
                  <div className="popup-stat">
                    <span className="stat-label">Bikes/Day</span>
                    <span className="stat-value">{street.bikesPerDay.toLocaleString()}</span>
                  </div>
                  
                  <div className="popup-stat">
                    <span className="stat-label">Last Month Thefts</span>
                    <span className="stat-value">{street.theftsLastMonth}</span>
                  </div>
                  
                  <div className="popup-stat">
                    <span className="stat-label">Surveillance Score</span>
                    <span className="stat-value">{street.surveillanceScore || 0}/10</span>
                  </div>
                  
                  <div className="popup-stat">
                    <span className="stat-label">Cameras</span>
                    <span className="stat-value">
                      <Videocam fontSize="small" /> {street.cameraCount || 0}
                    </span>
                  </div>
                  
                  <div className="popup-stat">
                    <span className="stat-label">Investment</span>
                    <span className="stat-value">${street.investment.toLocaleString()}</span>
                  </div>
                </div>
                
                {!placementMode && (
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    disabled={!selectedInvestment || investmentTypes[selectedInvestment]?.canBePlaced}
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplyInvestment();
                    }}
                    className="popup-apply-button"
                  >
                    {selectedInvestment ? 'Apply Investment' : 'Select Investment First'}
                  </Button>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      
      <div className="map-legend">
        <h4 className="legend-title">Map Legend</h4>
        <div className="legend-section">
          <strong>Risk Levels</strong>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#10b981' }}></div>
              <span>Low (&lt;4%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#f59e0b' }}></div>
              <span>Medium (4-7%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#ef4444' }}></div>
              <span>High (&gt;7%)</span>
            </div>
          </div>
        </div>
        
        {cameras.length > 0 && (
          <div className="legend-section">
            <strong>Camera Types</strong>
            <div className="legend-items">
              <div className="legend-item">
                <Videocam style={{ color: '#6b7280', fontSize: '16px' }} />
                <span>Standard (50m)</span>
              </div>
              <div className="legend-item">
                <Videocam style={{ color: '#3b82f6', fontSize: '16px' }} />
                <span>HD (75m)</span>
              </div>
              <div className="legend-item">
                <Videocam style={{ color: '#8b5cf6', fontSize: '16px' }} />
                <span>AI (100m)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreetsMap;
