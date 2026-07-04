import React from 'react';
import { 
  Sparkles, 
  Bot, 
  GitCommit, 
  ArrowDown, 
  Cpu, 
  Server, 
  Database,
  ArrowRight
} from 'lucide-react';
import styles from '../app/page.module.css';

export default function PitchDeckTab() {
  const steps = [
    {
      id: 'step-1',
      title: 'Customer Inbound Payload',
      icon: botStyles.InboundIcon,
      desc: 'Buyer sends an objection, security question, or pricing reservation via conversational touchpoints.',
      tech: 'FastAPI /api/chat'
    },
    {
      id: 'step-2',
      title: 'Node 1: analyze_sentiment',
      icon: botStyles.SentimentIcon,
      desc: 'Extracts emotional cues and classifies intent into Excited, Hesitant, Urgent, or Frustrated state structures.',
      tech: 'Sentiment Heuristic Parser'
    },
    {
      id: 'step-3',
      title: 'Node 2: calculate_lead_score',
      icon: botStyles.ScorerIcon,
      desc: 'Dynamically computes lead scores (+10 SSO, -15 Frustrated) and updates conversion rate multipliers.',
      tech: 'Scoring Rules Engine'
    },
    {
      id: 'step-4',
      title: 'Node 3: generate_response',
      icon: botStyles.ReplyIcon,
      desc: 'Queries Gemini 1.5 Flash to write professional SDR copy. Falls back to offline Heuristics Objection router.',
      tech: 'Google Generative AI'
    },
    {
      id: 'step-5',
      title: 'Workflow Orchestration Nodes',
      icon: botStyles.WorkflowIcon,
      desc: 'Evaluates triggers (wf-1 discount re-engagement, wf-2 Slack sales routing, wf-3 replies loop pause).',
      tech: 'Operations Engine'
    },
    {
      id: 'step-6',
      title: 'Outbound CRM Sync Webhooks',
      icon: botStyles.CrmIcon,
      desc: 'Pushes synchronized fields (conversion rate, AI summaries, lead score) to HubSpot/Salesforce accounts.',
      tech: 'CRM Mock integrations'
    }
  ];

  return (
    <div className={styles.tabContent}>
      <div className={styles.pitchGrid}>
        {/* Left Pane: Interactive Architecture presentation flow */}
        <div className={`${styles.pitchCard} glass-panel`}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={22} color="var(--accent-cyan)" />
            <span>LangGraph Stateful Decision Pipeline</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginTop: '6px', lineHeight: '1.6' }}>
            FlowPilot AI uses LangGraph to orchestrate state variables and decision trees, ensuring context remains consistent across long sales conversation turns.
          </p>

          <div className={styles.stepList}>
            {steps.map((step, idx) => (
              <div key={step.id}>
                <div className={styles.stepItem}>
                  <div style={botStyles.stepNumberIcon}>
                    {React.createElement(step.icon)}
                  </div>
                  <div className={styles.stepText}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4>{step.title}</h4>
                      <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600, background: 'rgba(0,242,254,0.06)', padding: '2px 8px', borderRadius: '4px' }}>
                        {step.tech}
                      </span>
                    </div>
                    <p>{step.desc}</p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div style={botStyles.connector}>
                    <ArrowDown size={14} color="rgba(255,255,255,0.15)" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Production scale / Pitch presentation facts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Tech Stack Specs */}
          <div className={`${styles.pitchCard} glass-panel`} style={{ padding: '24px' }}>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={18} color="var(--accent-pink)" />
              <span>System Specifications</span>
            </h3>
            
            <ul style={botStyles.specList}>
              <li style={botStyles.specItem}>
                <span style={botStyles.specLabel}>Backend Server:</span>
                <span style={botStyles.specVal}>FastAPI (Asynchronous Python)</span>
              </li>
              <li style={botStyles.specItem}>
                <span style={botStyles.specLabel}>State Loop:</span>
                <span style={botStyles.specVal}>LangGraph State Machine</span>
              </li>
              <li style={botStyles.specItem}>
                <span style={botStyles.specLabel}>LLM Engine:</span>
                <span style={botStyles.specVal}>Gemini 1.5 Flash (google-generativeai)</span>
              </li>
              <li style={botStyles.specItem}>
                <span style={botStyles.specLabel}>Frontend:</span>
                <span style={botStyles.specVal}>Next.js 15 (App Router, TypeScript)</span>
              </li>
              <li style={botStyles.specItem}>
                <span style={botStyles.specLabel}>Database:</span>
                <span style={botStyles.specVal}>In-Memory store JSON Persistence</span>
              </li>
            </ul>
          </div>

          {/* Hackathon pitch notes */}
          <div className={`${styles.pitchCard} glass-panel`} style={{ padding: '24px', background: 'rgba(0, 242, 254, 0.02)', borderColor: 'rgba(0, 242, 254, 0.1)' }}>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--accent-cyan)" />
              <span>Pitch Presentation Key Points</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.6' }}>
              When demonstrating to evaluators, highlight how FlowPilot solves the <strong>"leaky sales pipeline"</strong> problem.
              Showcase that standard CRM routing is static, while FlowPilot leverages stateful AI memory to address objections immediately, prevent churn risks, and recover lost revenue without manual input.
            </p>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--accent-cyan)' }}>
              <span>Learn more at docs.flowpilot.ai</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inlined icon styles
const botStyles: Record<string, any> = {
  stepNumberIcon: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--glass-border)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  connector: {
    display: 'flex',
    justifyContent: 'center',
    width: '40px',
    margin: '4px 0'
  },
  specList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  specItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13.5px',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    paddingBottom: '8px'
  },
  specLabel: {
    color: 'var(--text-secondary)'
  },
  specVal: {
    fontWeight: 700,
    color: '#fff'
  },
  // Small SVG Icons to look modern
  InboundIcon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  ),
  SentimentIcon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--status-hesitant)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
  ScorerIcon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--status-excited)" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
  ),
  ReplyIcon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
  ),
  WorkflowIcon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-pink)" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
  ),
  CrmIcon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
  )
};
