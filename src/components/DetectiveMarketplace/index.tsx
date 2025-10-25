import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Chip,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { Close, Search, Refresh, CheckCircle, Cancel, Work, PersonOff } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { makeOfferToDetective, refreshMarketplace } from '../../store/actions/game.actions';
import { RootState } from '../../types';
import { getDetectiveReport, willAcceptOffer, canSolveWithoutFootage } from '../../services/detectiveMarketplace';
import './styles.scss';

const DetectiveMarketplace: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedDetective, setSelectedDetective] = useState<string | null>(null);
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [filter, setFilter] = useState<'all' | 'available' | 'employed'>('all');
  
  const dispatch = useDispatch();
  const marketplace = useSelector((state: RootState) => state.game.detectiveMarketplace);
  const currentBudget = useSelector((state: RootState) => state.game.currentBudget);
  const hiredDetectives = useSelector((state: RootState) => state.game.detectives);

  const filteredDetectives = marketplace.filter(d => {
    if (filter === 'available') return !d.employed;
    if (filter === 'employed') return d.employed;
    return true;
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedDetective(null);
    setOfferAmount(0);
  };

  const handleSelectDetective = (detectiveId: string) => {
    const detective = marketplace.find(d => d.id === detectiveId);
    if (detective) {
      setSelectedDetective(detectiveId);
      setOfferAmount(detective.desiredSalary);
    }
  };

  const handleMakeOffer = () => {
    if (!selectedDetective) return;
    
    dispatch(makeOfferToDetective(selectedDetective, offerAmount));
    handleClose();
  };

  const handleRefresh = () => {
    dispatch(refreshMarketplace());
  };

  const getAttributeColor = (value: number) => {
    if (value >= 15) return '#10b981'; // Green
    if (value >= 10) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const calculateAcceptanceProbability = (detective: any, offer: number) => {
    const result = willAcceptOffer(detective, offer, 50);
    if (result.accepted) return 100;
    
    if (offer < detective.minimumSalary) return 0;
    
    // Estimate based on offer quality
    const offerQuality = offer / detective.desiredSalary;
    if (!detective.employed) {
      return Math.min(95, Math.round(offerQuality * 100));
    } else {
      const requiredQuality = 1.2;
      if (offerQuality < requiredQuality) return 5;
      return Math.min(85, Math.round(((offerQuality - requiredQuality) / 0.3) * 80 + 15));
    }
  };

  const selectedDetectiveData = marketplace.find(d => d.id === selectedDetective);

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Search />}
        onClick={handleOpen}
        className="marketplace-trigger"
      >
        Detective Marketplace ({marketplace.length})
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth className="detective-marketplace">
        <DialogTitle className="marketplace-title">
          <div className="title-content">
            <Search /> Detective Marketplace
            <Chip label={`${hiredDetectives.length} Hired`} color="primary" size="small" />
          </div>
          <div className="title-actions">
            <Tooltip title="Refresh marketplace (new detectives)">
              <IconButton onClick={handleRefresh} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </div>
        </DialogTitle>

        <DialogContent className="marketplace-content">
          <div className="marketplace-filters">
            <Button
              variant={filter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setFilter('all')}
              size="small"
            >
              All ({marketplace.length})
            </Button>
            <Button
              variant={filter === 'available' ? 'contained' : 'outlined'}
              onClick={() => setFilter('available')}
              size="small"
              startIcon={<PersonOff />}
            >
              Available ({marketplace.filter(d => !d.employed).length})
            </Button>
            <Button
              variant={filter === 'employed' ? 'contained' : 'outlined'}
              onClick={() => setFilter('employed')}
              size="small"
              startIcon={<Work />}
            >
              Employed ({marketplace.filter(d => d.employed).length})
            </Button>
          </div>

          <TableContainer component={Paper} className="detective-table">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="center">Age</TableCell>
                  <TableCell align="center">Exp</TableCell>
                  <TableCell align="center">Invest</TableCell>
                  <TableCell align="center">Forens</TableCell>
                  <TableCell align="center">Interview</TableCell>
                  <TableCell align="center">Survey</TableCell>
                  <TableCell align="center">Intuit</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Desired Salary</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDetectives.map((detective) => (
                  <TableRow
                    key={detective.id}
                    hover
                    selected={selectedDetective === detective.id}
                    onClick={() => handleSelectDetective(detective.id)}
                    className={`detective-row ${!canSolveWithoutFootage(detective) ? 'requires-footage' : ''}`}
                  >
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong>{detective.name}</strong>
                        {!canSolveWithoutFootage(detective) && (
                          <Tooltip title="Requires camera footage to solve cases">
                            <Chip 
                              label="📹 Required" 
                              size="small" 
                              color="warning"
                              style={{ fontSize: '0.7rem' }}
                            />
                          </Tooltip>
                        )}
                      </div>
                      <div className="detective-traits">{getDetectiveReport(detective)}</div>
                    </TableCell>
                    <TableCell align="center">{detective.age}</TableCell>
                    <TableCell align="center">{detective.experience}y</TableCell>
                    <TableCell align="center">
                      <span style={{ color: getAttributeColor(detective.investigation) }}>
                        {detective.investigation}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span style={{ color: getAttributeColor(detective.forensics) }}>
                        {detective.forensics}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span style={{ color: getAttributeColor(detective.interviewing) }}>
                        {detective.interviewing}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span style={{ color: getAttributeColor(detective.surveillance) }}>
                        {detective.surveillance}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span style={{ color: getAttributeColor(detective.intuition) }}>
                        {detective.intuition}
                      </span>
                    </TableCell>
                    <TableCell>
                      {detective.employed ? (
                        <Chip label={detective.currentEmployer} size="small" color="warning" />
                      ) : (
                        <Chip label="Available" size="small" color="success" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <strong>${detective.desiredSalary.toLocaleString()}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        Min: ${detective.minimumSalary.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDetective(detective.id);
                        }}
                      >
                        Make Offer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {selectedDetectiveData && (
            <Paper className="offer-panel">
              <Typography variant="h6" gutterBottom>
                Make Offer to {selectedDetectiveData.name}
              </Typography>
              
              <div className="offer-details">
                <div className="detail-row">
                  <span>Current Status:</span>
                  <strong>
                    {selectedDetectiveData.employed 
                      ? `Employed at ${selectedDetectiveData.currentEmployer}`
                      : 'Available'}
                  </strong>
                </div>
                <div className="detail-row">
                  <span>Desired Salary:</span>
                  <strong>${selectedDetectiveData.desiredSalary.toLocaleString()}/turn</strong>
                </div>
                <div className="detail-row">
                  <span>Minimum Salary:</span>
                  <strong>${selectedDetectiveData.minimumSalary.toLocaleString()}/turn</strong>
                </div>
                <div className="detail-row">
                  <span>Loyalty:</span>
                  <LinearProgress 
                    variant="determinate" 
                    value={selectedDetectiveData.loyalty} 
                    sx={{ flex: 1, ml: 2 }}
                  />
                  <span>{selectedDetectiveData.loyalty}/100</span>
                </div>
              </div>

              <div className="offer-input">
                <TextField
                  label="Salary Offer (per turn)"
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(Number(e.target.value))}
                  fullWidth
                  InputProps={{
                    startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                  }}
                />
                
                <div className="acceptance-indicator">
                  {offerAmount < selectedDetectiveData.minimumSalary ? (
                    <Chip 
                      icon={<Cancel />}
                      label="Below Minimum - Will Reject"
                      color="error"
                      size="small"
                    />
                  ) : (
                    <>
                      <Chip 
                        icon={<CheckCircle />}
                        label={`~${calculateAcceptanceProbability(selectedDetectiveData, offerAmount)}% Acceptance`}
                        color={calculateAcceptanceProbability(selectedDetectiveData, offerAmount) > 70 ? 'success' : 'warning'}
                        size="small"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="offer-actions">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleMakeOffer}
                  disabled={offerAmount < selectedDetectiveData.minimumSalary || currentBudget < offerAmount}
                >
                  Make Offer (${offerAmount.toLocaleString()})
                </Button>
                <Button onClick={() => setSelectedDetective(null)}>
                  Cancel
                </Button>
                {currentBudget < offerAmount && (
                  <Typography variant="caption" color="error">
                    Insufficient budget
                  </Typography>
                )}
              </div>
            </Paper>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DetectiveMarketplace;
