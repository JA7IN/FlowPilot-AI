import React from 'react';
import { BarChart3, PieChart, Activity, ShieldAlert, CheckCircle, Flame } from 'lucide-react';
import { DashboardMetrics } from '../types';
import styles from '../app/page.module.css';

interface AnalyticsTabProps {
  metrics: DashboardMetrics;
}

export default function AnalyticsTab({ metrics }: AnalyticsTabProps) {
  const { sentiment_counts, milestones, recovered_revenue } = metrics;
  
  // 1. Compute Sentiment Donut calculations
  const sentiments = Object.entries(sentiment_counts) as [string, number][];
  const totalSentiments = sentiments.reduce((acc, [_, count]) => acc + count, 0) || 1;
  
  // Map colors
  const sentimentColors: Record<string, string> = {
    Excited: '#10b981', // green
    Hesitant: '#f59e0b', // orange
    Urgent: '#3b82f6', // blue
    Frustrated: '#ef4444', // red
    Neutral: '#6b7280' // grey
  };

  // Calculate coordinates for SVG donut slices
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // ~439.8
  
  let currentOffset = 0;
  const segments = sentiments.map(([name, count]) => {
    const percentage = count / totalSentiments;
    const strokeLength = percentage * circumference;
    const offset = currentOffset;
    currentOffset += strokeLength;
    return {
      name,
      count,
      percentage: Math.round(percentage * 100),
      strokeDasharray: `${strokeLength} ${circumference - strokeLength}`,
      strokeDashoffset: -offset,
      color: sentimentColors[name] || '#fff'
    };
  });

  // 2. Compute Area Chart calculations
  const chartHeight = 180;
  const chartWidth = 520;
  const padding = 30;
  
  const values = milestones.map(m => m.recovered);
  const maxVal = Math.max(...values, 1000) * 1.1; // scale up slightly for headroom
  
  const points = milestones.map((m, index) => {
    const x = padding + (index * (chartWidth - 2 * padding)) / (milestones.length - 1);
    // SVG y coordinates start from top, so subtract scaled value from height
    const y = chartHeight - padding - (m.recovered / maxVal) * (chartHeight - 2 * padding);
    return { x, y, name: m.name, value: m.recovered };
  });

  // Generate line path definition: M x1 y1 L x2 y2 ...
  let linePath = '';
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  }

  // Generate area path definition (closing at baseline)
  let areaPath = '';
  if (points.length > 0) {
    const first = points[0];
    const last = points[points.length - 1];
    const baselineY = chartHeight - padding;
    areaPath = `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.doublePane}>
        {/* Sentiment Distribution Donut Chart */}
        <div className={`${styles.leadsPanel} glass-panel`} style={{ padding: '24px' }}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <PieChart size={18} color="var(--accent-cyan)" />
              <span>Customer Sentiment Index</span>
            </div>
          </div>

          <div style={chartStyles.chartContainer}>
            {/* Custom SVG Donut */}
            <div style={chartStyles.svgWrapper}>
              <svg width="220" height="220" viewBox="0 0 200 200">
                <circle 
                  cx="100" 
                  cy="100" 
                  r={radius} 
                  fill="none" 
                  stroke="rgba(255,255,255,0.02)" 
                  strokeWidth="20" 
                />
                {segments.map((seg, idx) => (
                  <circle
                    key={idx}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="20"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    transform="rotate(-90 100 100)"
                    style={{ transition: 'all 0.5s ease' }}
                  />
                ))}
                {/* Central cut-out text details */}
                <circle cx="100" cy="100" r={radius - 12} fill="#0d0d14" />
                <text 
                  x="100" 
                  y="96" 
                  textAnchor="middle" 
                  fill="var(--text-secondary)" 
                  fontSize="12" 
                  fontWeight="600"
                >
                  PIPELINE LEADS
                </text>
                <text 
                  x="100" 
                  y="118" 
                  textAnchor="middle" 
                  fill="#ffffff" 
                  fontSize="22" 
                  fontWeight="800"
                >
                  {totalSentiments}
                </text>
              </svg>
            </div>

            {/* Legend & stats */}
            <div style={chartStyles.legend}>
              {segments.map((seg, idx) => (
                <div key={idx} style={chartStyles.legendItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: seg.color }}></div>
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>{seg.name}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {seg.count} leads ({seg.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Milestone Recovery Area Chart */}
        <div className={`${styles.detailPane} glass-panel`} style={{ padding: '24px' }}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <BarChart3 size={18} color="var(--accent-pink)" />
              <span>Milestone Revenue Recovery Path</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Cumulative recovered: <strong>{formatCurrency(recovered_revenue)}</strong>
            </span>
          </div>

          <div style={chartStyles.areaChartWrapper}>
            {/* Custom SVG Area Line Chart */}
            <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid horizontal guidelines */}
              <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1={padding} y1={(chartHeight - 2 * padding) / 2 + padding} x2={chartWidth - padding} y2={(chartHeight - 2 * padding) / 2 + padding} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />

              {/* Area path */}
              {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

              {/* Line path */}
              {linePath && <path d={linePath} fill="none" stroke="var(--accent-cyan)" strokeWidth="3" />}

              {/* Glowing Coordinate Dots */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle cx={p.x} cy={p.y} r="7" fill="var(--bg-primary)" stroke="var(--accent-cyan)" strokeWidth="2.5" />
                  <circle cx={p.x} cy={p.y} r="3" fill="#ffffff" />
                  {/* Labeled data values above dots */}
                  <text 
                    x={p.x} 
                    y={p.y - 12} 
                    textAnchor="middle" 
                    fill="var(--text-secondary)" 
                    fontSize="10" 
                    fontWeight="700"
                  >
                    {formatCurrency(p.value)}
                  </text>
                  {/* Axis labels underneath bottom line */}
                  <text 
                    x={p.x} 
                    y={chartHeight - 8} 
                    textAnchor="middle" 
                    fill="var(--text-muted)" 
                    fontSize="10" 
                    fontWeight="500"
                  >
                    {p.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div style={chartStyles.statsFooter}>
            <div style={chartStyles.statFooterCard}>
              <Flame size={16} color="var(--status-excited)" />
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Conversion Multiplier</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>1.15x (Urgent Intent)</span>
              </div>
            </div>
            <div style={chartStyles.statFooterCard}>
              <ShieldAlert size={16} color="var(--status-frustrated)" />
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Active Churn Risks</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                  {metrics.sentiment_counts.Frustrated} High Alert
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const chartStyles: Record<string, React.CSSProperties> = {
  chartContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    flex: 1
  },
  svgWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  legend: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '20px'
  },
  legendItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  areaChartWrapper: {
    flex: 1,
    marginTop: '20px',
    padding: '10px 0',
    display: 'flex',
    alignItems: 'center'
  },
  statsFooter: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '20px',
    marginTop: '10px'
  },
  statFooterCard: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--glass-border)',
    padding: '10px 14px',
    borderRadius: '10px'
  }
};
