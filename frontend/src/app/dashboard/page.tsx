'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Terminal } from 'lucide-react';
import styles from '../page.module.css';

import Sidebar from '../../components/Sidebar';
import PitchDeckTab from '../../components/PitchDeckTab';
import OverviewTab from '../../dashboard/OverviewTab';
import ConversationsTab from '../../conversations/ConversationsTab';
import WorkflowsTab from '../../workflows/WorkflowsTab';
import AnalyticsTab from '../../analytics/AnalyticsTab';

import { Lead, AuditLog, DashboardMetrics } from '../../types';

// Baseline mock state to use as fallback when API is disconnected
const MOCK_LEADS: Lead[] = [
  {
    id: "lead-1",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@sentrysec.io",
    company: "SentrySec",
    status: "nurturing",
    lead_score: 85,
    sentiment: "Excited",
    conversion_probability: 0.94,
    churn_risk: "Low",
    pipeline_value: 18500.0,
    last_message_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    crm_synced: true,
    ai_summary: "Prospect is highly interested in SAML SSO configuration and scheduling a team onboarding session.",
    ai_reply_paused: false,
    conversation: [
      {
        sender: "client",
        message: "Hi, we are looking for a pipeline recovery platform. Do you support SAML SSO for enterprise?",
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString()
      },
      {
        sender: "ai",
        message: "Hello Sarah! Yes, we support full SAML SSO integration for enterprise teams to ensure secure authentication. I can help set this up for your team. Would you like to schedule a quick demo?",
        timestamp: new Date(Date.now() - 3 * 3600000).toISOString()
      },
      {
        sender: "client",
        message: "Yes, please. That sounds perfect. Let's schedule it for Monday morning.",
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString()
      }
    ]
  },
  {
    id: "lead-2",
    name: "Michael Chen",
    email: "m.chen@apexsystems.com",
    company: "Apex Systems",
    status: "nurturing",
    lead_score: 38,
    sentiment: "Hesitant",
    conversion_probability: 0.32,
    churn_risk: "Medium",
    pipeline_value: 7200.0,
    last_message_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    crm_synced: true,
    ai_summary: "Prospect raised pricing concerns and asked for startup discounts or cheaper tiers.",
    ai_reply_paused: false,
    conversation: [
      {
        sender: "client",
        message: "Hello, is there any discount for early-stage startups? The current cost is a bit expensive for our current budget.",
        timestamp: new Date(Date.now() - 6 * 3600000).toISOString()
      }
    ]
  },
  {
    id: "lead-3",
    name: "David Miller",
    email: "d.miller@stripe-labs.com",
    company: "Stripe Labs",
    status: "new",
    lead_score: 92,
    sentiment: "Urgent",
    conversion_probability: 0.98,
    churn_risk: "Low",
    pipeline_value: 35000.0,
    last_message_at: new Date(Date.now() - 15 * 60000).toISOString(),
    crm_synced: true,
    ai_summary: "Lead is urgent to buy, asking for onboarding invoices and quick contract sign-off.",
    ai_reply_paused: false,
    conversation: [
      {
        sender: "client",
        message: "We need to get started immediately. Can you send over the invoice and the direct link to complete onboarding?",
        timestamp: new Date(Date.now() - 15 * 60000).toISOString()
      }
    ]
  },
  {
    id: "lead-4",
    name: "Emily Watson",
    email: "emily.watson@cloudscale.net",
    company: "CloudScale",
    status: "escalated",
    lead_score: 20,
    sentiment: "Frustrated",
    conversion_probability: 0.10,
    churn_risk: "High",
    pipeline_value: 12500.0,
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    crm_synced: false,
    ai_summary: "Client is extremely frustrated with setup errors and requested manual support escalation.",
    ai_reply_paused: true,
    conversation: [
      {
        sender: "client",
        message: "This integration is terrible! It keeps crashing during the auth step. I want to cancel my trial immediately, or get me a real human!",
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  },
  {
    id: "lead-5",
    name: "Robert Downey",
    email: "robert@ironcorp.dev",
    company: "IronCorp",
    status: "nurturing",
    lead_score: 55,
    sentiment: "Neutral",
    conversion_probability: 0.55,
    churn_risk: "Low",
    pipeline_value: 15000.0,
    last_message_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    crm_synced: true,
    ai_summary: "Inactive lead. Last conversation was a query about standard developer API rate limits.",
    ai_reply_paused: false,
    conversation: [
      {
        sender: "client",
        message: "What are the standard developer API rate limits for the pipeline metrics endpoint?",
        timestamp: new Date(Date.now() - 3 * 24 * 3600000).toISOString()
      }
    ]
  }
];

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    workflow_id: "wf-3",
    lead_id: "lead-4",
    description: "Frustration Escalation: Lead Emily Watson triggered 'Frustrated' sentiment. Paused AI replies, dispatched Slack alert, and queued support ticket."
  },
  {
    id: "log-2",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    workflow_id: "wf-2",
    lead_id: "lead-3",
    description: "Hot Lead Route: David Miller reached score of 92. Alerted Slack channel #sales-alerts and assigned owner."
  }
];

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [apiConnected, setApiConnected] = useState(false);
  
  // App States
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_pipeline: 88200,
    recovered_revenue: 12500,
    avg_conversion_prob: 0.58,
    active_leads_count: 4,
    total_leads_count: 5,
    active_fraction_string: "4/5",
    sentiment_counts: { Excited: 1, Hesitant: 1, Urgent: 1, Frustrated: 1, Neutral: 1 },
    milestones: [
      { name: "Week 1", recovered: 2500, leads: 1 },
      { name: "Week 2", recovered: 4500, leads: 2 },
      { name: "Week 3", recovered: 6000, leads: 2 },
      { name: "Week 4", recovered: 9000, leads: 3 },
      { name: "Week 5", recovered: 12500, leads: 4 }
    ]
  });

  // CLI Logs
  const [cliLogs, setCliLogs] = useState<string[]>([
    "[sys] Operations Dashboard Portal launched.",
    "[sys] Connecting to FastAPI port 8000 REST endpoints...",
  ]);
  
  const [isResetting, setIsResetting] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  const addCliLog = useCallback((msg: string) => {
    setCliLogs(prev => [...prev, msg]);
  }, []);

  // Fetch core application state from backend API
  const fetchData = useCallback(async () => {
    try {
      // 1. Leads
      const leadsRes = await fetch('http://127.0.0.1:8000/api/leads');
      if (!leadsRes.ok) throw new Error("HTTP error leads");
      const leadsData: Lead[] = await leadsRes.json();
      setLeads(leadsData);
      
      // 2. Metrics
      const metricsRes = await fetch('http://127.0.0.1:8000/api/analytics');
      if (!metricsRes.ok) throw new Error("HTTP error analytics");
      const metricsData: DashboardMetrics = await metricsRes.json();
      setMetrics(metricsData);
      
      // 3. Audit Logs
      const logsRes = await fetch('http://127.0.0.1:8000/api/audit-logs');
      if (!logsRes.ok) throw new Error("HTTP error audit-logs");
      const logsData: AuditLog[] = await logsRes.json();
      setAuditLogs(logsData);
      
      if (!apiConnected) {
        setApiConnected(true);
        addCliLog("[sys] REST backend API connection established on http://127.0.0.1:8000.");
      }
    } catch (e) {
      if (apiConnected) {
        setApiConnected(false);
        addCliLog("[sys] Backend REST server disconnected. Running on frontend fallback simulator.");
      }
    }
  }, [apiConnected, addCliLog]);

  // Initial load and polling loop
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // poll every 3s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSendCommand = (cmd: string) => {
    const cleanCmd = cmd.trim();
    addCliLog(`> ${cleanCmd}`);
    
    if (cleanCmd.startsWith('/help')) {
      addCliLog("[sys] Available commands: /help, /status, /leads, /reset, /clear");
    } else if (cleanCmd.startsWith('/status')) {
      addCliLog(`[sys] Engine status: stable. API link: ${apiConnected ? 'ONLINE' : 'OFFLINE (fallback simulation)'}.`);
      addCliLog(`[sys] Graph state size: ${leads.length} tracks. Active workflows: wf-1, wf-2, wf-3.`);
    } else if (cleanCmd.startsWith('/leads')) {
      addCliLog(`[sys] Active pipeline track count: ${leads.length}.`);
      leads.forEach(l => {
        addCliLog(`  - ${l.id}: ${l.name} (${l.company}) | Score: ${l.lead_score} | Status: ${l.status}`);
      });
    } else if (cleanCmd.startsWith('/reset')) {
      handleResetDb();
    } else if (cleanCmd.startsWith('/clear')) {
      setCliLogs(["[sys] Console log cleared."]);
    } else {
      addCliLog(`[error] Unknown command "${cleanCmd}". Type /help for options.`);
    }
  };

  // REST actions
  const handleSendMessage = async (leadId: string, message: string) => {
    addCliLog(`[sys] Sandbox client message submitted for lead: ${leadId}`);
    
    if (apiConnected) {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead_id: leadId, message }),
        });
        if (response.ok) {
          addCliLog("[sys] Message sent successfully. Graph state updated.");
          await fetchData();
          return;
        }
      } catch (err) {
        console.error("Failed to send message via API, falling back...", err);
      }
    }
    
    // OFFLINE BACKEND FALLBACK SIMULATOR
    // Simulate user message insertion and AI reply computation offline
    const leadIdx = leads.findIndex(l => l.id === leadId);
    if (leadIdx === -1) return;
    
    const updatedLeads = [...leads];
    const lead = { ...updatedLeads[leadIdx] };
    const nowStr = new Date().toISOString();
    
    // Append client msg
    lead.conversation = [...lead.conversation, {
      sender: 'client',
      message,
      timestamp: nowStr
    }];
    lead.last_message_at = nowStr;
    
    // Scorer logic inside frontend:
    let text = message.toLowerCase();
    let localSentiment = lead.sentiment;
    let scoreChange = 0;
    
    if (text.match(/terrible|cancel|fail|crashed|crash|refund|frustrated/)) {
      localSentiment = 'Frustrated';
      scoreChange = -15;
    } else if (text.match(/urgent|immediately|asap|invoice|payment|buy|onboard/)) {
      localSentiment = 'Urgent';
      scoreChange = 15;
    } else if (text.match(/excited|perfect|great|love|awesome|happy/)) {
      localSentiment = 'Excited';
      scoreChange = 8;
    } else if (text.match(/expensive|cost|budget|price|pricing|discount/)) {
      localSentiment = 'Hesitant';
      scoreChange = -5;
    }
    
    if (text.match(/sso|saml|security|auth/)) scoreChange += 10;
    if (text.match(/demo|meeting|call|schedule/)) scoreChange += 8;
    
    const newScore = Math.max(0, Math.min(100, lead.lead_score + scoreChange));
    let probVal = newScore / 100.0;
    const mult = localSentiment === 'Urgent' ? 1.15 : localSentiment === 'Excited' ? 1.10 : localSentiment === 'Hesitant' ? 0.85 : localSentiment === 'Frustrated' ? 0.50 : 1.00;
    probVal = Math.max(0.05, Math.min(0.99, probVal * mult));
    
    const riskVal = localSentiment === 'Frustrated' ? 'High' : newScore < 40 || localSentiment === 'Hesitant' ? 'Medium' : 'Low';
    
    lead.sentiment = localSentiment;
    lead.lead_score = newScore;
    lead.conversion_probability = probVal;
    lead.churn_risk = riskVal;
    
    addCliLog(`[node] sentiment: ${localSentiment} | score: ${newScore}`);
    
    // Heuristic offline reply copy
    let replyText = "Thanks for your reply. FlowPilot SDR agent is analyzing this. I would love to schedule a demo call.";
    if (text.match(/sso|saml|security|auth/)) {
      replyText = "Our enterprise plan includes comprehensive SAML 2.0 Single Sign-On (SSO) support compatible with Okta, Azure AD, and Ping Identity. We also provide full security compliance documentation and SOC 2 Type II validation. Would you like to connect with our security engineer to review your requirements?";
    } else if (text.match(/expensive|cost|budget|price|pricing|discount/)) {
      replyText = "I completely understand that budget is an important consideration. To help you evaluate the ROI of FlowPilot AI, we can offer a customized pilot package or a 15% discount for your first three months. Alternatively, we have a flexible startup tier. Would you be open to a quick chat to find a model that fits your budget?";
    } else if (text.match(/cancel|terrible|crashed|crash|fail|refund|frustrated/)) {
      replyText = "I'm so sorry to hear you're having trouble and wanting to cancel. I've paused my automated replies and escalated this to our senior support team. A representative will contact you at your email address within the hour to resolve any issues. Thank you for your patience.";
      lead.ai_reply_paused = true;
      lead.status = 'escalated';
      
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        workflow_id: 'wf-3',
        lead_id: lead.id,
        description: `Frustration Escalation: Lead ${lead.name} sentiment Frustrated. Paused reply loop, Slack alerts sent support.`
      };
      setAuditLogs(prev => [newLog, ...prev]);
      addCliLog("[workflow] wf-3 escalation triggered: replies paused, ticket generated.");
    }
    
    if (newScore >= 80 && localSentiment !== 'Frustrated') {
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        workflow_id: 'wf-2',
        lead_id: lead.id,
        description: `Hot Lead Route: Lead ${lead.name} reached score ${newScore}. Assigned queue, notified sales channel.`
      };
      setAuditLogs(prev => [newLog, ...prev]);
      addCliLog(`[workflow] wf-2 triggered: Hot Lead score ${newScore}! Slack alert dispatched.`);
    }
    
    // Append AI reply
    lead.conversation = [...lead.conversation, {
      sender: 'ai',
      message: replyText,
      timestamp: new Date().toISOString()
    }];
    
    // Re-summarize offline
    let summaryText = lead.ai_summary;
    if (text.match(/sso|saml/)) summaryText = `Prospect at ${lead.company} is analyzing SAML SSO security capabilities.`;
    else if (text.match(/expensive|price/)) summaryText = `Lead at ${lead.company} is interested but negotiating cost budgets.`;
    else if (text.match(/cancel|terrible/)) summaryText = `Urgent: client at ${lead.company} escalated with crashing setup bugs.`;
    lead.ai_summary = summaryText;
    
    updatedLeads[leadIdx] = lead;
    setLeads(updatedLeads);
    
    // Recalculate metrics based on local edits
    recalculateLocalMetrics(updatedLeads);
    addCliLog("[sys] Simulated CRM sync completed.");
  };

  const handleResumeReplying = async (leadId: string) => {
    addCliLog(`[sys] Resuming autonomous reply loop for lead: ${leadId}`);
    setIsResuming(true);
    
    if (apiConnected) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/leads/${leadId}/resume`, {
          method: 'POST'
        });
        if (response.ok) {
          addCliLog("[sys] Reply loop manual resume success.");
          await fetchData();
          setIsResuming(false);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
    
    // Offline simulation
    const leadIdx = leads.findIndex(l => l.id === leadId);
    if (leadIdx !== -1) {
      const updatedLeads = [...leads];
      const lead = { ...updatedLeads[leadIdx] };
      lead.ai_reply_paused = false;
      if (lead.status === 'escalated') {
        lead.status = 'nurturing';
      }
      updatedLeads[leadIdx] = lead;
      setLeads(updatedLeads);
      
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        workflow_id: 'manual-resume',
        lead_id: leadId,
        description: `Manual action: Resumed autonomous AI replying loop for lead ${lead.name} and changed status to nurturing.`
      };
      setAuditLogs(prev => [newLog, ...prev]);
      recalculateLocalMetrics(updatedLeads);
    }
    setIsResuming(false);
  };

  const handleTriggerWorkflow = async (leadId: string, workflowId: string) => {
    addCliLog(`[sys] Force triggering workflow ${workflowId} for lead: ${leadId}`);
    setIsTriggering(true);
    
    if (apiConnected) {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/workflows/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead_id: leadId, workflow_id: workflowId }),
        });
        if (response.ok) {
          addCliLog(`[sys] Workflow ${workflowId} triggered successfully.`);
          await fetchData();
          setIsTriggering(false);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
    
    // Offline simulation for wf-1 inactivity re-engagement
    if (workflowId === 'wf-1') {
      const leadIdx = leads.findIndex(l => l.id === leadId);
      if (leadIdx !== -1) {
        const updatedLeads = [...leads];
        const lead = { ...updatedLeads[leadIdx] };
        const nowStr = new Date().toISOString();
        
        lead.status = 'recovered';
        lead.sentiment = 'Satisfaction';
        lead.conversion_probability = 0.85;
        lead.lead_score = Math.min(100, lead.lead_score + 15);
        lead.conversation = [...lead.conversation, {
          sender: 'ai',
          message: `Hi ${lead.name}, we noticed you haven't completed onboarding yet. To help you get started with FlowPilot AI, here is a special early-bird 15% discount code: FLOW15! Let us know if you have any questions.`,
          timestamp: nowStr
        }];
        lead.last_message_at = nowStr;
        lead.ai_summary = "Automatically re-engaged with a 15% discount code after 48 hours of inactivity.";
        
        updatedLeads[leadIdx] = lead;
        setLeads(updatedLeads);
        
        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          timestamp: nowStr,
          workflow_id: 'wf-1',
          lead_id: leadId,
          description: `Inactive Re-engagement: Lead ${lead.name} silent > 48 hours. Changed status to recovered, sentiment to Satisfaction, sent 15% discount code.`
        };
        setAuditLogs(prev => [newLog, ...prev]);
        recalculateLocalMetrics(updatedLeads);
      }
    }
    setIsTriggering(false);
  };

  const handleResetDb = async () => {
    addCliLog("[sys] Triggering database reset to baseline seeds...");
    setIsResetting(true);
    
    if (apiConnected) {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/reset', { method: 'POST' });
        if (response.ok) {
          addCliLog("[sys] Database successfully reset on server.");
          await fetchData();
          setIsResetting(false);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
    
    // Offline simulation
    await new Promise(resolve => setTimeout(resolve, 600));
    setLeads(MOCK_LEADS);
    setAuditLogs(MOCK_AUDIT_LOGS);
    recalculateLocalMetrics(MOCK_LEADS);
    addCliLog("[sys] Offline memory database reset to seeded baselines.");
    setIsResetting(false);
  };

  const handleLogout = () => {
    addCliLog("[sys] Sign out command completed.");
    router.push('/');
  };

  // Helper to recalculate mock metrics on local edits
  const recalculateLocalMetrics = (currentLeads: Lead[]) => {
    let pipeline = 0;
    let recovered = 0;
    let totalProb = 0;
    let active = 0;
    const sentiments = { Excited: 0, Hesitant: 0, Urgent: 0, Frustrated: 0, Neutral: 0 };
    
    currentLeads.forEach(l => {
      pipeline += l.pipeline_value;
      if (l.status === 'recovered' || l.status === 'converted') {
        recovered += l.pipeline_value;
      }
      totalProb += l.conversion_probability;
      if (l.status !== 'converted' && l.status !== 'lost') {
        active += 1;
      }
      
      const sent = l.sentiment as keyof typeof sentiments;
      if (sentiments[sent] !== undefined) sentiments[sent]++;
      else sentiments.Neutral++;
    });
    
    setMetrics({
      total_pipeline: pipeline,
      recovered_revenue: recovered,
      avg_conversion_prob: totalProb / currentLeads.length,
      active_leads_count: active,
      total_leads_count: currentLeads.length,
      active_fraction_string: `${active}/${currentLeads.length}`,
      sentiment_counts: sentiments,
      milestones: [
        { name: "Week 1", recovered: recovered * 0.2, leads: 1 },
        { name: "Week 2", recovered: recovered * 0.35, leads: 2 },
        { name: "Week 3", recovered: recovered * 0.5, leads: 2 },
        { name: "Week 4", recovered: recovered * 0.75, leads: 3 },
        { name: "Week 5", recovered: recovered, leads: active }
      ]
    });
  };

  // Handle default lead selection
  useEffect(() => {
    if (!selectedLeadId && leads.length > 0) {
      setSelectedLeadId(leads[0].id);
    }
  }, [leads, selectedLeadId]);

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        onResetDb={handleResetDb}
        isResetting={isResetting}
      />
      
      <main className={styles.mainContent}>
        {/* Header Topbar */}
        <header className={styles.header}>
          <div className={styles.titleContainer}>
            <h1>Operations Command Center</h1>
            <p>
              {activeTab === 'overview' && 'System status metrics & compilation CLI monitor'}
              {activeTab === 'conversations' && 'AI objection sandbox conversations debugger'}
              {activeTab === 'workflows' && 'Automated pipelines, Slack routing, and discount rules'}
              {activeTab === 'analytics' && 'Vibrant visual graphs of pipeline recoveries and sentiments'}
              {activeTab === 'pitch' && 'LangGraph state decision machine pitch presentation'}
            </p>
          </div>

          <div className={styles.topBarActions}>
            <div className={styles.syncBadge}>
              <Sparkles size={14} />
              <span>FlowPilot active state sync: {apiConnected ? 'Live Port 8000' : 'Offline Mode'}</span>
            </div>
          </div>
        </header>

        {/* Tab content area */}
        {activeTab === 'overview' && (
          <OverviewTab 
            metrics={metrics}
            auditLogs={auditLogs}
            cliLogs={cliLogs}
            onSendCommand={handleSendCommand}
            apiConnected={apiConnected}
          />
        )}

        {activeTab === 'conversations' && (
          <ConversationsTab 
            leads={leads}
            selectedLeadId={selectedLeadId}
            onSelectLead={setSelectedLeadId}
            onSendMessage={handleSendMessage}
            onResumeReplying={handleResumeReplying}
            isResuming={isResuming}
            apiConnected={apiConnected}
          />
        )}

        {activeTab === 'workflows' && (
          <WorkflowsTab 
            leads={leads}
            onTriggerWorkflow={handleTriggerWorkflow}
            isTriggering={isTriggering}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab metrics={metrics} />
        )}

        {activeTab === 'pitch' && (
          <PitchDeckTab />
        )}
      </main>
    </div>
  );
}
