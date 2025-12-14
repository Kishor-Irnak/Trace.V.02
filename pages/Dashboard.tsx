import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  User,
  Stethoscope,
  Cog,
  ChevronRight,
  Info,
  MoreHorizontal, // <--- Added missing import here
} from "lucide-react";
import { GlassCard } from "../components/ui/Glass";
import { crmService } from "../services/crmService";
import { projectService, Task } from "../services/projectService";
import { authService } from "../services/authService";
import { Lead, KPI } from "../types";
import { ROLE_TEMPLATES } from "../templates";

// --- Role Details Configuration ---
const ROLE_DETAILS: Record<
  string,
  {
    label: string;
    icon: any;
    tagline: string;
    benefits: string[];
    features: string[];
  }
> = {
  sales: {
    label: "Sales & Business",
    icon: Building2,
    tagline: "Close deals faster with a conversion-focused pipeline.",
    benefits: [
      "Track revenue and deal probability instantly.",
      "Manage negotiations and contracts efficiently.",
      "Prioritize high-value leads automatically.",
    ],
    features: ["Lead Scoring", "Revenue Forecasting", "Contact Management"],
  },
  student: {
    label: "Student / Learner",
    icon: User,
    tagline: "Organize your academic journey and career opportunities.",
    benefits: [
      "Track internship applications and interview stages.",
      "Manage assignment deadlines like a pro.",
      "Keep contacts for professors and mentors.",
    ],
    features: [
      "Application Tracker",
      "Deadline Alerts",
      "Simple Portfolio CRM",
    ],
  },
  doctor: {
    label: "Doctor / Clinic",
    icon: Stethoscope,
    tagline: "Patient-centric workflow for modern private practices.",
    benefits: [
      "Streamline patient intake and follow-ups.",
      "Visualize treatment progress stages.",
      "Reduce no-shows with better scheduling oversight.",
    ],
    features: ["Patient History", "Appointment Pipeline", "Treatment Tracking"],
  },
  engineer: {
    label: "Engineer / Developer",
    icon: Cog,
    tagline: "Agile-inspired tracking for builders and creators.",
    benefits: [
      "Move from 'Requirements' to 'Live' smoothly.",
      "Track sprints, bugs, and feature requests.",
      "Manage freelance client deliverables.",
    ],
    features: ["Sprint Boards", "Issue Tracking", "Deployment Stages"],
  },
};

