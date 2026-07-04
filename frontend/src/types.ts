export interface Message {
  sender: 'client' | 'ai' | 'system';
  message: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'new' | 'nurturing' | 'converted' | 'recovered' | 'lost' | 'escalated';
  lead_score: number;
  sentiment: string;
  conversion_probability: number;
  churn_risk: 'Low' | 'Medium' | 'High';
  pipeline_value: number;
  last_message_at: string;
  crm_synced: boolean;
  ai_summary: string;
  ai_reply_paused: boolean;
  conversation: Message[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  workflow_id: string;
  lead_id: string;
  description: string;
}

export interface SentimentDistribution {
  Excited: number;
  Hesitant: number;
  Urgent: number;
  Frustrated: number;
  Neutral: number;
}

export interface MilestoneData {
  name: string;
  recovered: number;
  leads: number;
}

export interface DashboardMetrics {
  total_pipeline: number;
  recovered_revenue: number;
  avg_conversion_prob: number;
  active_leads_count: number;
  total_leads_count: number;
  active_fraction_string: string;
  sentiment_counts: SentimentDistribution;
  milestones: MilestoneData[];
}
