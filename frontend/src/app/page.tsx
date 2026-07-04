'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldCheck, HelpCircle, Terminal, Play, LogIn, AlertTriangle } from 'lucide-react';
import styles from './landing.module.css';

interface Message {
  sender: 'client' | 'ai' | 'system';
  message: string;
  timestamp: string;
}

export default function LandingPage() {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      message: "Hello! I'm FlowPilot SDR, your automated sales pipeline agent. Select an objection below or write a custom message to see how I dynamically qualify leads, score pipeline value, and escalate urgent issues in real-time.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [objectionType, setObjectionType] = useState<string | null>(null);
  
  // Lead stats state
  const [leadScore, setLeadScore] = useState(50);
  const [sentiment, setSentiment] = useState('Neutral');
  const [status, setStatus] = useState('new');
  const [prob, setProb] = useState(0.50);
  const [risk, setRisk] = useState('Low');
  
  // CLI Logs
  const [cliLogs, setCliLogs] = useState<string[]>([
    "[sys] FlowPilot engine initialized. Standing by.",
    "[sys] StateGraph compiled: analyze_sentiment -> calculate_lead_score -> generate_response"
  ]);
  
  // Auth Modal
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState('admin@flowpilot.ai');
  const [password, setPassword] = useState('admin');
  const [loginError, setLoginError] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // CLI logger helper
  const addCliLog = (msg: string) => {
    setCliLogs(prev => [...prev, msg]);
  };

  const handlePresetObjection = async (type: string) => {
    setObjectionType(type);
    let msgText = '';
    if (type === 'sso') {
      msgText = "Do you support SAML SSO integration for enterprise security compliance?";
    } else if (type === 'price') {
      msgText = "Is there any discount? Your enterprise plan is a bit expensive for our startup budget.";
    } else if (type === 'cancel') {
      msgText = "Your system crashed during auth. Cancel my subscription, or let me talk to a real human immediately!";
    }
    
    setInputText(msgText);
    await sendMessage(msgText, type);
  };

  const sendMessage = async (text: string, presetType?: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = {
      sender: 'client',
      message: text,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    
    const cleanText = text.toLowerCase();
    addCliLog(`[sys] Received inbound customer payload: "${text.substring(0, 30)}..."`);
    addCliLog("[node] Executing sentiment & core keyword classification...");
    
    // Simulate Backend REST call
    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead_id: 'sandbox',
          message: text
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Success from server! Update metrics
        const lead = data.lead;
        setLeadScore(lead.lead_score);
        setSentiment(lead.sentiment);
        setStatus(lead.status);
        setProb(lead.conversion_probability);
        setRisk(lead.churn_risk);
        
        addCliLog(`[node] sentiment classified: ${lead.sentiment}`);
        addCliLog(`[node] adjusted lead score: ${lead.lead_score}`);
        addCliLog(`[node] conversion prob: ${lead.conversion_probability * 100}% | churn risk: ${lead.churn_risk}`);
        
        // Print workflow run triggers
        if (lead.sentiment === 'Frustrated') {
          addCliLog("[workflow] wf-3 triggered: Frustration Escalation! Paused AI reply loop & created ticket.");
        } else if (lead.lead_score >= 80) {
          addCliLog("[workflow] wf-2 triggered: Hot Lead! Slack notifications dispatched to channel #sales-alerts.");
        }
        
        addCliLog(`[sys] Outbound webhook successfully synchronized with CRM (${data.crm_sync.crm_provider}).`);
        
        setMessages(prev => [...prev, {
          sender: 'ai',
          message: data.response,
          timestamp: new Date().toLocaleTimeString()
        }]);
        
        addCliLog("[sys] Message processing sequence completed.");
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Backend server not running. Falling back to offline client-side heuristic logic simulation.", e);
    }
    
    // OFFLINE HEURISTIC SIMULATOR (Ensures landing playground works even without backend running!)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let localSentiment = 'Neutral';
    let localScoreChange = 0;
    
    // Heuristic sentiment & scoring rules
    if (cleanText.match(/cancel|terrible|crashed|crash|fail|refund|frustrated/)) {
      localSentiment = 'Frustrated';
      localScoreChange = -15;
    } else if (cleanText.match(/urgent|immediately|asap|invoice|payment|buy|onboard/)) {
      localSentiment = 'Urgent';
      localScoreChange = 15;
    } else if (cleanText.match(/excited|perfect|great|love|awesome|happy/)) {
      localSentiment = 'Excited';
      localScoreChange = 8;
    } else if (cleanText.match(/expensive|cost|budget|price|pricing|discount/)) {
      localSentiment = 'Hesitant';
      localScoreChange = -5;
    }
    
    // Extra keyword adjustments
    if (cleanText.match(/sso|saml|security|auth/)) {
      localScoreChange += 10;
    }
    if (cleanText.match(/demo|meeting|call|schedule/)) {
      localScoreChange += 8;
    }
    
    const newScore = Math.max(0, Math.min(100, leadScore + localScoreChange));
    let localProb = newScore / 100.0;
    const mult = localSentiment === 'Urgent' ? 1.15 : localSentiment === 'Excited' ? 1.1 : localSentiment === 'Hesitant' ? 0.85 : localSentiment === 'Frustrated' ? 0.5 : 1.0;
    localProb = Math.max(0.05, Math.min(0.99, localProb * mult));
    
    const localRisk = localSentiment === 'Frustrated' ? 'High' : newScore < 40 || localSentiment === 'Hesitant' ? 'Medium' : 'Low';
    const localStatus = localSentiment === 'Frustrated' ? 'escalated' : newScore >= 80 ? 'nurturing' : status;
    
    setSentiment(localSentiment);
    setLeadScore(newScore);
    setProb(localProb);
    setRisk(localRisk);
    setStatus(localStatus);
    
    addCliLog(`[node:offline] sentiment classified: ${localSentiment}`);
    addCliLog(`[node:offline] adjusted lead score: ${newScore} (${localScoreChange >= 0 ? '+' : ''}${localScoreChange})`);
    addCliLog(`[node:offline] conversion prob: ${Math.round(localProb * 100)}% | Churn risk: ${localRisk}`);
    
    // Heuristic offline reply content
    let replyText = "Thanks for reaching out! FlowPilot AI helps your sales teams automate pipeline recovery and objection handling. I'd love to organize a convenient time to schedule a product demo.";
    
    if (cleanText.match(/sso|saml|security|auth/)) {
      replyText = "Our enterprise plan includes comprehensive SAML 2.0 Single Sign-On (SSO) support compatible with Okta, Azure AD, and Ping Identity. We also provide full security compliance documentation and SOC 2 Type II validation. Would you like to connect with our security engineer to review your requirements?";
    } else if (cleanText.match(/expensive|cost|budget|price|pricing|discount/)) {
      replyText = "I completely understand that budget is an important consideration. To help you evaluate the ROI of FlowPilot AI, we can offer a customized pilot package or a 15% discount for your first three months. Alternatively, we have a flexible startup tier. Would you be open to a quick chat to find a model that fits your budget?";
    } else if (cleanText.match(/cancel|terrible|crashed|crash|fail|refund|frustrated/)) {
      replyText = "I'm so sorry to hear you're having trouble and wanting to cancel. I've paused my automated replies and escalated this to our senior support team. A representative will contact you at your email address within the hour to resolve any issues. Thank you for your patience.";
      addCliLog("[workflow:offline] wf-3 frustration escalation activated: replies PAUSED, ticket generated, support queue alerted.");
    }
    
    if (newScore >= 80 && localSentiment !== 'Frustrated') {
      addCliLog(`[workflow:offline] wf-2 triggered: Hot Lead score of ${newScore}! Slack alerts sent to channel #sales-alerts.`);
    }
    
    addCliLog("[sys:offline] Simulated outbound HubSpot CRM webhook sync completed.");
    
    setMessages(prev => [...prev, {
      sender: 'ai',
      message: replyText,
      timestamp: new Date().toLocaleTimeString()
    }]);
    
    addCliLog("[sys:offline] Message sequence completed.");
    setIsLoading(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@flowpilot.ai' && password === 'admin') {
      router.push('/dashboard');
    } else {
      setLoginError('Invalid credentials. Please use the prefilled admin credentials.');
    }
  };

  return (
    <div className={styles.container}>
      <div className="radial-glow" style={{ top: '-10%', left: '10%' }}></div>
      <div className="radial-glow-pink" style={{ bottom: '-15%', right: '15%' }}></div>
      
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <Sparkles size={24} color="var(--accent-cyan)" />
          <span>FlowPilot<span className={styles.logoSpan}>AI</span></span>
        </div>
        <button 
          onClick={() => setIsLoginOpen(true)} 
          className="glass-button"
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          <LogIn size={16} />
          <span>Admin Portal</span>
        </button>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.badge}>
          Revenue Operations & Pipeline Recovery
        </div>
        <h1 className={styles.title}>
          Never lose another deal to <br />
          <span className={styles.gradientText}>slow follow-ups or buying roadblocks</span>
        </h1>
        <p className={styles.subtitle}>
          FlowPilot AI is a state-of-the-art, autonomous sales operations assistant powered by LangGraph. It automatically intercepts objections, qualifies leads, updates CRMs, and escalates customer frustration instantly.
        </p>
        <button 
          onClick={() => setIsLoginOpen(true)} 
          className="glass-button glow-pulsing"
          style={{ margin: '0 auto', padding: '12px 24px', fontSize: '16px', border: '1px solid var(--accent-cyan)' }}
        >
          <span>Launch Command Console</span>
          <ArrowRight size={18} />
        </button>
      </section>

      {/* Playplay Interactive Sandbox */}
      <section className={styles.playgroundSection}>
        <h2 className={styles.playgroundTitle}>
          <Terminal size={22} color="var(--accent-cyan)" />
          <span>Interactive Objection-Handling Sandbox</span>
        </h2>
        
        <div className={styles.grid}>
          {/* Left Pane: Chat Interface */}
          <div className={`${styles.chatPane} glass-panel`}>
            <div className={styles.chatHeader}>
              <Sparkles size={16} color="var(--accent-cyan)" />
              <span>FlowPilot SDR Simulator</span>
            </div>
            
            <div className={styles.triggerButtons}>
              <button 
                onClick={() => handlePresetObjection('sso')}
                className={`${styles.objectionBtn} ${objectionType === 'sso' ? styles.activeObjectionBtn : ''}`}
              >
                🔒 Security / SSO
              </button>
              <button 
                onClick={() => handlePresetObjection('price')}
                className={`${styles.objectionBtn} ${objectionType === 'price' ? styles.activeObjectionBtn : ''}`}
              >
                💰 Pricing Objection
              </button>
              <button 
                onClick={() => handlePresetObjection('cancel')}
                className={`${styles.objectionBtn} ${objectionType === 'cancel' ? styles.activeObjectionBtnPink : ''}`}
                style={{ borderColor: objectionType === 'cancel' ? 'var(--accent-pink)' : '' }}
              >
                🚨 Frustrated Escalation
              </button>
            </div>

            <div className={styles.chatHistory}>
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`${styles.messageBubble} ${
                    msg.sender === 'client' ? styles.messageClient : styles.messageAi
                  }`}
                >
                  {msg.message}
                </div>
              ))}
              {isLoading && (
                <div className={`${styles.messageBubble} ${styles.messageAi}`} style={{ opacity: 0.6 }}>
                  FlowPilot is thinking...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(inputText);
              }} 
              className={styles.chatInputArea}
            >
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask FlowPilot an objection or type custom inquiry..."
                className={`${styles.chatInput} glass-input`}
              />
              <button type="submit" className="glass-button" style={{ padding: '12px' }}>
                <Play size={16} />
              </button>
            </form>
          </div>

          {/* Right Pane: Diagnostic Metrics & CLI logs */}
          <div className={`${styles.diagnosticsPane} glass-panel`}>
            <span className={styles.sectionTitle}>Real-time Agent States</span>
            
            <div className={styles.diagnosticsMetrics}>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Detected Sentiment</div>
                <div className={styles.metricValue} style={{ 
                  color: sentiment === 'Excited' ? 'var(--status-excited)' :
                         sentiment === 'Hesitant' ? 'var(--status-hesitant)' :
                         sentiment === 'Urgent' ? 'var(--status-urgent)' :
                         sentiment === 'Frustrated' ? 'var(--status-frustrated)' : '#fff'
                }}>
                  {sentiment}
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Lead Score</div>
                <div className={styles.metricValue} style={{ 
                  color: leadScore >= 80 ? 'var(--status-excited)' : leadScore < 40 ? 'var(--status-frustrated)' : '#fff'
                }}>
                  {leadScore} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/100</span>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Conversion Rate</div>
                <div className={styles.metricValue}>
                  {Math.round(prob * 100)}%
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Risk Profile</div>
                <div className={styles.metricValue} style={{ 
                  color: risk === 'High' ? 'var(--status-frustrated)' : risk === 'Medium' ? 'var(--status-hesitant)' : 'var(--status-excited)'
                }}>
                  {risk}
                </div>
              </div>
            </div>

            <span className={styles.sectionTitle}>LangGraph Node Execution Logs</span>
            <div className={styles.cliConsole}>
              {cliLogs.slice(-10).map((log, idx) => {
                let className = '';
                if (log.includes('[sys]')) className = styles.cliInfo;
                else if (log.includes('[node]')) className = styles.cliSuccess;
                else if (log.includes('[workflow]')) className = styles.cliWarning;
                else if (log.includes('offline')) className = styles.cliDanger;
                
                return (
                  <div key={idx} className={`${styles.cliLine} ${className}`}>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      {/* Footer copyright */}
      <footer className={styles.footerText}>
        &copy; 2026 FlowPilot AI. All rights reserved. <br />
        Disclaimer: This platform operates as an autonomous simulation environment. All CRM synchronizations and actions are modeled.
      </footer>

      {/* Login Modal */}
      {isLoginOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} glass-panel`}>
            <h3 className={styles.modalTitle}>Sign In</h3>
            <p className={styles.modalSubtitle}>Access the Operations Command Center</p>
            
            <form onSubmit={handleLoginSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Password</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

              {loginError && (
                <div style={{ color: 'var(--status-frustrated)', fontSize: '13px', marginBottom: '12px' }}>
                  {loginError}
                </div>
              )}

              <div className={styles.formGroup} style={{ marginTop: '12px' }}>
                <p className={styles.hint}>
                  💡 Pre-filled credentials: <br />
                  Email: <strong>admin@flowpilot.ai</strong> <br />
                  Password: <strong>admin</strong>
                </p>
              </div>

              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  onClick={() => setIsLoginOpen(false)}
                  className="glass-button"
                  style={{ background: 'transparent' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="glass-button"
                  style={{ background: 'var(--accent-cyan)', color: '#000', borderColor: 'var(--accent-cyan)' }}
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
