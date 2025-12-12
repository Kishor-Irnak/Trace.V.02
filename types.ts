export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  value: number;
  stage: LeadStatus;
  owner: string;
  lastActivity: string;
  avatar?: string;
  tags?: string[];
}

export interface PipelineStage {
  id: LeadStatus;
  title: string;
  color: string;
  order: number;
}

export interface KPI {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface ChartData {
  name: string;
  value: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string; // Initials
  plan: string;
}