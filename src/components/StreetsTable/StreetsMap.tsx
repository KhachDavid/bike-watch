import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, Circle, Marker, useMapEvents } from 'react-leaflet';
import { Button, IconButton, Chip } from '@mui/material';
import { Videocam, Close } from '@mui/icons-material';
import L from 'leaflet';
import { placeCamera, removeCamera, toggleCameraMode } from '../../store/actions/game.actions';
import { RootState, Camera } from '../../types';
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

// Camera icon
const cameraIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444" width="32" height="32">
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Camera placement handler component
const CameraPlacementHandler: React.FC<{ 
  cameraMode: boolean;
  onPlaceCamera: (lat: number, lng: number) => void;
}> = ({ cameraMode, onPlaceCamera }) => {
  useMapEvents({
    click: (e) => {
      if (cameraMode) {
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
  const cameraMode = useSelector((state: RootState) => state.game.cameraMode);
  const investmentTypes = useSelector((state: RootState) => state.game.investmentTypes);
  const currentBudget = useSelector((state: RootState) => state.game.currentBudget);

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
      alert('Please select a camera type first!');
      return;
    }

    const investment = investmentTypes[selectedInvestment];
    if (!investment?.cameraQuality) {
      alert('Please select a camera type!');
      return;
    }

    if (currentBudget < investment.cost) {
      alert('Not enough budget!');
      return;
    }

    dispatch(placeCamera(lat, lng));
  };

  const handleRemoveCamera = (cameraId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Remove this camera?')) {
      dispatch(removeCamera(cameraId));
    }
  };

  const handleToggleCameraMode = () => {
    if (!cameraMode && !selectedInvestment) {
      alert('Please select a camera type first!');
      return;
    }
    dispatch(toggleCameraMode());
  };

  return (
    <div className="streets-map-container">
      {/* Camera Mode Toggle */}
      {selectedInvestment && investmentTypes[selectedInvestment]?.cameraQuality && (
        <div className="camera-mode-controls">
          <Button
            variant={cameraMode ? "contained" : "outlined"}
            startIcon={<Videocam />}
            onClick={handleToggleCameraMode}
            className={`camera-mode-button ${cameraMode ? 'active' : ''}`}
          >
            {cameraMode ? 'Click map to place camera' : 'Enable Camera Placement'}
          </Button>
          {cameraMode && (
            <Chip 
              label={`${investmentTypes[selectedInvestment]?.name} - $${investmentTypes[selectedInvestment]?.cost.toLocaleString()}`}
              color="primary"
              size="small"
            />
          )}
        </div>
      )}

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
          cameraMode={cameraMode}
          onPlaceCamera={handlePlaceCamera}
        />

        {/* Cameras and their coverage areas */}
        {cameras.map((camera) => (
          <React.Fragment key={camera.id}>
            {/* Coverage circle */}
            <Circle
              center={[camera.latitude, camera.longitude]}
              radius={camera.coverageRadius}
              pathOptions={{
                fillColor: getCameraColor(camera.quality),
                fillOpacity: 0.1,
                color: getCameraColor(camera.quality),
                weight: 2,
                opacity: 0.6,
                dashArray: '5, 5'
              }}
            />
            
            {/* Camera marker */}
            <Marker
              position={[camera.latitude, camera.longitude]}
              icon={cameraIcon}
            >
              <Popup>
                <div className="camera-popup">
                  <div className="camera-popup-header">
                    <Videocam style={{ color: getCameraColor(camera.quality) }} />
                    <h4>{camera.quality.toUpperCase()} Camera</h4>
                    <IconButton
                      size="small"
                      onClick={(e) => handleRemoveCamera(camera.id, e)}
                      className="remove-camera-btn"
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </div>
                  <div className="camera-popup-details">
                    <div className="detail-row">
                      <span>Coverage:</span>
                      <strong>{camera.coverageRadius}m radius</strong>
                    </div>
                    <div className="detail-row">
                      <span>Installed:</span>
                      <strong>Turn {camera.placedAt}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Cost:</span>
                      <strong>${camera.cost.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
        
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
              click: () => !cameraMode && onSelectStreet(street.id)
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
                
                {!cameraMode && (
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    disabled={!selectedInvestment || investmentTypes[selectedInvestment]?.effect === 'camera'}
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
