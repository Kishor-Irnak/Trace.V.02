import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { GlassCard } from "../components/ui/Glass";
import { crmService } from "../services/crmService";
import { authService } from "../services/authService";
import { Lead, KPI } from "../types";
import { ROLE_TEMPLATES } from "../templates"; // Import templates

// --- Onboarding Modal ---
const OnboardingModal = ({
  onSelect,
}: {
  onSelect: (role: string) => void;
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="p-8 text-center border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome to Trace
          </h2>
          <p className="text-slate-500 mt-2">
            Select a workspace template to configure your experience.
          </p>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.values(ROLE_TEMPLATES).map((template: any) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  onClick={() => onSelect(template.id)}
                  className="group relative flex flex-col p-6 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-xl cursor-pointer transition-all duration-200"
                >
                  <div
                    className={`w-12 h-12 rounded-lg ${template.color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon
                      className={`text-${template.color.split("-")[1]}-600`}
                      size={24}
                    />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">
                    {template.label}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 h-8">
                    {template.description}
                  </p>

                  <div className="space-y-1.5 pt-4 border-t border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Pipeline Stages
                    </p>
                    {template.stages.slice(0, 3).map((s: any) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-2 text-[11px] text-slate-500"
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${s.color}`}
                        ></div>
                        {s.title}
                      </div>
                    ))}
                    <div className="text-[10px] text-slate-400 pl-3.5 italic">
                      + {template.stages.length - 3} more
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
                    <CheckCircle2
                      size={24}
                      fill="currentColor"
                      className="text-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  /* ================= AUTH & DATA ================= */
  useEffect(() => {
    let unsubscribeLeads: (() => void) | null = null;
    let unsubscribeSettings: (() => void) | null = null;

    const unsubAuth = authService.onChange((user) => {
      if (!user) {
        setLeads([]);
        setKpis([]);
        setChartData([]);
        unsubscribeLeads?.();
        unsubscribeSettings?.();
        return;
      }

      // Check for user role
      unsubscribeSettings = crmService.subscribeSettings((settings) => {
        if (settings && settings.role) {
          setCurrentRole(settings.role);
          setShowOnboarding(false);
        } else {
          setShowOnboarding(true);
        }
      });

      unsubscribeLeads = crmService.subscribeLeads((data) => {
        setLeads(data);
      });
    });

    return () => {
      unsubAuth();
      unsubscribeLeads?.();
      unsubscribeSettings?.();
    };
  }, []);

  useEffect(() => {
    if (leads.length > 0 || currentRole) {
      calculateMetrics(leads, currentRole || "sales");
    }
  }, [leads, currentRole]);

  const handleRoleSelect = async (role: string) => {
    await crmService.saveUserRole(role);
    setCurrentRole(role);
    setShowOnboarding(false);
  };

  /* ================= METRICS ================= */
  const calculateMetrics = (data: Lead[], roleKey: string) => {
    const template = ROLE_TEMPLATES[roleKey] || ROLE_TEMPLATES.sales;
    const stages = template.stages;

    // Find "Won" equivalent stage
    const wonStageId =
      stages.find(
        (s: any) =>
          s.title.toLowerCase().includes("won") ||
          s.title.toLowerCase().includes("paid") ||
          s.title.toLowerCase().includes("discharged") ||
          s.title.toLowerCase().includes("offer")
      )?.id || "Won";

    const wonLeads = data.filter((l) => l.stage === wonStageId);
    const totalRevenue = wonLeads.reduce((acc, curr) => acc + curr.value, 0);
    const winRate = data.length > 0 ? (wonLeads.length / data.length) * 100 : 0;
    const avgDealSize =
      data.length > 0
        ? data.reduce((acc, curr) => acc + curr.value, 0) / data.length
        : 0;

    const format = (n: number) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumSignificantDigits: 3,
        notation: "compact",
      }).format(n);

    const newKpis: KPI[] = [
      {
        label: "Total Revenue",
        value: format(totalRevenue),
        change: "+12.5%",
        trend: "up",
      },
      {
        label: "Total Leads",
        value: data.length.toString(),
        change: "+4",
        trend: "up",
      },
      {
        label: "Conversion",
        value: `${Math.round(winRate)}%`,
        change: "-2.1%",
        trend: "down",
      },
      {
        label: "Avg Value",
        value: format(avgDealSize),
        change: "+5.4%",
        trend: "up",
      },
    ];
    setKpis(newKpis);

    const stageData = stages.map((stage: any) => {
      const value = data
        .filter((l) => l.stage === stage.id)
        .reduce((sum, l) => sum + l.value, 0);

      return {
        name: stage.title,
        value,
        count: data.filter((l) => l.stage === stage.id).length,
      };
    });

    setChartData(stageData);
  };

  const recentLeads = [...leads].slice(0, 5);

  return (
    <>
      {showOnboarding && <OnboardingModal onSelect={handleRoleSelect} />}

      <div className="flex flex-col gap-6 pb-10">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <GlassCard
              key={index}
              className="p-5 flex flex-col justify-between h-28"
            >
              <div className="flex justify-between items-start">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {kpi.label}
                </p>
                <div
                  className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    kpi.trend === "up"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {kpi.trend === "up" ? (
                    <ArrowUpRight size={10} />
                  ) : (
                    <ArrowDownRight size={10} />
                  )}
                  <span>{kpi.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">
                {kpi.value}
              </h3>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="col-span-2 p-6 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-semibold text-slate-800">
                Pipeline Overview
              </h3>
              <button className="flex items-center gap-2 px-3 py-1.5 border rounded-md text-xs">
                <Calendar size={12} /> Real-time
              </button>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  axisLine={false}
                  tickLine={false}
                  dataKey="name"
                  fontSize={12}
                />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill="#0f172a" fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="p-0 flex flex-col overflow-hidden h-[400px]">
            <div className="p-4 border-b flex justify-between">
              <h3 className="text-sm font-semibold">Recent Activity</h3>
              <MoreHorizontal size={16} />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex justify-between p-3 hover:bg-slate-50 rounded"
                >
                  <div>
                    <p className="text-xs font-semibold">{lead.name}</p>
                    <p className="text-[10px] text-slate-400">{lead.company}</p>
                  </div>
                  <div className="text-xs font-medium">
                    ₹{lead.value.toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
              {recentLeads.length === 0 && (
                <p className="text-xs text-center text-slate-400 p-4">
                  No recent activity
                </p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
