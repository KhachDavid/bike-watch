# 🚴 Bike Watch - Urban Planning Simulator

A React-based spreadsheet-style management game where you play as an urban planner tasked with reducing bike thefts through strategic investments and data-driven decisions.

## 🎮 Game Overview

**Bike Watch** is a turn-based strategy game that combines urban planning with spreadsheet-style gameplay. Built with React, Redux, and Material-UI following modern development patterns, you manage a city district, allocating budget to various investments to reduce bike theft rates across different streets.

### Core Gameplay
- **Spreadsheet Interface**: Manage streets in a data table format
- **Budget Management**: Allocate limited funds across different investment types
- **Risk Analysis**: Monitor and reduce theft risk percentages
- **Turn-Based Progression**: Make decisions each turn and see long-term effects

## 🏗️ Features

### Street Management
- **5 Different Streets** with unique characteristics
- **Real-time Data Tracking**: Bikes per day, thefts per month, lighting scores
- **Risk Assessment**: Dynamic risk percentages based on multiple factors
- **Investment Tracking**: Monitor spending and ROI

### Investment Options
- **Street Lighting** ($5,000) - Improves lighting scores and reduces risk
- **Secure Parking** ($15,000) - Major risk reduction through security
- **Camera Systems** ($3,000) - Surveillance-based risk reduction
- **Community Programs** ($8,000) - Community engagement approach
- **Police Patrols** ($12,000) - Enforcement-based solution

### Data Visualization
- **Interactive Charts**: Risk vs theft analysis with Chart.js
- **Color-coded Risk Levels**: Visual indicators for street safety
- **Real-time Statistics**: City-wide metrics and trends

## 🛠️ Technical Stack

### Built With
- **React 18** - Modern component-based UI library
- **TypeScript** - Type-safe development
- **Redux** - Predictable state management
- **Material-UI** - Professional component library
- **Chart.js** - Data visualization and analytics
- **SCSS** - Enhanced CSS styling

### Architecture
- **Component-Based Design** - Reusable, modular components
- **Redux Pattern** - Actions, reducers, and selectors
- **TypeScript Interfaces** - Type safety and documentation
- **Responsive Design** - Mobile-first approach
- **Modern Hooks** - Functional components with hooks

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bike-watch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## 🎯 How to Play

1. **Select a Street**: Click on any street row in the table
2. **Choose Investment**: Click on an investment option in the sidebar
3. **Apply Investment**: Click "Apply Investment" to spend budget
4. **Next Turn**: Click "Next Turn" to advance and receive more budget
5. **Monitor Progress**: Watch risk percentages and theft rates change

### Winning Strategy
- Balance different investment types for maximum effect
- Consider street characteristics (foot traffic, current lighting)
- Plan for long-term sustainability
- Monitor the risk chart to identify problem areas

## 📊 Game Mechanics

### Risk Calculation
Risk percentage is calculated based on:
- **Lighting Score** (0-10): Better lighting = lower risk
- **Foot Traffic**: Higher traffic can increase or decrease risk
- **Investment Level**: More investment = lower risk
- **Random Events**: Unpredictable factors each turn

### Budget System
- **Starting Budget**: $100,000
- **Turn Progression**: Budget increases each turn
- **Investment Costs**: Fixed costs per investment type
- **ROI Tracking**: Monitor effectiveness of investments

### Turn Progression
- **Monthly Turns**: Each turn represents one month
- **Random Events**: Theft spikes, community improvements, weather
- **Progressive Difficulty**: Challenges increase over time
- **Long-term Planning**: Strategic thinking required

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── GameHeader/     # Header with budget and turn info
│   ├── InvestmentPanel/ # Investment selection
│   ├── StatsPanel/     # City statistics
│   ├── StreetsTable/   # Main data table
│   ├── RiskChart/      # Data visualization
│   └── GameControls/   # Action buttons
├── store/              # Redux store
│   ├── actions/        # Action creators
│   ├── reducers/       # State reducers
│   ├── selectors/      # Memoized selectors
│   └── sagas/          # Side effect handlers
├── types/              # TypeScript type definitions
├── App.tsx             # Main app component
└── index.tsx           # App entry point
```

## 🎨 Design Philosophy

The game follows a **spreadsheet-first** approach, appealing to players who enjoy:
- **Data Analysis**: Numbers, trends, and optimization
- **Strategic Planning**: Long-term decision making
- **Resource Management**: Limited budget allocation
- **Cause and Effect**: Clear feedback on decisions

## 🔧 Customization

The game is easily customizable through the Redux store:
- **Street Data**: Modify initial street characteristics in reducers
- **Investment Types**: Add new investment options
- **Risk Formulas**: Adjust calculation algorithms
- **Visual Styling**: Update SCSS files for different themes

## 📈 Future Enhancements

Potential additions for future versions:
- **Multiplayer Mode**: Compete with other planners
- **More Streets**: Expand the city district
- **Advanced Analytics**: More detailed reporting
- **Achievement System**: Goals and milestones
- **Save/Load**: Progress persistence with Redux Persist

## 🎯 Target Audience

Perfect for players who enjoy:
- **Management Sims**: SimCity, Cities: Skylines
- **Strategy Games**: Turn-based decision making
- **Data Analysis**: Spreadsheet-style gameplay
- **Urban Planning**: Real-world problem solving

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Bike Watch** - Where data meets strategy in the fight against bike theft! 🚴‍♂️💪