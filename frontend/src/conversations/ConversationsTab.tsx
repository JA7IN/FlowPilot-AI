import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  Pause, 
  Play, 
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { Lead } from '../types';
import styles from '../app/page.module.css';

interface ConversationsTabProps {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (leadId: string) => void;
  onSendMessage: (leadId: string, message: string) => Promise<void>;
  onResumeReplying: (leadId: string) => Promise<void>;
  isResuming: boolean;
  apiConnected: boolean;
}

export default function ConversationsTab({
  leads,
  selectedLeadId,
  onSelectLead,
  onSendMessage,
  onResumeReplying,
  isResuming,
  apiConnected
}: ConversationsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedLead = leads.find(l => l.id === selectedLeadId) || null;

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedLead?.conversation]);

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !replyInput.trim() || sending) return;
    
    setSending(true);
    const msgText = replyInput;
    setReplyInput('');
    
    try {
      await onSendMessage(selectedLead.id, msgText);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleQuickReply = async (message: string) => {
    if (!selectedLead || sending) return;
    setSending(true);
    try {
      await onSendMessage(selectedLead.id, message);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getSentimentStyle = (sentiment: string) => {
    const s = sentiment.toLowerCase();
    if (s === 'excited' || s === 'satisfaction') return styles.badgeExcited;
    if (s === 'hesitant') return styles.badgeHesitant;
    if (s === 'urgent') return styles.badgeUrgent;
    if (s === 'frustrated') return styles.badgeFrustrated;
    return styles.badgeNeutral;
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.doublePane}>
        {/* Left Side: Leads List */}
        <div className={`${styles.leadsPanel} glass-panel`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <span>Active Pipelines</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>
                ({filteredLeads.length} leads found)
              </span>
            </div>
          </div>

          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search 
              size={16} 
              color="var(--text-muted)" 
              style={{ position: 'absolute', left: '12px', top: '12px' }} 
            />
            <input 
              type="text" 
              placeholder="Search leads by name or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input"
              style={{ width: '100%', paddingLeft: '36px', fontSize: '13px' }}
            />
          </div>

          <div className={styles.leadList}>
            {filteredLeads.map((lead) => (
              <div 
                key={lead.id}
                onClick={() => onSelectLead(lead.id)}
                className={`${styles.leadCard} ${selectedLeadId === lead.id ? styles.leadCardActive : ''}`}
              >
                <div className={styles.leadCardHeader}>
                  <div className={styles.leadInfo}>
                    <h4>{lead.name}</h4>
                    <span>{lead.company}</span>
                  </div>
                  <span className={`${styles.badge} ${getSentimentStyle(lead.sentiment)}`}>
                    {lead.sentiment}
                  </span>
                </div>
                
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '8px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {lead.ai_summary || "No active messages."}
                </div>

                <div className={styles.leadCardFooter}>
                  <div>
                    Score: <span style={{ 
                      fontWeight: 700, 
                      color: lead.lead_score >= 80 ? 'var(--status-excited)' : lead.lead_score < 40 ? 'var(--status-frustrated)' : '#fff'
                    }}>{lead.lead_score}</span>
                  </div>
                  <div className={styles.leadValue}>{formatCurrency(lead.pipeline_value)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Conversation Sandbox */}
        <div className={`${styles.detailPane} glass-panel`}>
          {selectedLead ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Lead Details Header */}
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '20px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{selectedLead.name}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '2px' }}>
                      {selectedLead.company} • <span style={{ color: 'var(--text-muted)' }}>{selectedLead.email}</span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      {formatCurrency(selectedLead.pipeline_value)}
                    </span>
                    <span className={styles.syncBadge} style={{ 
                      background: selectedLead.crm_synced ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                      borderColor: selectedLead.crm_synced ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: selectedLead.crm_synced ? 'var(--status-excited)' : 'var(--status-hesitant)',
                      fontSize: '11px', padding: '3px 8px'
                    }}>
                      {selectedLead.crm_synced ? 'CRM Synced' : 'Sync Pending'}
                    </span>
                  </div>
                </div>

                {/* Substats Diagnostics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '16px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Lead Score</span>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: selectedLead.lead_score >= 80 ? 'var(--status-excited)' : '#fff' }}>{selectedLead.lead_score}/100</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Sentiment</span>
                    <div style={{ fontSize: '15px', fontWeight: 700 }} className={getSentimentStyle(selectedLead.sentiment)}>{selectedLead.sentiment}</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Conversion Rate</span>
                    <div style={{ fontSize: '15px', fontWeight: 700 }}>{Math.round(selectedLead.conversion_probability * 100)}%</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Churn Risk</span>
                    <div style={{ 
                      fontSize: '15px', 
                      fontWeight: 700,
                      color: selectedLead.churn_risk === 'High' ? 'var(--status-frustrated)' : selectedLead.churn_risk === 'Medium' ? 'var(--status-hesitant)' : 'var(--status-excited)'
                    }}>{selectedLead.churn_risk}</div>
                  </div>
                </div>

                {/* AI Summary Banner */}
                {selectedLead.ai_summary && (
                  <div style={{ 
                    marginTop: '16px', 
                    padding: '12px 14px', 
                    background: 'rgba(0, 242, 254, 0.04)', 
                    border: '1px solid rgba(0, 242, 254, 0.15)',
                    borderRadius: '10px',
                    fontSize: '13px',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center'
                  }}>
                    <Sparkles size={16} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong>AI Summarizer:</strong> {selectedLead.ai_summary}
                    </span>
                  </div>
                )}

                {/* Replying Loop Paused warning */}
                {selectedLead.ai_reply_paused && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '12px 14px', 
                    background: 'rgba(239, 68, 68, 0.08)', 
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '10px',
                    fontSize: '13px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <AlertTriangle size={16} color="var(--status-frustrated)" />
                      <span style={{ color: 'var(--status-frustrated)', fontWeight: 500 }}>
                        Autonomous replying paused (Frustrated Client Alert).
                      </span>
                    </div>
                    <button 
                      onClick={() => onResumeReplying(selectedLead.id)} 
                      disabled={isResuming}
                      className="glass-button glow-pulsing-pink"
                      style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'var(--status-frustrated)', background: 'transparent' }}
                    >
                      <RotateCcw size={12} />
                      <span>{isResuming ? 'Resuming...' : 'Resume Loop'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Chat Messages Scrolling Window */}
              <div 
                style={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  padding: '10px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  marginBottom: '16px',
                  maxHeight: '320px'
                }}
              >
                {selectedLead.conversation.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    No messages recorded. Send a message to start the dialog sandbox.
                  </div>
                ) : (
                  selectedLead.conversation.map((msg, index) => {
                    const isClient = msg.sender === 'client';
                    return (
                      <div 
                        key={index}
                        style={{
                          maxWidth: '75%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          fontSize: '13.5px',
                          lineHeight: '1.5',
                          alignSelf: isClient ? 'flex-end' : 'flex-start',
                          background: isClient ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                          border: isClient ? '1px solid rgba(0, 242, 254, 0.15)' : '1px solid var(--glass-border)',
                          borderBottomRightRadius: isClient ? '4px' : '12px',
                          borderBottomLeftRadius: isClient ? '12px' : '4px',
                          color: isClient ? '#fff' : 'var(--text-primary)'
                        }}
                      >
                        <p>{msg.message}</p>
                        <span suppressHydrationWarning style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '4px', textAlign: isClient ? 'right' : 'left' }}>
                          {msg.timestamp.includes('Z') ? new Date(msg.timestamp).toLocaleTimeString() : msg.timestamp}
                        </span>
                      </div>
                    );
                  })
                )}
                {sending && (
                  <div style={{
                    maxWidth: '75%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '13.5px',
                    alignSelf: 'flex-start',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--glass-border)',
                    borderBottomLeftRadius: '4px',
                    color: 'var(--text-muted)',
                    opacity: 0.6
                  }}>
                    FlowPilot AI is thinking...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '4px' }}>Quick reply:</span>
                <button 
                  onClick={() => handleQuickReply("Is SAML SSO setup available in your standard enterprise plan?")}
                  className="glass-button"
                  style={{ padding: '6px 12px', fontSize: '11px' }}
                  disabled={sending}
                >
                  🔒 SSO Query
                </button>
                <button 
                  onClick={() => handleQuickReply("This plan is way too expensive, do you have any coupon codes?")}
                  className="glass-button"
                  style={{ padding: '6px 12px', fontSize: '11px' }}
                  disabled={sending}
                >
                  💰 Discount
                </button>
                <button 
                  onClick={() => handleQuickReply("Great! Let's book a call for next Tuesday to set up the invoice.")}
                  className="glass-button"
                  style={{ padding: '6px 12px', fontSize: '11px' }}
                  disabled={sending}
                >
                  📅 Demo Call
                </button>
              </div>

              {/* Chat Send Form */}
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder={selectedLead.ai_reply_paused ? "Autonomous replying is paused. You can still message manually..." : "Type a sandbox client message..."}
                  className="glass-input"
                  style={{ flex: 1, fontSize: '13px' }}
                  disabled={sending}
                />
                <button 
                  type="submit" 
                  className="glass-button" 
                  style={{ padding: '12px' }}
                  disabled={sending || !replyInput.trim()}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <BookOpen size={48} color="var(--text-muted)" />
              <div>
                <h3>No Lead Selected</h3>
                <p style={{ marginTop: '6px' }}>Select an active pipeline customer from the left sidebar panel to begin conversation sandbox analysis.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
