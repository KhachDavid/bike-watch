import React from 'react';
import { Typography, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectInvestmentTypes, selectSelectedInvestment } from '../../store/selectors/game.selectors';
import { selectInvestment } from '../../store/actions/game.actions';
import './styles.scss';

const InvestmentPanel: React.FC = () => {
  const investmentTypes = useSelector(selectInvestmentTypes);
  const selectedInvestment = useSelector(selectSelectedInvestment);
  const dispatch = useDispatch();

  const handleSelectInvestment = (type: string) => {
    dispatch(selectInvestment(type));
  };

  return (
    <div className="card investment-panel">
      <div className="card-header">
        <Typography variant="h6" className="card-title">
          Investment Options
        </Typography>
      </div>
      
      <div className="card-content">
        <div className="investment-options">
          {Object.entries(investmentTypes).map(([type, investment]) => (
            <Button
              key={type}
              className={`investment-option ${selectedInvestment === type ? 'selected' : ''}`}
              onClick={() => handleSelectInvestment(type)}
              variant={selectedInvestment === type ? 'contained' : 'outlined'}
              fullWidth
            >
              <div className="option-content">
                <div className="option-name">{investment.name}</div>
                <div className="option-cost">${investment.cost.toLocaleString()}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvestmentPanel;