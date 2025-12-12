import React, { useEffect, useState } from 'react';
import { crmService } from '../services/crmService';
import { Lead } from '../types';
import { GlassCard, GlassButton } from '../components/ui/Glass';
import { Filter, ArrowUpDown, MoreHorizontal, Download } from 'lucide-react';

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const unsubscribe = crmService.subscribe(setLeads);
    return () => unsubscribe();
  }, []);

  const headers = ['Lead Name', 'Company', 'Stage', 'Value', 'Owner', 'Last Active', ''];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-900">All Leads</h2>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <GlassButton variant="outline" className="whitespace-nowrap"><Filter size={14} /> Filter</GlassButton>
            <GlassButton variant="outline" className="whitespace-nowrap"><ArrowUpDown size={14} /> Sort</GlassButton>
            <GlassButton variant="outline" className="whitespace-nowrap"><Download size={14} /> Export</GlassButton>
        </div>
      </div>

      <div className="border border-slate-200 rounded-md bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                  <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                          {lead.name.charAt(0)}
                      </div>
                      {lead.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{lead.company}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium border
                      ${lead.stage === 'Won' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                        lead.stage === 'New' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                      {lead.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {lead.value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] text-slate-600 font-bold">{lead.owner}</span>
                      </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{lead.lastActivity}</td>
                  <td className="px-4 py-3 text-right">
                      <button className="text-slate-400 hover:text-slate-600 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal size={16} />
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leads;