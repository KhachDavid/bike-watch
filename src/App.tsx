import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Container } from '@mui/material';
import { initializeGame, loadStreetsData } from './store/actions/game.actions';
import { processRealSFData } from './services/sfDataService';
import GameHeader from './components/GameHeader';
import InvestmentPanel from './components/InvestmentPanel';
import StatsPanel from './components/StatsPanel';
import RiskChart from './components/RiskChart';
import StreetsTable from './components/StreetsTable';
import GameControls from './components/GameControls';
import DataLoader from './components/DataLoader';
import VandalismAlert from './components/VandalismAlert';
import GameOver from './components/GameOver';
import './App.scss';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      console.log('🚀 Starting data load...');
      dispatch(initializeGame());
      console.log('✅ Game initialized');
      
      try {
        console.log('📡 Fetching real SF data...');
        // Fetch real SF data dynamically
        const realData = await processRealSFData();
        console.log('✅ Real data fetched:', realData.length, 'streets');
        
        // Convert to Street format and load into state
        const streets = realData.map(street => ({
          id: street.id,
          name: street.name,
          bikesPerDay: street.bikesPerDay,
          theftsPerMonth: street.theftsPerMonth,
          theftsLastMonth: street.theftsLastMonth,
          lightingScore: street.lightingScore,
          baseLightingScore: street.lightingScore, // Store original for recalculation
          footTraffic: street.footTraffic as 'Low' | 'Medium' | 'High' | 'Very High',
          investment: street.investment,
          riskPercentage: street.riskPercentage,
          historicalRisk: street.historicalRisk,
          latitude: street.latitude,
          longitude: street.longitude
        }));
        
        console.log('🗺️  Loading streets into Redux...');
        dispatch(loadStreetsData(streets));
        console.log('✅ Streets loaded into Redux');
        
        console.log('✅ Setting dataLoaded = true');
        setDataLoaded(true);
        console.log('✅ Data load complete!');
      } catch (error) {
        console.error('❌ Failed to load SF data:', error);
        console.log('⚠️ Setting dataLoaded = true anyway');
        setDataLoaded(true);
      }
    };

    loadData();
  }, [dispatch]);

  console.log('📊 Current dataLoaded state:', dataLoaded);
  
  if (!dataLoaded) {
    console.log('⏳ Showing DataLoader component');
    return <DataLoader onDataLoaded={() => {}} />;
  }
  
  console.log('🎮 Rendering main game app');

  return (
    <div className="app">
      {/* Vandalism Alert - Fixed Position Overlay */}
      <VandalismAlert />
      
      {/* Game Over Dialog */}
      <GameOver />
      
      <Container maxWidth="xl" className="app-container">
        <GameHeader />
        
        {/* Main Layout - User Action Based */}
        <div className="main-layout">
          {/* Left Side: Review & Analyze */}
          <div className="analysis-section">
            <StreetsTable />
            <StatsPanel />
            <RiskChart />
          </div>

          {/* Right Side: Take Action */}
          <div className="action-section">
            <GameControls />
            <InvestmentPanel />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default App;