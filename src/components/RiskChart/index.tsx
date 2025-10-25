import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectChartData, selectCurrentTurn } from '../../store/selectors/game.selectors';
import './styles.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RiskChart: React.FC = () => {
  const chartData = useSelector(selectChartData);
  const currentTurn = useSelector(selectCurrentTurn);

  // Calculate next month date
  const gameStartDate = new Date(2025, 0, 1);
  const nextMonthDate = new Date(gameStartDate);
  nextMonthDate.setMonth(nextMonthDate.getMonth() + currentTurn);
  const nextMonth = nextMonthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // Calculate metrics
  const averageRisk = chartData.riskData.reduce((a, b) => a + b, 0) / chartData.riskData.length;
  const averageThefts = chartData.theftData.reduce((a, b) => a + b, 0) / chartData.theftData.length;

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Risk Level',
        data: chartData.riskData,
        backgroundColor: chartData.riskData.map(risk => {
          // Risk ranges: 2-10% (meaningful gameplay)
          if (risk < 4) return 'rgba(34, 197, 94, 0.8)';
          if (risk < 7) return 'rgba(245, 158, 11, 0.8)';
          return 'rgba(239, 68, 68, 0.8)';
        }),
        borderColor: chartData.riskData.map(risk => {
          if (risk < 4) return 'rgba(34, 197, 94, 1)';
          if (risk < 7) return 'rgba(245, 158, 11, 1)';
          return 'rgba(239, 68, 68, 1)';
        }),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        yAxisID: 'y'
      },
      {
        label: 'Theft Incidents',
        data: chartData.theftData,
        type: 'line' as const,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: false
      },
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            weight: 'bold' as const
          },
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 13,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 12,
          weight: 'normal' as const
        },
        padding: 12,
        callbacks: {
          title: (context: any) => {
            return `Street: ${context[0].label}`;
          },
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            
            if (label === 'Risk Level') {
              return `${label}: ${value}% ${value < 30 ? '(Low)' : value < 60 ? '(Medium)' : '(High)'}`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            weight: 'bold' as const
          },
          color: '#6b7280'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Risk Level (%)',
          font: {
            size: 12,
            weight: 'bold' as const
          },
          color: '#374151'
        },
        min: 0,
        max: 100,
        ticks: {
          font: {
            size: 11,
            weight: 'normal' as const
          },
          color: '#6b7280',
          callback: function(value: any) {
            return value + '%';
          }
        },
        grid: {
          color: 'rgba(229, 231, 235, 0.5)',
          drawBorder: false
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Theft Incidents',
          font: {
            size: 12,
            weight: 'bold' as const
          },
          color: '#374151'
        },
        ticks: {
          font: {
            size: 11,
            weight: 'normal' as const
          },
          color: '#6b7280'
        },
        grid: {
          drawOnChartArea: false,
          drawBorder: false
        }
      }
    }
  };


  return (
    <div className="card risk-chart-panel">
      <div className="card-header">
        <div className="header-left">
          <Typography variant="h6" className="card-title">
            Risk Analysis - Future Projections
          </Typography>
          <Typography variant="caption" className="data-context">
            🔮 Predicted risk for {nextMonth} • Based on current conditions & trends
          </Typography>
        </div>
      </div>
      
      <div className="card-content">
        <div className="chart-metrics">
          <div className="metric-item">
            <div className="metric-label">Average Risk</div>
            <div className="metric-value">{averageRisk.toFixed(1)}%</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-label">Average Thefts</div>
            <div className="metric-value">{averageThefts.toFixed(1)}</div>
          </div>
        </div>

        <div className="risk-chart-container">
          <Chart type="bar" data={data} options={options} />
        </div>

        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color risk-low"></div>
            <span>Low Risk (&lt;4%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color risk-medium"></div>
            <span>Medium Risk (4-7%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color risk-high"></div>
            <span>High Risk (&gt;7%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskChart;