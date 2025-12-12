import { Lead, LeadStatus } from '../types';
import { db } from './firebase';
import { onValue, push, ref, remove, set, update } from 'firebase/database';

class CrmService {
  private leads: Lead[] = [];
  private listeners: ((leads: Lead[]) => void)[] = [];
  private leadsRef = ref(db, 'leads');

  constructor() {
    // Realtime subscription to Firebase RTDB
    onValue(this.leadsRef, (snapshot) => {
      const data = snapshot.val() || {};
      this.leads = Object.entries(data).map(([id, value]) => ({ id, ...(value as Omit<Lead, 'id'>) }));
      this.notify();
    });
  }

  // Subscribe to changes
  subscribe(callback: (leads: Lead[]) => void) {
    this.listeners.push(callback);
    callback(this.leads);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(l => l([...this.leads]));
  }

  async getLeads(): Promise<Lead[]> {
    return [...this.leads];
  }

  async updateLeadStage(leadId: string, newStage: LeadStatus): Promise<void> {
    await update(ref(db, `leads/${leadId}`), { stage: newStage, lastActivity: 'Just now' });
  }

  async addLead(lead: Omit<Lead, 'id'>): Promise<void> {
    const newLeadRef = push(this.leadsRef);
    await set(newLeadRef, { ...lead, lastActivity: lead.lastActivity ?? 'Just now' });
  }

  async deleteLead(id: string): Promise<void> {
    await remove(ref(db, `leads/${id}`));
  }
}

export const crmService = new CrmService();
