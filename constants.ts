import { Lead, PipelineStage, KPI, ChartData } from './types';

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'New', title: 'New', color: 'bg-slate-200 text-slate-700', order: 1 },
  { id: 'Contacted', title: 'Contacted', color: 'bg-orange-100 text-orange-700', order: 2 },
  { id: 'Qualified', title: 'Qualified', color: 'bg-yellow-100 text-yellow-700', order: 3 },
  { id: 'Proposal', title: 'Proposal', color: 'bg-blue-100 text-blue-700', order: 4 },
  { id: 'Negotiation', title: 'Negotiation', color: 'bg-purple-100 text-purple-700', order: 5 },
  { id: 'Won', title: 'Won', color: 'bg-emerald-100 text-emerald-700', order: 6 },
];

export const MOCK_LEADS: Lead[] = [
  { id: '1', name: 'Arjun Mehta', company: 'Nexus Tech', email: 'arjun@nexus.com', value: 850000, stage: 'New', owner: 'JD', lastActivity: '2h ago', tags: ['Inbound'] },
  { id: '2', name: 'Priya Sharma', company: 'Global Corp', email: 'priya@global.com', value: 420000, stage: 'Contacted', owner: 'JD', lastActivity: '1d ago', tags: ['Referral'] },
  { id: '3', name: 'Rohan Gupta', company: 'SoftSystems', email: 'rohan@soft.com', value: 1250000, stage: 'Qualified', owner: 'AS', lastActivity: '4h ago', tags: ['Enterprise'] },
  { id: '4', name: 'Divya Singh', company: 'Amazonia', email: 'divya@amazonia.com', value: 3500000, stage: 'Proposal', owner: 'JD', lastActivity: '30m ago', tags: ['Enterprise', 'Hot'] },
  { id: '5', name: 'Evan Wright', company: 'Wright Logic', email: 'evan@wright.com', value: 180000, stage: 'Negotiation', owner: 'AS', lastActivity: '2d ago' },
  { id: '6', name: 'Fatima Khan', company: 'EcoLabs', email: 'fatima@eco.com', value: 750000, stage: 'Won', owner: 'JD', lastActivity: '1w ago', tags: ['Green Tech'] },
  { id: '7', name: 'George Hall', company: 'Hall Dynamics', email: 'george@hall.com', value: 320000, stage: 'New', owner: 'AS', lastActivity: '5m ago' },
  { id: '8', name: 'Sneha Patel', company: 'Skyline Arch', email: 'sneha@skyline.com', value: 2100000, stage: 'Proposal', owner: 'JD', lastActivity: '1h ago' },
];

export const MOCK_KPIS: KPI[] = [
  { label: 'Total Revenue', value: '₹1.25Cr', change: '+12.5%', trend: 'up' },
  { label: 'Active Leads', value: '24', change: '+4', trend: 'up' },
  { label: 'Win Rate', value: '68%', change: '-2.1%', trend: 'down' },
  { label: 'Avg Deal Size', value: '₹4.5L', change: '+5.4%', trend: 'up' },
];

export const REVENUE_DATA: ChartData[] = [
  { name: 'Jan', value: 320000 },
  { name: 'Feb', value: 240000 },
  { name: 'Mar', value: 160000 },
  { name: 'Apr', value: 220000 },
  { name: 'May', value: 150000 },
  { name: 'Jun', value: 190000 },
  { name: 'Jul', value: 280000 },
];