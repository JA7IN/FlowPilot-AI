import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Award, 
  Terminal, 
  Activity, 
  ShieldCheck, 
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';
import { DashboardMetrics, AuditLog } from '../types';
import styles from '../app/page.module.css';

interface OverviewTabProps {
  metrics: DashboardMetrics;
  auditLogs: AuditLog[];
  cliLogs: string[];
  onSendCommand: (cmd: string) => void;
  apiConnected: boolean;
}

export default function OverviewTab({
  metrics,
  auditLogs,
  cliLogs,
  onSendCommand,
  apiConnected
}: OverviewTabProps) {
  const [cmdInput, setCmdInput] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleCmdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;
    onSendCommand(cmdInput);
    setCmdInput('');
  };

  return (
    <div className={styles.tabContent}>
      {/* 4 KPI Grid Cards */}
      <div className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} glass-panel`}>
          <div className={styles.kpiGlow}></div>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Pipeline Value</span>
            <div className={styles.kpiIconWrapper}>
              <DollarSign size={20} color="var(--accent-cyan)" />
            </div>
          </div>
          <div className={styles.kpiValue}>{formatCurrency(metrics.total_pipeline)}</div>
          <div className={styles.kpiSubtext}>
            <TrendingUp size={12} color="var(--status-excited)" />
            <span style={{ color: 'var(--status-excited)' }}>+14.2%</span> from last week
          </div>
        </div>

        <div className={`${styles.kpiCard} glass-panel`}>
          <div className={styles.kpiGlow} style={{ background: 'radial-gradient(circle, rgba(255, 0, 127, 0.05) 0%, rgba(0,0,0,0) 70%)' }}></div>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Recovered Pipeline</span>
            <div className={styles.kpiIconWrapper}>
              <Award size={20} color="var(--accent-pink)" />
            </div>
          </div>
          <div className={styles.kpiValue}>{formatCurrency(metrics.recovered_revenue)}</div>
          <div className={styles.kpiSubtext}>
            <Activity size={12} color="var(--accent-pink)" />
            <span>Active re-engagement loop</span>
          </div>
        </div>

        <div className={`${styles.kpiCard} glass-panel`}>
          <div className={styles.kpiGlow}></div>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Avg Conversion Rate</span>
            <div className={styles.kpiIconWrapper}>
              <TrendingUp size={20} color="var(--status-excited)" />
            </div>
          </div>
          <div className={styles.kpiValue}>{Math.round(metrics.avg_conversion_prob * 100)}%</div>
          <div className={styles.kpiSubtext}>
            <ShieldCheck size={12} color="var(--status-excited)" />
            <span>Weighted by buyer sentiments</span>
          </div>
        </div>

        <div className={`${styles.kpiCard} glass-panel`}>
          <div className={styles.kpiGlow}></div>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Active Lead Fraction</span>
            <div className={styles.kpiIconWrapper}>
              <Users size={20} color="var(--accent-blue)" />
            </div>
          </div>
          <div className={styles.kpiValue}>{metrics.active_fraction_string}</div>
          <div className={styles.kpiSubtext}>
            <Activity size={12} color="var(--accent-blue)" />
            <span>Excludes closed & lost deals</span>
          </div>
        </div>
      </div>

      {/* Double Pane Section: CLI console & Audit logs */}
      <div className={styles.doublePane}>
        {/* CLI Console */}
        <div className={`${styles.leadsPanel} glass-panel`} style={{ padding: '24px' }}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <Terminal size={18} color="var(--accent-cyan)" />
              <span>Operations CLI Console</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={styles.syncBadge} style={{ 
                background: apiConnected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                borderColor: apiConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: apiConnected ? 'var(--status-excited)' : 'var(--status-frustrated)'
              }}>
                {apiConnected ? 'REST API PORT 8000: CONNECTED' : 'REST API OFFLINE: fallback active'}
              </span>
            </div>
          </div>

          <div 
            style={{
              flex: 1,
              background: '#040406',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '16px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#00ff66',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              marginBottom: '16px',
              minHeight: '260px',
              maxHeight: '340px'
            }}
          >
            {cliLogs.map((log, idx) => {
              let color = '#00ff66'; // default green
              if (log.startsWith('[sys]')) color = '#00bcff'; // blue
              if (log.startsWith('[workflow]')) color = '#ffd000'; // yellow
              if (log.startsWith('[error]')) color = '#ff3c3c'; // red
              if (log.startsWith('>')) color = '#ffffff'; // white input
              
              return (
                <div key={idx} style={{ color, wordBreak: 'break-all' }}>
                  {log}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleCmdSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              value={cmdInput} 
              onChange={(e) => setCmdInput(e.target.value)}
              placeholder="Enter console command (e.g. /help, /status, /leads, /reset)..."
              className="glass-input"
              style={{ flex: 1, fontSize: '13px' }}
            />
            <button type="submit" className="glass-button" style={{ padding: '10px 14px' }}>
              <Play size={14} />
            </button>
          </form>
        </div>

        {/* Audit Logs */}
        <div className={`${styles.leadsPanel} glass-panel`} style={{ padding: '24px' }}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <Activity size={18} color="var(--accent-pink)" />
              <span>Revenue Operations Audit Logs</span>
            </div>
          </div>

          <div 
            style={{ 
              flex: 1, 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px', 
              maxHeight: '410px',
              paddingRight: '6px'
            }}
          >
            {auditLogs.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                No operations logs recorded yet.
              </div>
            ) : (
              auditLogs.map((log) => {
                const isWorkflow = log.workflow_id.startsWith('wf-');
                return (
                  <div 
                    key={log.id} 
                    style={{
                      padding: '14px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '10px',
                      fontSize: '13px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ 
                        fontWeight: 700, 
                        color: log.workflow_id === 'wf-3' ? 'var(--status-frustrated)' :
                               log.workflow_id === 'wf-2' ? 'var(--status-excited)' :
                               log.workflow_id === 'wf-1' ? 'var(--status-urgent)' : 'var(--accent-cyan)'
                      }}>
                        {log.workflow_id === 'wf-1' ? 'wf-1 (Inactive Re-engagement)' :
                         log.workflow_id === 'wf-2' ? 'wf-2 (Hot Lead Route)' :
                         log.workflow_id === 'wf-3' ? 'wf-3 (Frustration Escalation)' : log.workflow_id.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {log.description}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
