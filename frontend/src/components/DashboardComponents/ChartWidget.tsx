import React from 'react';
import { FaChartLine, FaDownload } from 'react-icons/fa';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface ChartWidgetProps {
  title: string;
  description?: string;
  data: ChartData[];
  type: 'bar' | 'line' | 'pie';
  height?: number;
  exportable?: boolean;
  onExport?: () => void;
}

/**
 * ChartWidget Component - Displays charts for analytics
 * Industry-level implementation with multiple chart types
 */
const ChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  description,
  data,
  type,
  height = 300,
  exportable = false,
  onExport,
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="chart-widget">
      <div className="chart-header">
        <div className="chart-title-section">
          <h4>{title}</h4>
          {description && <p className="chart-description">{description}</p>}
        </div>
        {exportable && (
          <button className="export-btn" onClick={onExport} title="Export chart">
            <FaDownload /> Export
          </button>
        )}
      </div>

      <div className="chart-container" style={{ height: `${height}px` }}>
        {type === 'bar' && (
          <div className="bar-chart">
            {data.map((item, idx) => (
              <div key={idx} className="bar-item">
                <div className="bar-value">
                  <div
                    className="bar"
                    style={{
                      height: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: item.color || '#3b82f6',
                    }}
                  ></div>
                </div>
                <label>{item.label}</label>
              </div>
            ))}
          </div>
        )}

        {type === 'line' && (
          <div className="line-chart">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                points={data.map((item, idx) => `${(idx / data.length) * 100},${100 - (item.value / maxValue) * 100}`).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
            </svg>
          </div>
        )}

        {type === 'pie' && (
          <div className="pie-chart">
            <svg viewBox="0 0 100 100">
              {data.map((item, idx) => {
                const sliceAngle = (item.value / data.reduce((a, b) => a + b.value, 0)) * 360;
                const startAngle = data.slice(0, idx).reduce((a, b) => a + (b.value / data.reduce((a, b) => a + b.value, 0)) * 360, 0);
                
                return (
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r="50"
                    fill={item.color || '#3b82f6'}
                    opacity={0.2 + (idx * 0.15)}
                  />
                );
              })}
            </svg>
          </div>
        )}
      </div>

      <div className="chart-legend">
        {data.map((item, idx) => (
          <div key={idx} className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: item.color || '#3b82f6' }}
            ></span>
            <span>{item.label}</span>
            <span className="legend-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartWidget;