// --- Advanced Onboarding Modal (Responsive) ---
const OnboardingModal = ({
  onSelect,
}: {
  onSelect: (role: string) => void;
}) => {
  const [selected, setSelected] = useState<string>("sales");

  const currentDetails = ROLE_DETAILS[selected];
  const CurrentIcon = currentDetails.icon;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-300 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200 flex flex-col md:flex-row h-[85vh] md:h-[600px] max-h-[90vh]">
        {/* LEFT: Selection Menu */}
        <div className="w-full h-1/3 md:w-1/3 md:h-full bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 md:p-6 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              Welcome
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your workspace type.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {Object.entries(ROLE_DETAILS).map(([key, role]) => {
              const Icon = role.icon;
              const isSelected = selected === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 border
                    ${
                      isSelected
                        ? "bg-white border-slate-900 shadow-md ring-1 ring-slate-900/5"
                        : "bg-transparent border-transparent hover:bg-slate-100 hover:border-slate-200 text-slate-500"
                    }`}
                >
                  <div
                    className={`p-2 rounded-md ${
                      isSelected
                        ? "bg-slate-900 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <span
                      className={`block text-sm font-bold ${
                        isSelected ? "text-slate-900" : "text-slate-600"
                      }`}
                    >
                      {role.label}
                    </span>
                  </div>
                  {isSelected && (
                    <ChevronRight size={16} className="text-slate-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Preview Pane */}
        <div className="w-full h-2/3 md:w-2/3 md:h-full bg-white flex flex-col overflow-hidden">
          <div className="flex-1 p-6 md:p-10 flex flex-col overflow-y-auto custom-scrollbar">
            <div className="mb-4 md:mb-6">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
                <CurrentIcon size={24} className="text-white md:w-7 md:h-7" />
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
              {currentDetails.label} Workspace
            </h3>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-6 md:mb-8 border-b border-slate-100 pb-4 md:pb-6">
              {currentDetails.tagline}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Why this fits
                </h4>
                <ul className="space-y-3">
                  {currentDetails.benefits.map((benefit, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-xs md:text-sm text-slate-600"
                    >
                      <CheckCircle2
                        size={16}
                        className="text-slate-900 min-w-[16px] mt-0.5"
                      />
                      <span className="leading-snug">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="hidden md:block">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Included Views
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentDetails.features.map((feat, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-md text-xs font-medium text-slate-700"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-400 text-center md:text-left">
              <Info size={14} className="min-w-[14px]" />
              <span>
                Tip: Change later in <strong>Settings &gt; Workspace</strong>.
              </span>
            </div>

            <button
              onClick={() => onSelect(selected)}
              className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 group"
            >
              Get Started
              <ArrowUpRight
                size={16}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [taskStatusData, setTaskStatusData] = useState<any[]>([]);

  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    let unsubscribeLeads: (() => void) | null = null;
    let unsubscribeTasks: (() => void) | null = null;
    let unsubscribeSettings: (() => void) | null = null;

    const unsubAuth = authService.onChange((user) => {
      if (!user) {
        setLeads([]);
        setTasks([]);
        return;
      }

      unsubscribeSettings = crmService.subscribeSettings((settings) => {
        if (settings && settings.role) {
          setCurrentRole(settings.role);
          setShowOnboarding(false);
        } else {
          setShowOnboarding(true);
        }
      });

      unsubscribeLeads = crmService.subscribeLeads(setLeads);
      unsubscribeTasks = projectService.subscribeTasks(setTasks);
    });

    return () => {
      unsubAuth();
      unsubscribeLeads?.();
      unsubscribeTasks?.();
      unsubscribeSettings?.();
    };
  }, []);

  useEffect(() => {
    if (leads.length > 0 || tasks.length > 0 || currentRole) {
      calculateMetrics();
    }
  }, [leads, tasks, currentRole]);

  const handleRoleSelect = async (role: string) => {
    await crmService.saveUserRole(role);
    setCurrentRole(role);
    setShowOnboarding(false);
  };

  const calculateMetrics = () => {
    const totalRevenue = leads.reduce(
      (acc, curr) => acc + (curr.value || 0),
      0
    );
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const taskCompletionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const activeLeads = leads.filter(
      (l) => !["Won", "Lost", "Paid", "Discharged"].includes(l.stage)
    );

    const format = (n: number) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(n);

    setKpis([
      {
        label: "Total Pipeline Value",
        value: format(totalRevenue),
        change: "+12%",
        trend: "up",
        icon: DollarSign,
        color: "text-emerald-600 bg-emerald-50",
      },
      {
        label: "Active Deals",
        value: activeLeads.length.toString(),
        change: `${activeLeads.length > 5 ? "High" : "Normal"}`,
        trend: "up",
        icon: Briefcase,
        color: "text-blue-600 bg-blue-50",
      },
      {
        label: "Project Velocity",
        value: `${Math.round(taskCompletionRate)}%`,
        change: "Completion",
        trend: taskCompletionRate > 50 ? "up" : "down",
        icon: Activity,
        color: "text-purple-600 bg-purple-50",
      },
      {
        label: "Pending Tasks",
        value: (totalTasks - completedTasks).toString(),
        change: "Urgent",
        trend: "down",
        icon: Clock,
        color: "text-orange-600 bg-orange-50",
      },
    ]);

    const trend = leads.slice(0, 10).map((l, i) => ({
      name: `W${i + 1}`,
      value: l.value || 0,
      cumulative: leads
        .slice(0, i + 1)
        .reduce((sum, item) => sum + (item.value || 0), 0),
    }));
    setRevenueData(trend);

    const statusCounts = { todo: 0, inprogress: 0, review: 0, done: 0 };
    tasks.forEach((t) => {
      if (t.status === "in-progress") statusCounts.inprogress++;
      else if (
        statusCounts[t.status as keyof typeof statusCounts] !== undefined
      )
        statusCounts[t.status as keyof typeof statusCounts]++;
    });
    setTaskStatusData(
      [
        { name: "To Do", value: statusCounts.todo, color: "#94a3b8" },
        {
          name: "In Progress",
          value: statusCounts.inprogress,
          color: "#3b82f6",
        },
        { name: "Review", value: statusCounts.review, color: "#8b5cf6" },
        { name: "Done", value: statusCounts.done, color: "#10b981" },
      ].filter((d) => d.value > 0)
    );
  };

  const stalledLeads = leads
    .filter((l) => {
      const lastDate = l.lastActivity ? new Date(l.lastActivity) : new Date();
      const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 7 && !["Won", "Lost"].includes(l.stage);
    })
    .slice(0, 4);

  return (
    <>
      {showOnboarding && <OnboardingModal onSelect={handleRoleSelect} />}

      <div className="flex flex-col gap-6 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {currentRole
                ? `${ROLE_TEMPLATES[currentRole]?.label} Overview`
                : "Dashboard"}
            </h2>
            <p className="text-sm text-slate-500">
              Here's what's happening in your workspace today.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon || Activity;
            return (
              <GlassCard
                key={index}
                className="p-5 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {kpi.label}
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                      {kpi.value}
                    </h3>
                  </div>
                  <div className={`p-2 rounded-lg ${kpi.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-500">
                  {kpi.trend === "up" ? (
                    <ArrowUpRight size={14} className="text-emerald-500" />
                  ) : (
                    <ArrowDownRight size={14} className="text-red-500" />
                  )}
                  <span
                    className={
                      kpi.trend === "up" ? "text-emerald-600" : "text-red-600"
                    }
                  >
                    {kpi.change}
                  </span>
                  <span className="opacity-60">vs last month</span>
                </div>
              </GlassCard>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="col-span-2 p-6 flex flex-col min-h-[350px]">
            <h3 className="text-sm font-bold text-slate-800 mb-6">
              Cumulative Value Growth
            </h3>
            <div className="flex-1 w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#0f172a"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="p-6 flex flex-col min-h-[350px]">
            <h3 className="text-sm font-bold text-slate-800 mb-2">
              Task Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Breakdown of current workload from Timeline.
            </p>
            <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-2xl font-bold text-slate-900">
                  {tasks.length}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">
                  Tasks
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {taskStatusData.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-slate-600"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  {item.name}: <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-0 flex flex-col h-[300px]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-red-50/30">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500" />
                <h3 className="text-sm font-bold text-slate-800">
                  Attention Needed
                </h3>
              </div>
              <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">
                Stalled &gt; 7 Days
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {stalledLeads.length > 0 ? (
                stalledLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">
                        !
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {lead.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {lead.stage} • {lead.company}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-700">
                        ₹{lead.value.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-red-400">Stalled</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <CheckCircle2 size={32} className="mb-2 text-emerald-200" />
                  <p className="text-xs">All clear! No stalled leads.</p>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-0 flex flex-col h-[300px]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">
                Recent Activity
              </h3>
              <MoreHorizontal size={16} className="text-slate-400" />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {leads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  className="flex justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {lead.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {lead.company}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    {lead.stage}
                  </div>
                </div>
              ))}
              {leads.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <p className="text-xs">No recent activity</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
