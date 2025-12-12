import React from 'react';
import { GlassCard, GlassButton } from '../components/ui/Glass';
import { Check } from 'lucide-react';

const PlanCard = ({ name, price, features, current = false, recommended = false }: any) => (
  <GlassCard className={`p-6 flex flex-col relative ${current ? 'ring-1 ring-slate-900 bg-slate-50' : ''}`}>
    <div className="flex justify-between items-start">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">{name}</h3>
        {recommended && (
            <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                Popular
            </span>
        )}
    </div>
    <div className="mt-4 mb-6 flex items-baseline gap-1">
      <span className="text-3xl font-bold text-slate-900">₹{price}</span>
      <span className="text-slate-500 text-sm">/mo</span>
    </div>
    <ul className="space-y-3 mb-8 flex-1">
      {features.map((feat: string, i: number) => (
        <li key={i} className="flex items-center gap-3 text-xs text-slate-600">
          <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <Check size={10} strokeWidth={3} />
          </div>
          {feat}
        </li>
      ))}
    </ul>
    <GlassButton variant={current ? 'outline' : 'primary'} className="w-full">
        {current ? 'Current Plan' : 'Upgrade Plan'}
    </GlassButton>
  </GlassCard>
);

const Billing: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Pricing Plans</h2>
        <p className="text-slate-500 text-sm">Choose the workspace plan that fits your team size.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlanCard 
            name="Starter" 
            price="0" 
            features={['Up to 50 leads', 'Basic Kanban', '1 Team Member']} 
        />
        <PlanCard 
            name="Pro" 
            price="2,499" 
            current={true}
            recommended={true}
            features={['Unlimited leads', 'Advanced Analytics', '5 Team Members', 'Email Integration']} 
        />
        <PlanCard 
            name="Business" 
            price="7,999" 
            features={['Unlimited Team', 'API Access', 'Dedicated Support', 'Custom Pipelines']} 
        />
      </div>

      <div className="mt-10">
          <GlassCard className="p-6 flex flex-col sm:flex-row justify-between items-center bg-slate-50 gap-4">
              <div className="text-center sm:text-left">
                  <h4 className="text-sm font-semibold text-slate-900">Payment Method</h4>
                  <p className="text-xs text-slate-500 mt-1">Visa ending in 4242 • Expires 12/25</p>
              </div>
              <GlassButton variant="outline" className="w-full sm:w-auto">Update Card</GlassButton>
          </GlassCard>
      </div>
    </div>
  );
};

export default Billing;