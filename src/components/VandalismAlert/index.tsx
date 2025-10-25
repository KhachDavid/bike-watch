import React from 'react';
import { Alert, AlertTitle, IconButton, Collapse, Button, Box } from '@mui/material';
import { Close, Build, Delete } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { dismissVandalismAlert, repairInvestment, removeDamagedInvestment } from '../../store/actions/game.actions';
import { RootState } from '../../types';
import './styles.scss';

const VandalismAlert: React.FC = () => {
  const dispatch = useDispatch();
  const vandalismAlert = useSelector((state: RootState) => state.game.vandalismAlert);
  const damagedInvestments = useSelector((state: RootState) => 
    state.game.placedInvestments.filter(inv => inv.damaged)
  );
  const currentBudget = useSelector((state: RootState) => state.game.currentBudget);

  if (!vandalismAlert || damagedInvestments.length === 0) return null;

  const handleClose = () => {
    dispatch(dismissVandalismAlert());
  };

  const handleRepair = (id: string) => {
    dispatch(repairInvestment(id));
  };

  const handleRemove = (id: string) => {
    if (window.confirm('Remove this damaged item? It will be permanently deleted.')) {
      dispatch(removeDamagedInvestment(id));
    }
  };

  return (
    <Collapse in={!!vandalismAlert}>
      <div className="vandalism-alert-container">
        <Alert
          severity="error"
          className="vandalism-alert"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
        >
          <AlertTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>
            🔨 VANDALISM ALERT - {damagedInvestments.length} Asset{damagedInvestments.length > 1 ? 's' : ''} Damaged!
          </AlertTitle>
          <div style={{ marginBottom: '12px', fontSize: '0.875rem' }}>
            Choose to <strong>repair</strong> (costs money, keeps coverage) or <strong>remove</strong> (free, lose coverage).
          </div>
          {damagedInvestments.map((inv) => {
            const investmentType = inv.type.includes('camera') ? (inv.quality?.toUpperCase() || 'STANDARD') + ' Camera' :
                                 inv.type.includes('lighting') ? 'Street Lighting' :
                                 inv.type.includes('parking') ? 'Secure Parking' :
                                 inv.type.includes('programs') ? 'Community Center' : 'Asset';
            const canAfford = currentBudget >= (inv.repairCost || 0);
            
            return (
              <Box key={inv.id} className="damaged-item">
                <div className="damaged-item-info">
                  <strong>❌ {investmentType}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#666' }}>
                    Repair: ${(inv.repairCost || 0).toLocaleString()}
                  </span>
                </div>
                <div className="damaged-item-actions">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Build />}
                    onClick={() => handleRepair(inv.id)}
                    disabled={!canAfford}
                    className="repair-button"
                  >
                    Repair
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Delete />}
                    onClick={() => handleRemove(inv.id)}
                    className="remove-button"
                    color="error"
                  >
                    Remove
                  </Button>
                </div>
              </Box>
            );
          })}
          <div style={{ marginTop: '12px', fontSize: '0.75rem', fontStyle: 'italic', color: '#666' }}>
            Damaged items don't provide coverage until repaired. Check your email for details.
          </div>
        </Alert>
      </div>
    </Collapse>
  );
};

export default VandalismAlert;
