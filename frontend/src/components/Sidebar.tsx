import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  Workflow, 
  BarChart3, 
  Presentation, 
  RotateCcw, 
  LogOut,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onResetDb: () => void;
  isResetting: boolean;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  onResetDb,
  isResetting
}: SidebarProps) {
  
  const menuItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'conversations', name: 'Conversations', icon: MessageSquareCode },
    { id: 'workflows', name: 'Workflows & Rules', icon: Workflow },
    { id: 'analytics', name: 'Pipeline Analytics', icon: BarChart3 },
    { id: 'pitch', name: 'Pitch & Arch', icon: Presentation },
  ];

  return (
    <aside style={styles.sidebar} className="glass-panel">
      <div style={styles.logoContainer}>
        <div style={styles.logoGlow}></div>
        <Sparkles size={24} color="var(--accent-cyan)" />
        <span style={styles.logoText}>FlowPilot<span style={styles.logoSubtext}>AI</span></span>
      </div>

      <nav style={styles.nav}>
        <ul style={styles.navList}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    ...styles.navButton,
                    ...(isActive ? styles.navButtonActive : {}),
                  }}
                  className={isActive ? "glow-pulsing" : ""}
                >
                  <Icon size={18} color={isActive ? "var(--accent-cyan)" : "var(--text-secondary)"} />
                  <span>{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div style={styles.footer}>
        <button 
          onClick={onResetDb} 
          disabled={isResetting}
          style={styles.actionButton}
          className="glass-button"
        >
          <RotateCcw size={16} className={isResetting ? "spin-animation" : ""} />
          <span>{isResetting ? 'Resetting...' : 'Reset Demo DB'}</span>
        </button>

        <button 
          onClick={onLogout} 
          style={{ ...styles.actionButton, marginTop: '8px' }}
          className="glass-button"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '260px',
    height: 'calc(100vh - 32px)',
    margin: '16px',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 10,
    borderRadius: '16px',
    border: '1px solid var(--glass-border)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px 24px 12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: '40px',
    height: '40px',
    background: 'radial-gradient(circle, rgba(0, 242, 254, 0.2) 0%, rgba(0,0,0,0) 70%)',
    left: '8px',
    top: '2px',
    pointerEvents: 'none',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    color: '#ffffff',
  },
  logoSubtext: {
    color: 'var(--accent-cyan)',
    fontWeight: 400,
    marginLeft: '2px',
  },
  nav: {
    flex: 1,
    marginTop: '32px',
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  navButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: '8px',
    padding: '12px 16px',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'var(--transition-smooth)',
  },
  navButtonActive: {
    color: '#ffffff',
    background: 'rgba(0, 242, 254, 0.06)',
    borderColor: 'rgba(0, 242, 254, 0.2)',
  },
  footer: {
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  actionButton: {
    justifyContent: 'center',
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
  }
};
