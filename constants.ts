import { PipelineStage } from './types';

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'New', title: 'New', color: 'bg-slate-200 text-slate-700', order: 1 },
  { id: 'Contacted', title: 'Contacted', color: 'bg-orange-100 text-orange-700', order: 2 },
  { id: 'Qualified', title: 'Qualified', color: 'bg-yellow-100 text-yellow-700', order: 3 },
  { id: 'Proposal', title: 'Proposal', color: 'bg-blue-100 text-blue-700', order: 4 },
  { id: 'Negotiation', title: 'Negotiation', color: 'bg-purple-100 text-purple-700', order: 5 },
  { id: 'Won', title: 'Won', color: 'bg-emerald-100 text-emerald-700', order: 6 },
];