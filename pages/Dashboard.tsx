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
} from "lucide-react";
import { GlassCard } from "../components/ui/Glass";
import { crmService } from "../services/crmService";
import { authService } from "../services/authService";
import { Lead, KPI } from "../types";
import { PIPELINE_STAGES } from "../constants";

const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  /* ================= AUTH-SAFE DATA ================= */
  useEffect(() => {
    let unsubscribeLeads: (() => void) | null = null;

    const unsubAuth = authService.onChange((user) => {
      if (!user) {
        setLeads([]);
        setKpis([]);
        setChartData([]);
        unsubscribeLeads?.();
        unsubscribeLeads = null;
        return;
      }

      unsubscribeLeads = crmService.subscribeLeads((data) => {
        setLeads(data);
        calculateMetrics(data);
      });
    });

    return () => {
      unsubAuth();
      unsubscribeLeads?.();
    };
  }, []);

  /* ================= METRICS ================= */

  const calculateMetrics = (data: Lead[]) => {
    const wonLeads = data.filter((l) => l.stage === "Won");
    const totalRevenue = wonLeads.reduce((acc, curr) => acc + curr.value, 0);

    const activeLeads = data.filter(
      (l) => l.stage !== "Won" && l.stage !== "Lost"
    );

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
        label: "Active Leads",
        value: activeLeads.length.toString(),
        change: "+4",
        trend: "up",
      },
      {
        label: "Win Rate",
        value: `${Math.round(winRate)}%`,
        change: "-2.1%",
        trend: "down",
      },
      {
        label: "Avg Deal Size",
        value: format(avgDealSize),
        change: "+5.4%",
        trend: "up",
      },
    ];
    setKpis(newKpis);

    const stageData = PIPELINE_STAGES.map((stage) => {
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

  /* ================= UI (UNCHANGED) ================= */

  return (
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
        {/* Chart */}
        <GlassCard className="col-span-2 p-6 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-semibold text-slate-800">
              Pipeline Value by Stage
            </h3>
            <button className="flex items-center gap-2 px-3 py-1.5 border rounded-md text-xs">
              <Calendar size={12} />
              Real-time
            </button>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis axisLine={false} tickLine={false} dataKey="name" />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill="#0f172a" fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Recent Leads */}
        <GlassCard className="p-0 flex flex-col overflow-hidden h-[400px]">
          <div className="p-4 border-b flex justify-between">
            <h3 className="text-sm font-semibold">Recent Leads</h3>
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
  );
};

export default Dashboard;
