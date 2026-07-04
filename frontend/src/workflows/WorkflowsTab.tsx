import React, { useState } from 'react';
import { 
  Workflow, 
  Play, 
  Clock, 
  Zap, 
  AlertOctagon, 
  HelpCircle,
  ToggleLeft,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { Lead } from '../types';
import styles from '../app/page.module.css';

interface WorkflowsTabProps {
  leads: Lead[];
  onTriggerWorkflow: (leadId: string, workflowId: string) => Promise<void>;
  isTriggering: boolean;
}

export default function WorkflowsTab({
  leads,
  onTriggerWorkflow,
  isTriggering
}: WorkflowsTabProps) {
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [activeWorkflows, setActiveWorkflows] = useState({
    wf1: true,
    wf2: true,
    wf3: true
  });

  const handleWf1Trigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || isTriggering) return;
    
    await onTriggerWorkflow(selectedLeadId, 'wf-1');
  };

  const getLeadLabel = (lead: Lead) => {
    return `${lead.name} (${lead.company}) - Score: ${lead.lead_score}, Status: ${lead.status}`;
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.doublePane}>
        {/* Left Side: Workflow Configurations */}
        <div className={`${styles.leadsPanel} glass-panel`} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <Workflow size={18} color="var(--accent-cyan)" />
              <span>Revenue Operations Automations</span>
            </div>
          </div>

          {/* Workflow 1 */}
          <div style={wfStyles.ruleCard}>
            <div style={wfStyles.ruleHeader}>
              <div style={wfStyles.titleGroup}>
                <Clock size={20} color="var(--accent-cyan)" />
                <div>
                  <h3 style={wfStyles.ruleTitle}>wf-1: Inactive Re-engagement</h3>
                  <span style={wfStyles.ruleSub}>Scheduler: 48h idle check</span>
                </div>
              </div>
              <span className={styles.syncBadge} style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--status-excited)', padding: '2px 8px', fontSize: '10px' }}>
                ACTIVE
              </span>
            </div>
            <p style={wfStyles.ruleDesc}>
              Scans client thread history. If a prospect is silent for over 48 hours, automatically boosts conversion rates, modifies status to 'recovered', and drafts/sends a customized 15% discount email directly in the conversation log.
            </p>
            <div style={wfStyles.actions}>
              <div style={wfStyles.triggerCondition}>
                <strong>Trigger:</strong> Last Message &gt; 48 hours ago
              </div>
            </div>
          </div>

          {/* Workflow 2 */}
          <div style={wfStyles.ruleCard}>
            <div style={wfStyles.ruleHeader}>
              <div style={wfStyles.titleGroup}>
                <Zap size={20} color="var(--status-excited)" />
                <div>
                  <h3 style={wfStyles.ruleTitle}>wf-2: Hot Lead Route & Alert</h3>
                  <span style={wfStyles.ruleSub}>Event: Lead score threshold reached</span>
                </div>
              </div>
              <span className={styles.syncBadge} style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--status-excited)', padding: '2px 8px', fontSize: '10px' }}>
                ACTIVE
              </span>
            </div>
            <p style={wfStyles.ruleDesc}>
              Monitors scoring engine metrics in real-time. If a lead score reaches 80+, triggers automatic Slack routing alerts to channel #sales-alerts, assigns sales representative, and performs Salesforce CRM updates.
            </p>
            <div style={wfStyles.actions}>
              <div style={wfStyles.triggerCondition}>
                <strong>Trigger:</strong> Lead Score &gt;= 80
              </div>
            </div>
          </div>

          {/* Workflow 3 */}
          <div style={wfStyles.ruleCard}>
            <div style={wfStyles.ruleHeader}>
              <div style={wfStyles.titleGroup}>
                <AlertOctagon size={20} color="var(--status-frustrated)" />
                <div>
                  <h3 style={wfStyles.ruleTitle}>wf-3: Frustrated Escalation</h3>
                  <span style={wfStyles.ruleSub}>Event: Sentiment override classification</span>
                </div>
              </div>
              <span className={styles.syncBadge} style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--status-excited)', padding: '2px 8px', fontSize: '10px' }}>
                ACTIVE
              </span>
            </div>
            <p style={wfStyles.ruleDesc}>
              Intercepts distressed comments. If message sentiment triggers 'Frustrated' checks, immediately pauses AI reply generator models, pushes warning alerts to support Slack webhooks, and creates human task queues.
            </p>
            <div style={wfStyles.actions}>
              <div style={wfStyles.triggerCondition}>
                <strong>Trigger:</strong> Sentiment == 'Frustrated'
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Simulation Terminal */}
        <div className={`${styles.detailPane} glass-panel`} style={{ padding: '24px' }}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <Play size={18} color="var(--accent-pink)" />
              <span>Simulate Automated Actions</span>
            </div>
          </div>

          <div style={wfStyles.simulateIntro}>
            <p>
              Under standard production models, these rules execute in cron cycles or event queues. 
              Use this simulator dashboard to instantly force-trigger workflows on test leads to evaluate LangGraph and webhook metrics.
            </p>
          </div>

          <form onSubmit={handleWf1Trigger} style={wfStyles.triggerForm}>
            <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>
              Test wf-1 (Inactive Re-engagement)
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px', lineHeight: '1.4' }}>
              Select an active lead to simulate 48 hours of silence. The engine will automatically update metrics, draft early-bird copy, and append it to the chat ledger database.
            </p>

            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.formLabel}>Select Pipeline Target</label>
              <select 
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="glass-input"
                style={{ width: '100%', padding: '12px', background: '#09090e', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px' }}
                required
              >
                <option value="">-- Select a test lead --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id} disabled={l.status === 'recovered'}>
                    {getLeadLabel(l)}
                  </option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isTriggering || !selectedLeadId}
              className="glass-button glow-pulsing"
              style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--accent-cyan)', background: 'rgba(0, 242, 254, 0.08)' }}
            >
              <Zap size={16} />
              <span>{isTriggering ? 'Running Workflow...' : 'Simulate 48h Silence'}</span>
            </button>
          </form>

          <div style={wfStyles.diagramCard} className="glass-panel">
            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} color="var(--accent-pink)" />
              <span>Slack Webhook Diagnostics</span>
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', marginTop: '6px', lineHeight: '1.5' }}>
              Slack integration endpoints are pre-bound. Whenever **wf-2** or **wf-3** runs, the backend logs simulated payload delivery headers and formatting variables directly to the CLI console.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const wfStyles: Record<string, React.CSSProperties> = {
  ruleCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'var(--transition-smooth)'
  },
  ruleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  titleGroup: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  ruleTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#fff'
  },
  ruleSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    display: 'block',
    marginTop: '2px'
  },
  ruleDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5'
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
    borderTop: '1px solid rgba(255, 255, 255, 0.03)'
  },
  triggerCondition: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  simulateIntro: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--glass-border)',
    borderRadius: '10px',
    padding: '14px',
    fontSize: '13.5px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginBottom: '20px'
  },
  triggerForm: {
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px'
  },
  diagramCard: {
    padding: '16px',
    background: 'rgba(255, 0, 127, 0.02)',
    borderColor: 'rgba(255, 0, 127, 0.1)'
  }
};
