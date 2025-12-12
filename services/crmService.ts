import { Lead, LeadStatus } from '../types';
import { MOCK_LEADS } from '../constants';

// In a real app, this would initialize Firebase
// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection, getDocs, ... } from 'firebase/firestore';

class CrmService {
  private leads: Lead[] = [...MOCK_LEADS];
  private listeners: ((leads: Lead[]) => void)[] = [];

  constructor() {
    // Simulate loading delay/realtime connection
    console.log('CRM Service Initialized');
  }

  // Subscribe to changes (Simulating Firestore onSnapshot)
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
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.leads]), 500);
    });
  }

  async updateLeadStage(leadId: string, newStage: LeadStatus): Promise<void> {
    const leadIndex = this.leads.findIndex(l => l.id === leadId);
    if (leadIndex > -1) {
      this.leads[leadIndex] = { ...this.leads[leadIndex], stage: newStage, lastActivity: 'Just now' };
      this.notify();
    }
  }

  async addLead(lead: Omit<Lead, 'id'>): Promise<void> {
    const newLead = { ...lead, id: Math.random().toString(36).substr(2, 9) };
    this.leads.push(newLead);
    this.notify();
  }

  async deleteLead(id: string): Promise<void> {
    this.leads = this.leads.filter(l => l.id !== id);
    this.notify();
  }
}

export const crmService = new CrmService();
