import React, { useState } from 'react';
import { X } from 'lucide-react';
import { GlassButton } from './ui/Glass';
import { crmService } from '../services/crmService';
import { PIPELINE_STAGES } from '../constants';
import { LeadStatus } from '../types';

interface LeadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    value: '',
    stage: 'New' as LeadStatus,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await crmService.addLead({
      name: formData.name,
      company: formData.company,
      email: formData.email,
      value: Number(formData.value),
      stage: formData.stage,
      owner: 'JD',
      lastActivity: 'Just now',
      tags: ['New']
    });
    setFormData({ name: '', company: '', email: '', value: '', stage: 'New' });
    onClose();
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/10 backdrop-blur-[1px] z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div className={`fixed top-2 right-2 bottom-2 w-full sm:w-[400px] bg-white rounded-lg shadow-2xl border border-slate-200 z-50 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-[110%]'}`}>
        <div className="h-full flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Create New Lead</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Name</label>
              <input 
                required
                type="text" 
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm transition-all placeholder:text-slate-300"
                placeholder="e.g. Arjun Mehta"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company</label>
              <input 
                required
                type="text" 
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm transition-all placeholder:text-slate-300"
                placeholder="e.g. Acme Corp"
                value={formData.company}
                onChange={e => setFormData({...formData, company: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <input 
                type="email" 
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm transition-all placeholder:text-slate-300"
                placeholder="arjun@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Value (₹)</label>
                <input 
                  type="number" 
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm transition-all placeholder:text-slate-300"
                  placeholder="0.00"
                  value={formData.value}
                  onChange={e => setFormData({...formData, value: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Stage</label>
                <select 
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm transition-all"
                  value={formData.stage}
                  onChange={e => setFormData({...formData, stage: e.target.value as LeadStatus})}
                >
                  {PIPELINE_STAGES.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </form>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-lg">
            <GlassButton variant="ghost" onClick={onClose}>Cancel</GlassButton>
            <GlassButton onClick={handleSubmit}>Create Lead</GlassButton>
          </div>
        </div>
      </div>
    </>
  );
};