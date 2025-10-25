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
import { Close, Search, Refresh, CheckCircle, Cancel, Work, PersonOff, ArrowUpward, ArrowDownward } from '@mui/icons-material';
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
  const [sortColumn, setSortColumn] = useState<string>('desiredSalary');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const dispatch = useDispatch();
  const marketplace = useSelector((state: RootState) => state.game.detectiveMarketplace);
  const currentBudget = useSelector((state: RootState) => state.game.currentBudget);
  const hiredDetectives = useSelector((state: RootState) => state.game.detectives);
  const currentTurn = useSelector((state: RootState) => state.game.currentTurn);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredDetectives = marketplace.filter(d => {
    if (filter === 'available') return !d.employed;
    if (filter === 'employed') return d.employed;
    return true;
  }).sort((a, b) => {
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
    
    const detective = marketplace.find(d => d.id === selectedDetective);
    if (!detective) return;
    
    dispatch(makeOfferToDetective(selectedDetective, offerAmount));
    
    // Dispatch hire email
    setTimeout(() => {
      const hireEmail = {
        id: `detective-hire-${detective.id}-${currentTurn}`,
        from: detective.name,
        fromTitle: 'Detective',
        subject: `First Day - ${detective.name}`,
        body: getHireMessage(detective),
        timestamp: new Date(),
        read: false,
        priority: 'normal' as const
      };
      dispatch({ type: 'ADD_EMAIL', payload: hireEmail });
    }, 100);
    
    handleClose();
  };
  
  const getHireMessage = (detective: any) => {
    const intros: any = {
      professional: `Thank you for the opportunity to join your team. I'm looking forward to contributing my ${detective.experience} years of experience to reduce bike theft in San Francisco.\n\nBest regards,\n${detective.name}`,
      eager: `I'm SO excited to be part of this team! I've been wanting to work on a project like this for ages. Let's catch some thieves!\n\nCan't wait to get started!\n${detective.name}`,
      grumpy: `Alright, I'm in. Send me the case files. No need for lengthy introductions—I'd rather get to work.\n\n- ${detective.name}`,
      eccentric: `Fascinating opportunity! I can already sense the patterns in this city's bike theft ecosystem. The moon phase data could be very revealing...\n\nUntil next time,\n${detective.name}`,
      methodical: `I've reviewed the case backlog and developed a systematic approach to tackle it. Let's establish a clear workflow and get started.\n\nRegards,\n${detective.name}`,
      ambitious: `This is exactly the career opportunity I've been looking for. I plan to have the highest solve rate on the team.\n\nReady to excel,\n${detective.name}`
    };
    
    const message = intros[detective.personality] || intros.professional;
    const skillNote = detective.intuition > 13 && detective.experience > 8 
      ? `\n\nFYI: I can work cases even without camera footage. My experience and intuition usually fill in the gaps.\n\n`
      : detective.surveillance > 15
      ? `\n\nNote: I'm particularly skilled at analyzing camera footage. HD and AI cameras will help me solve cases faster.\n\n`
      : '\n\n';
    
    return `Hello,\n\n${message}${skillNote}`;
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
                  <TableCell 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('name')}
                  >
                    Name & Personality {sortColumn === 'name' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
                  </TableCell>
                  <TableCell 
                    align="center" 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('age')}
                  >
                    Age {sortColumn === 'age' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
                  </TableCell>
                  <TableCell 
                    align="center"
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('experience')}
                  >
                    Exp {sortColumn === 'experience' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
                  </TableCell>
                  <TableCell 
                    align="center"
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('investigation')}
                  >
                    Invest {sortColumn === 'investigation' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
                  </TableCell>
                  <TableCell 
                    align="center"
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('forensics')}
                  >
                    Forens {sortColumn === 'forensics' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
                  </TableCell>
                  <TableCell 
                    align="center"
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('interviewing')}
                  >
                    Interview {sortColumn === 'interviewing' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
                  </TableCell>
                  <TableCell 
                    align="center"
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('surveillance')}
                  >
                    Survey {sortColumn === 'surveillance' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
                  </TableCell>
                  <TableCell 
                    align="center"
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('intuition')}
                  >
                    Intuit {sortColumn === 'intuition' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
                  </TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell 
                    align="right"
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('desiredSalary')}
                  >
                    Desired Salary {sortColumn === 'desiredSalary' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
                  </TableCell>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
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
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px', textTransform: 'capitalize' }}>
                        {detective.personality}
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {detective.traits.slice(0, 2).map(trait => (
                          <Chip 
                            key={trait}
                            label={trait} 
                            size="small" 
                            style={{ fontSize: '0.65rem', height: '20px' }}
                          />
                        ))}
                      </div>
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
