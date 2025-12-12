import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Calendar } from 'lucide-react';
import { GlassCard } from '../components/ui/Glass';
import { crmService } from '../services/crmService';
import { Lead, KPI } from '../types';
import { PIPELINE_STAGES } from '../constants';

const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = crmService.subscribe((data) => {
      setLeads(data);
      calculateMetrics(data);
    });
    return () => unsubscribe();
  }, []);

  const calculateMetrics = (data: Lead[]) => {
    // 1. Total Revenue (Won deals)
    const wonLeads = data.filter(l => l.stage === 'Won');
    const totalRevenue = wonLeads.reduce((acc, curr) => acc + curr.value, 0);

    // 2. Active Leads (Not Won or Lost)
    const activeLeads = data.filter(l => l.stage !== 'Won' && l.stage !== 'Lost');
    
    // 3. Win Rate
    const closedLeads = data.filter(l => l.stage === 'Won' || l.stage === 'Lost');
    // If no explicit lost, assume 'Won' vs 'Total' or just a dummy calculation for demo if no lost data
    const winRate = data.length > 0 ? (wonLeads.length / data.length) * 100 : 0;

    // 4. Avg Deal Size
    const avgDealSize = data.length > 0 
      ? data.reduce((acc, curr) => acc + curr.value, 0) / data.length 
      : 0;

    // Format Currency
    const format = (n: number) => new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumSignificantDigits: 3, notation: 'compact'
    }).format(n);

    const newKpis: KPI[] = [
      { label: 'Total Revenue', value: format(totalRevenue), change: '+12.5%', trend: 'up' },
      { label: 'Active Leads', value: activeLeads.length.toString(), change: '+4', trend: 'up' },
      { label: 'Win Rate', value: `${Math.round(winRate)}%`, change: '-2.1%', trend: 'down' },
      { label: 'Avg Deal Size', value: format(avgDealSize), change: '+5.4%', trend: 'up' },
    ];
    setKpis(newKpis);

    // Calculate Chart Data (Pipeline Value by Stage)
    const stageData = PIPELINE_STAGES.map(stage => {
      const value = data
        .filter(l => l.stage === stage.id)
        .reduce((sum, l) => sum + l.value, 0);
      return {
        name: stage.title,
        value: value,
        count: data.filter(l => l.stage === stage.id).length
      };
    });
    setChartData(stageData);
  };

  const recentLeads = [...leads].slice(0, 5); // Just take first 5 as mock is static order

  return (
    <div className="flex flex-col gap-6 pb-10">
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <GlassCard key={index} className="p-5 flex flex-col justify-between h-28">
             <div className="flex justify-between items-start">
               <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{kpi.label}</p>
               <div className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${kpi.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {kpi.trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  <span>{kpi.change}</span>
               </div>
             </div>
             <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">{kpi.value}</h3>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <GlassCard className="col-span-2 p-6 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-semibold text-slate-800">Pipeline Value by Stage</h3>
            <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50">
                    <Calendar size={12} />
                    <span>Real-time</span>
                </button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 11}} 
                    dy={10} 
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 11}} 
                    tickFormatter={(value) => 
                        new Intl.NumberFormat('en-IN', { notation: "compact", compactDisplay: "short" }).format(value)
                    }
                />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} 
                  itemStyle={{ color: '#0f172a', fontSize: '12px', fontWeight: 500 }}
                  formatter={(value: number) => [
                    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value),
                    'Value'
                  ]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#0f172a" fillOpacity={0.8} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Recent Activity / Feed */}
        <GlassCard className="p-0 flex flex-col overflow-hidden h-[400px]">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-semibold text-slate-800">Recent Leads</h3>
            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-md transition-colors cursor-pointer group border border-transparent hover:border-slate-100">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0 shadow-sm">
                  {lead.owner}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-medium text-slate-900">{lead.name}</span> <span className="text-slate-400">({lead.company})</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-600`}>
                        {lead.stage}
                      </span>
                      <span className="text-[10px] text-slate-400">{lead.lastActivity}</span>
                  </div>
                </div>
                <div className="text-[10px] font-medium text-slate-900">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(lead.value)}
                </div>
              </div>
            ))}
            {recentLeads.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">No recent activity</div>
            )}
          </div>
          <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
            <button className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors">View All Leads</button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;