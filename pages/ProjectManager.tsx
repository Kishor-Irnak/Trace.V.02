import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Plus,
  Calendar as CalendarIcon,
  LayoutGrid,
  Clock,
  X,
  Trash2,
  Edit2,
  Save,
  PieChart as PieChartIcon,
  TrendingUp,
  DollarSign,
  Activity,
  MousePointer,
  CheckCircle2,
  CalendarDays,
  List,
  ArrowDown,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { projectService, Task, TaskStatus } from "../services/projectService";

// --- Configuration ---

const STATUS_CONFIG: Record<
  TaskStatus,
  {
    label: string;
    color: string;
    border: string;
    timelineStyle: string;
    chartColor: string;
  }
> = {
  todo: {
    label: "To Do",
    color: "bg-slate-100",
    border: "border-slate-200",
    timelineStyle: "bg-slate-100 border-slate-300 text-slate-700",
    chartColor: "#cbd5e1",
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-50 text-blue-700",
    border: "border-blue-100",
    timelineStyle: "bg-blue-100 border-blue-300 text-blue-800",
    chartColor: "#64748b",
  },
  review: {
    label: "Review",
    color: "bg-purple-50 text-purple-700",
    border: "border-purple-100",
    timelineStyle: "bg-purple-100 border-purple-300 text-purple-800",
    chartColor: "#334155",
  },
  done: {
    label: "Done",
    color: "bg-emerald-50 text-emerald-700",
    border: "border-emerald-100",
    timelineStyle: "bg-emerald-100 border-emerald-300 text-emerald-800",
    chartColor: "#0f172a",
  },
};

// --- Helpers ---

const getInitials = (name: string) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  const firstInitial = parts[0][0].toUpperCase();
  const lastInitial = parts[parts.length - 1][0].toUpperCase();
  return firstInitial + lastInitial;
};

const getColorForName = (name: string) => {
  const colors = [
    "bg-blue-600",
    "bg-emerald-600",
    "bg-purple-600",
    "bg-orange-600",
    "bg-pink-600",
    "bg-cyan-600",
    "bg-indigo-600",
    "bg-rose-600",
    "bg-teal-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getDaysArray = (start: Date, end: Date) => {
  const arr = [];
  const dt = new Date(start);
  while (dt <= end) {
    arr.push(new Date(dt));
    dt.setDate(dt.getDate() + 1);
  }
  return arr;
};

const getMonthsArray = (start: Date, end: Date) => {
  const months = [];
  const d = new Date(start);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);

  const endDate = new Date(end);
  endDate.setDate(1);
  endDate.setHours(0, 0, 0, 0);

  while (d <= endDate) {
    months.push(new Date(d));
    d.setMonth(d.getMonth() + 1);
  }
  return months;
};

// Helper to generate consistent keys for months (YYYY-MM) using LOCAL time
const getMonthKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

// --- Sub-Components ---

const Avatar = ({
  name,
  size = "sm",
}: {
  name: string;
  size?: "sm" | "md";
}) => {
  if (!name) return null;
  const initials = getInitials(name);
  const colorClass = getColorForName(name);
  const sizeClasses = size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";
  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center font-bold text-white ${colorClass} ring-2 ring-white shrink-0 shadow-sm`}
      title={name}
    >
      {initials}
    </div>
  );
};

const AvatarGroup = ({ names }: { names: string[] }) => {
  const safeNames = Array.isArray(names) ? names : [];
  if (safeNames.length === 0) return <div className="h-6"></div>;
  return (
    <div className="flex -space-x-2 overflow-hidden px-1 py-0.5">
      {safeNames.slice(0, 3).map((name, i) => (
        <Avatar key={`${name}-${i}`} name={name} />
      ))}
      {safeNames.length > 3 && (
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-100 text-[9px] font-bold text-slate-500 ring-2 ring-white shrink-0">
          +{safeNames.length - 3}
        </div>
      )}
    </div>
  );
};

const MultiSelectUser = ({
  selectedUsers,
  allKnownUsers,
  onChange,
}: {
  selectedUsers: string[];
  allKnownUsers: string[];
  onChange: (users: string[]) => void;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const safeSelectedUsers = Array.isArray(selectedUsers) ? selectedUsers : [];

  useEffect(() => {
    if (inputValue.trim() === "") {
      setSuggestions([]);
      return;
    }
    const filtered = allKnownUsers.filter(
      (u) =>
        u.toLowerCase().includes(inputValue.toLowerCase()) &&
        !safeSelectedUsers.includes(u)
    );
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [inputValue, allKnownUsers, safeSelectedUsers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addUser = (name: string) => {
    const cleanName = name.trim().replace(/\s+/g, " ");
    if (cleanName && !safeSelectedUsers.includes(cleanName)) {
      onChange([...safeSelectedUsers, cleanName]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeUser = (name: string) => {
    onChange(safeSelectedUsers.filter((u) => u !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        addUser(inputValue.trim());
      } else if (suggestions.length > 0) {
        addUser(suggestions[0]);
      }
    } else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      safeSelectedUsers.length > 0
    ) {
      removeUser(safeSelectedUsers[safeSelectedUsers.length - 1]);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addUser(inputValue.trim());
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg min-h-[42px] focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:bg-white transition-all">
        {safeSelectedUsers.map((user, i) => (
          <span
            key={`${user}-${i}`}
            className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-700 shadow-sm"
          >
            <div
              className={`w-2 h-2 rounded-full ${getColorForName(user)}`}
            ></div>
            {user}
            <button
              type="button"
              onClick={() => removeUser(user)}
              className="text-slate-400 hover:text-red-500 ml-1"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-slate-400"
          placeholder={
            safeSelectedUsers.length === 0 ? "Type name..." : "Add another..."
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => {
            if (inputValue || allKnownUsers.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
      </div>

      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((name, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onMouseDown={(e) => {
                e.preventDefault();
                addUser(name);
              }}
            >
              <div
                className={`w-2 h-2 rounded-full ${getColorForName(name)}`}
              ></div>
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 transform transition-all scale-100">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// --- Main Component ---

const ProjectManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentView, setCurrentView] = useState<
    "timeline" | "board" | "analytics" | "calendar"
  >("timeline");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [projectName, setProjectName] = useState("Q4 Engineering Sprint");
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const projectNameInputRef = useRef<HTMLInputElement>(null);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    status: "todo",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    value: 0,
    assignees: [],
  });

  // --- Subscriptions ---

  useEffect(() => {
    const unsubscribe = projectService.subscribeTasks((data) => {
      setTasks(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = projectService.subscribeProjectName((name) => {
      setProjectName(name);
    });
    return () => unsubscribe();
  }, []);

  const handleProjectNameSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await projectService.updateProjectName(projectName);
    setIsEditingProjectName(false);
  };

  useEffect(() => {
    if (isEditingProjectName && projectNameInputRef.current) {
      projectNameInputRef.current.focus();
    }
  }, [isEditingProjectName]);

  const allKnownUsers = useMemo(() => {
    const names = new Set<string>();
    tasks.forEach((t) => {
      if (t.assignees && Array.isArray(t.assignees)) {
        t.assignees.forEach((a) => names.add(a));
      }
    });
    return Array.from(names).sort();
  }, [tasks]);

  // --- CRUD Handlers ---

  const handleOpenCreateModal = () => {
    setEditingTaskId(null);
    setFormData({
      title: "",
      status: "todo",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      value: 0,
      assignees: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setFormData({
      ...task,
      assignees: Array.isArray(task.assignees) ? task.assignees : [],
      value: task.value,
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();

    const safeAssignees = Array.isArray(formData.assignees)
      ? formData.assignees
      : [];

    const taskData: any = {
      title: formData.title || "Untitled Task",
      value: Number(formData.value) || 0,
      status: (formData.status as TaskStatus) || "todo",
      assignees: safeAssignees,
      startDate: formData.startDate || new Date().toISOString().split("T")[0],
      endDate: formData.endDate || new Date().toISOString().split("T")[0],
    };

    try {
      if (editingTaskId) {
        await projectService.updateTask(editingTaskId, taskData);
      } else {
        await projectService.addTask(taskData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save task", error);
      alert("Failed to save task. Please try again.");
    }
  };

  const handleDeleteTask = async () => {
    if (editingTaskId) {
      if (window.confirm("Are you sure you want to delete this task?")) {
        await projectService.deleteTask(editingTaskId);
        setIsModalOpen(false);
      }
    }
  };

  // --- Drag & Drop (Generic) ---
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropStatus = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      await projectService.updateTask(draggedTaskId, { status });
    }
    setDraggedTaskId(null);
  };

  // --- Views ---

  const AnalyticsView = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const totalValue = tasks.reduce((acc, t) => acc + t.value, 0);
    const avgValue = totalTasks > 0 ? totalValue / totalTasks : 0;

    const statusData = Object.keys(STATUS_CONFIG)
      .map((key) => {
        const status = key as TaskStatus;
        return {
          name: STATUS_CONFIG[status].label,
          value: tasks.filter((t) => t.status === status).length,
          color: STATUS_CONFIG[status].chartColor,
        };
      })
      .filter((d) => d.value > 0);

    const valueByStatusData = Object.keys(STATUS_CONFIG).map((key) => {
      const status = key as TaskStatus;
      return {
        name: STATUS_CONFIG[status].label,
        amount: tasks
          .filter((t) => t.status === status)
          .reduce((acc, t) => acc + t.value, 0),
        fill: STATUS_CONFIG[status].chartColor,
      };
    });

    const workloadData: Record<string, number> = {};
    tasks.forEach((task) => {
      if (task.assignees && Array.isArray(task.assignees)) {
        task.assignees.forEach((person) => {
          workloadData[person] = (workloadData[person] || 0) + 1;
        });
      }
    });

    const workloadChartData = Object.entries(workloadData)
      .map(([name, count]) => ({
        name,
        tasks: count,
      }))
      .sort((a, b) => b.tasks - a.tasks);

    const kpiColor = {
      primary: "text-slate-900",
      secondary: "bg-slate-50 text-slate-700",
      success: "text-emerald-600",
      iconBg: "bg-slate-100 text-slate-700",
    };

    return (
      <div className="h-full overflow-y-auto p-6 bg-slate-50/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Value
                </p>
                <h3 className={`text-2xl font-bold ${kpiColor.primary} mt-1`}>
                  {formatCurrency(totalValue)}
                </h3>
              </div>
              <div className={`p-2 rounded-lg ${kpiColor.iconBg}`}>
                <DollarSign size={20} />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500 font-medium">
              Avg: {formatCurrency(avgValue)} per task
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Completion
                </p>
                <h3 className={`text-2xl font-bold ${kpiColor.primary} mt-1`}>
                  {completionRate}%
                </h3>
              </div>
              <div className={`p-2 rounded-lg ${kpiColor.iconBg}`}>
                <Activity size={20} />
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4">
              <div
                className="bg-slate-900 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Tasks
                </p>
                <h3 className={`text-2xl font-bold ${kpiColor.primary} mt-1`}>
                  {totalTasks}
                </h3>
              </div>
              <div className={`p-2 rounded-lg ${kpiColor.iconBg}`}>
                <LayoutGrid size={20} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <span
                className={`text-xs px-2 py-1 rounded font-medium ${kpiColor.secondary}`}
              >
                {tasks.filter((t) => t.status === "in-progress").length} Active
              </span>
              <span
                className={`text-xs px-2 py-1 rounded font-medium ${kpiColor.secondary}`}
              >
                {tasks.filter((t) => t.status === "todo").length} Pending
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Velocity
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  On Track
                </h3>
              </div>
              <div className={`p-2 rounded-lg ${kpiColor.iconBg}`}>
                <TrendingUp size={20} />
              </div>
            </div>
            <div
              className={`mt-4 text-xs font-medium flex items-center gap-1 ${kpiColor.success}`}
            >
              <CheckCircle2 size={12} /> Based on deadlines
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-6">
              Task Status Distribution
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                    itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-6">
              Project Value by Stage
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={valueByStatusData}>
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
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-6">
          <h4 className="text-sm font-bold text-slate-800 mb-6">
            Workload by Person
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={workloadChartData}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f1f5f9"
                />
                <XAxis type="number" axisLine={false} tickLine={false} hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#334155", fontWeight: 500 }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                />
                <Bar
                  dataKey="tasks"
                  fill="#1e293b"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const BoardView = () => {
    // Refs for Drag-to-Scroll
    const boardContainerRef = useRef<HTMLDivElement>(null);
    const [isBoardDragging, setIsBoardDragging] = useState(false);
    const boardDragStart = useRef({ x: 0, left: 0 });

    const handleBoardMouseDown = (e: React.MouseEvent) => {
      if (e.button === 2 && boardContainerRef.current) {
        e.preventDefault();
        setIsBoardDragging(true);
        boardDragStart.current = {
          x: e.pageX,
          left: boardContainerRef.current.scrollLeft,
        };
      }
    };

    const handleBoardMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!isBoardDragging || !boardContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX;
        const walk = (x - boardDragStart.current.x) * 1.5;
        boardContainerRef.current.scrollLeft =
          boardDragStart.current.left - walk;
      },
      [isBoardDragging]
    );

    const handleBoardMouseUp = useCallback(() => {
      setIsBoardDragging(false);
    }, []);

    useEffect(() => {
      if (isBoardDragging) {
        window.addEventListener("mousemove", handleBoardMouseMove);
        window.addEventListener("mouseup", handleBoardMouseUp);
      } else {
        window.removeEventListener("mousemove", handleBoardMouseMove);
        window.removeEventListener("mouseup", handleBoardMouseUp);
      }
      return () => {
        window.removeEventListener("mousemove", handleBoardMouseMove);
        window.removeEventListener("mouseup", handleBoardMouseUp);
      };
    }, [isBoardDragging, handleBoardMouseMove, handleBoardMouseUp]);

    return (
      <div className="h-full flex flex-col relative overflow-hidden">
        <div
          ref={boardContainerRef}
          className={`flex h-full overflow-x-auto gap-6 p-6 min-w-full select-none ${
            isBoardDragging ? "cursor-grabbing" : "cursor-default"
          }`}
          onMouseDown={handleBoardMouseDown}
          onContextMenu={(e) => e.preventDefault()}
        >
          {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => {
            const status = statusKey as TaskStatus;
            const columnTasks = tasks.filter((t) => t.status === status);
            const totalValue = columnTasks.reduce((acc, t) => acc + t.value, 0);

            return (
              <div
                key={status}
                className={`flex-1 min-w-[280px] flex flex-col h-full rounded-xl bg-slate-50/50 border border-slate-200/50 transition-colors ${
                  editingTaskId ? "hover:bg-slate-100/80" : ""
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropStatus(e, status)}
              >
                <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${config.color
                        .split(" ")[0]
                        .replace("bg-", "bg-opacity-100 bg-")}`}
                    />
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      {config.label}
                    </h3>
                    <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={handleOpenCreateModal}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {totalValue > 0 && (
                    <div className="text-[10px] text-slate-400 font-medium text-right px-1">
                      Potential: {formatCurrency(totalValue)}
                    </div>
                  )}

                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => handleOpenEditModal(task)}
                      className="group bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing relative"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate max-w-[120px]">
                          {task.assignees && task.assignees.length > 0
                            ? task.assignees[0]
                            : "Unassigned"}
                          {task.assignees &&
                            task.assignees.length > 1 &&
                            ` +${task.assignees.length - 1}`}
                        </span>
                        <button
                          type="button"
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity"
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>

                      <h4 className="text-sm font-semibold text-slate-900 mb-3 leading-snug">
                        {task.title}
                      </h4>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                          <AvatarGroup names={task.assignees || []} />
                        </div>
                        {task.value > 0 && (
                          <span className="text-xs font-medium text-slate-600">
                            {formatCurrency(task.value)}
                          </span>
                        )}
                      </div>

                      <div
                        className={`mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                          new Date(task.endDate) < new Date()
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-slate-50 text-slate-500 border-slate-100"
                        }`}
                      >
                        <Clock size={10} />
                        {new Date(task.endDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-300 gap-1">
                      <span className="text-xs font-medium">No Tasks</span>
                      <span className="text-[10px] text-slate-200">
                        Drag items here
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Scroll Tip */}
        <div className="flex-none p-2 border-t border-slate-100 bg-white/70 backdrop-blur-sm flex items-center justify-center text-xs text-slate-500 font-medium z-30 relative">
          <MousePointer size={14} className="mr-2 text-slate-400" />
          Tip: Hold{" "}
          <kbd className="mx-1 px-1 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px]">
            Right Click
          </kbd>{" "}
          to drag board
        </div>
      </div>
    );
  };

  const TimelineView = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, left: 0 });
    const dayWidth = 60;

    const { earliestDate, latestDate, initialScrollPosition } = useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let minDate = new Date();
      let maxDate = new Date();

      if (tasks.length > 0) {
        minDate = new Date(tasks[0].startDate);
        maxDate = new Date(tasks[0].endDate);
        tasks.forEach((task) => {
          const start = new Date(task.startDate);
          const end = new Date(task.endDate);
          if (start < minDate) minDate = start;
          if (end > maxDate) maxDate = end;
        });
      }

      const bufferedMinDate = new Date(minDate);
      bufferedMinDate.setDate(bufferedMinDate.getDate() - 180);

      const bufferedMaxDate = new Date(maxDate);
      bufferedMaxDate.setDate(bufferedMaxDate.getDate() + 180);

      const daysFromStartToToday = Math.ceil(
        (today.getTime() - bufferedMinDate.getTime()) / (1000 * 3600 * 24)
      );
      const initialScroll =
        daysFromStartToToday * dayWidth - window.innerWidth / 2;

      return {
        earliestDate: bufferedMinDate,
        latestDate: bufferedMaxDate,
        initialScrollPosition: Math.max(0, initialScroll),
      };
    }, [tasks]);

    const dates = useMemo(
      () => getDaysArray(earliestDate, latestDate),
      [earliestDate, latestDate]
    );

    useEffect(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = initialScrollPosition;
      }
    }, [initialScrollPosition]);

    const handleMouseDown = (e: React.MouseEvent) => {
      if (e.button === 2 && scrollContainerRef.current) {
        e.preventDefault();
        setIsDragging(true);
        dragStart.current = {
          x: e.pageX,
          left: scrollContainerRef.current.scrollLeft,
        };
      }
    };

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX;
        const walk = (x - dragStart.current.x) * 1.5;
        scrollContainerRef.current.scrollLeft = dragStart.current.left - walk;
      },
      [isDragging]
    );

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    useEffect(() => {
      if (isDragging) {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
      } else {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      }
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
    };

    const getTaskStyle = (taskStart: string, taskEnd: string) => {
      const tStart = new Date(taskStart);
      tStart.setHours(0, 0, 0, 0);
      const tEnd = new Date(taskEnd);
      tEnd.setHours(0, 0, 0, 0);

      const startDiff =
        (tStart.getTime() - earliestDate.getTime()) / (1000 * 3600 * 24);
      const duration =
        (tEnd.getTime() - tStart.getTime()) / (1000 * 3600 * 24) + 1;

      return {
        left: `${startDiff * dayWidth}px`,
        width: `${Math.max(1, duration) * dayWidth}px`,
      };
    };

    return (
      <div className="flex-1 overflow-hidden relative flex flex-col h-full bg-white">
        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-auto relative custom-scrollbar select-none ${
            isDragging ? "cursor-grabbing" : "cursor-default"
          }`}
          onMouseDown={handleMouseDown}
          onContextMenu={handleContextMenu}
        >
          <div
            className="min-w-max pb-20"
            style={{ width: `${dates.length * dayWidth}px` }}
          >
            {/* Header */}
            <div className="flex sticky top-0 bg-white/95 backdrop-blur-sm z-20 border-b border-slate-200 shadow-sm">
              {dates.map((date, i) => {
                const isToday =
                  new Date().toDateString() === date.toDateString();
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                return (
                  <div
                    key={i}
                    className={`flex-shrink-0 flex flex-col items-center justify-end pb-2 h-14 border-r border-slate-50 ${
                      isWeekend ? "bg-slate-50/50" : ""
                    }`}
                    style={{ width: dayWidth }}
                  >
                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">
                      {date.toLocaleDateString("en-US", { weekday: "narrow" })}
                    </span>
                    <span
                      className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                        isToday
                          ? "bg-slate-900 text-white shadow-md"
                          : "text-slate-700"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Body */}
            <div className="relative pt-6 h-full">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex pointer-events-none h-full">
                {dates.map((date, i) => (
                  <div
                    key={i}
                    className={`flex-shrink-0 h-full border-r border-slate-100/80 ${
                      date.getDay() === 0 || date.getDay() === 6
                        ? "bg-slate-50/40"
                        : ""
                    }`}
                    style={{ width: dayWidth }}
                  ></div>
                ))}
              </div>

              {/* Today Line */}
              <div
                className="absolute top-0 bottom-0 w-px bg-blue-500 z-10 pointer-events-none"
                style={{
                  left: `${
                    ((new Date().getTime() - earliestDate.getTime()) /
                      (1000 * 3600 * 24)) *
                      dayWidth +
                    dayWidth / 2
                  }px`,
                }}
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full absolute -top-1 -left-[3.5px]"></div>
              </div>

              {/* Tasks */}
              <div className="space-y-3 px-0 relative z-10">
                {tasks.map((task) => {
                  const style = getTaskStyle(task.startDate, task.endDate);
                  return (
                    <div key={task.id} className="relative h-14 group">
                      <div
                        onClick={() => handleOpenEditModal(task)}
                        className={`absolute top-0 h-12 rounded-lg border shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all cursor-pointer flex flex-col justify-center px-3 overflow-hidden group hover:scale-[1.01] z-10 ${
                          STATUS_CONFIG[task.status].timelineStyle
                        }`}
                        style={{
                          left: style.left,
                          width: style.width,
                          minWidth: "140px",
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="truncate text-xs font-bold leading-none">
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center justify-between opacity-80">
                          <span className="text-[10px] font-semibold truncate max-w-[80px]">
                            {task.assignees && task.assignees.length > 0
                              ? task.assignees[0]
                              : "Unassigned"}
                            {task.assignees &&
                              task.assignees.length > 1 &&
                              ` +${task.assignees.length - 1}`}
                          </span>
                          {task.value > 0 && (
                            <span className="text-[9px] font-bold">
                              {formatCurrency(task.value)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="absolute top-6 left-0 right-0 border-b border-slate-50 -z-10 w-full pointer-events-none"></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Tip */}
        <div className="flex-none p-2 border-t border-slate-100 bg-white/70 backdrop-blur-sm flex items-center justify-center text-xs text-slate-500 font-medium z-30 relative">
          <MousePointer size={14} className="mr-2 text-slate-400" />
          Tip: Hold{" "}
          <kbd className="mx-1 px-1 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px]">
            Right Click
          </kbd>{" "}
          to drag timeline
        </div>
      </div>
    );
  };

  // --- NEW Calendar View (Vertical Scroll) ---
  const CalendarView = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ y: 0, top: 0 });
    const monthRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const [draggedTask, setDraggedTask] = useState<string | null>(null);
    const [showTodayButton, setShowTodayButton] = useState(false);

    // Dynamic Range: Determine start and end months from tasks
    const { startMonth, endMonth } = useMemo(() => {
      let minDate = new Date();
      let maxDate = new Date();

      if (tasks.length > 0) {
        minDate = new Date(tasks[0].startDate);
        maxDate = new Date(tasks[0].endDate);
        tasks.forEach((task) => {
          const start = new Date(task.startDate);
          const end = new Date(task.endDate);
          if (start < minDate) minDate = start;
          if (end > maxDate) maxDate = end;
        });
      }

      const bufferedStart = new Date(minDate);
      bufferedStart.setMonth(bufferedStart.getMonth() - 2);
      bufferedStart.setDate(1);

      const bufferedEnd = new Date(maxDate);
      bufferedEnd.setMonth(bufferedEnd.getMonth() + 4);
      bufferedEnd.setDate(1);

      return { startMonth: bufferedStart, endMonth: bufferedEnd };
    }, [tasks]);

    const months = useMemo(
      () => getMonthsArray(startMonth, endMonth),
      [startMonth, endMonth]
    );

    // Check visibility of "Today"
    const checkTodayVisibility = useCallback(() => {
      const todayKey = getMonthKey(new Date());
      const todayEl = monthRefs.current[todayKey];
      if (!todayEl) {
        setShowTodayButton(true);
        return;
      }

      const rect = todayEl.getBoundingClientRect();
      const containerRect = scrollContainerRef.current?.getBoundingClientRect();

      if (containerRect) {
        const isOutOfView =
          rect.bottom < containerRect.top || rect.top > containerRect.bottom;
        setShowTodayButton(isOutOfView);
      }
    }, [months]);

    useEffect(() => {
      const el = scrollContainerRef.current;
      if (el) {
        el.addEventListener("scroll", checkTodayVisibility);
        checkTodayVisibility();
      }
      return () => el?.removeEventListener("scroll", checkTodayVisibility);
    }, [checkTodayVisibility]);

    // Initial Scroll to Today
    useEffect(() => {
      setTimeout(() => scrollToToday(), 100);
    }, []);

    const scrollToToday = () => {
      const todayKey = getMonthKey(new Date());
      const el = monthRefs.current[todayKey];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    // Vertical Drag Logic
    const handleMouseDown = (e: React.MouseEvent) => {
      if (e.button === 2 && scrollContainerRef.current) {
        e.preventDefault();
        setIsDragging(true);
        dragStart.current = {
          y: e.pageY,
          top: scrollContainerRef.current.scrollTop,
        };
      }
    };

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const y = e.pageY;
        const walk = (y - dragStart.current.y) * 1.5;
        scrollContainerRef.current.scrollTop = dragStart.current.top - walk;
      },
      [isDragging]
    );

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    useEffect(() => {
      if (isDragging) {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
      } else {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      }
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Calendar Task Drag & Drop
    const handleTaskDragStart = (e: React.DragEvent, taskId: string) => {
      setDraggedTask(taskId);
      e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    const handleDropOnDay = async (e: React.DragEvent, date: Date) => {
      e.preventDefault();
      if (draggedTask) {
        const task = tasks.find((t) => t.id === draggedTask);
        if (task) {
          const oldStart = new Date(task.startDate);
          const oldEnd = new Date(task.endDate);
          const duration = oldEnd.getTime() - oldStart.getTime();

          const newStart = new Date(date);
          newStart.setHours(12, 0, 0, 0);
          const newEnd = new Date(newStart.getTime() + duration);

          await projectService.updateTask(draggedTask, {
            startDate: newStart.toISOString().split("T")[0],
            endDate: newEnd.toISOString().split("T")[0],
          });
        }
      }
      setDraggedTask(null);
    };

    // Helper to generate days
    const getDaysForMonth = (monthDate: Date) => {
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const days = [];

      for (let i = 0; i < firstDay.getDay(); i++) {
        days.push({
          date: new Date(year, month, -firstDay.getDay() + 1 + i),
          isCurrentMonth: false,
        });
      }
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({ date: new Date(year, month, i), isCurrentMonth: true });
      }
      while (days.length % 7 !== 0) {
        const d = new Date(
          year,
          month + 1,
          days.length - (firstDay.getDay() + lastDay.getDate()) + 1
        );
        days.push({ date: d, isCurrentMonth: false });
      }
      return days;
    };

    return (
      <div className="flex flex-col h-full bg-slate-50 relative">
        {/* Jump to Today - Conditional */}
        {showTodayButton && (
          <div className="absolute top-4 right-6 z-20 animate-in fade-in zoom-in duration-300">
            <button
              onClick={scrollToToday}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-all hover:scale-105"
            >
              <ArrowDown size={14} /> Jump to Today
            </button>
          </div>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-y-auto custom-scrollbar ${
            isDragging ? "cursor-grabbing" : "cursor-default"
          }`}
          onMouseDown={handleMouseDown}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="flex flex-col gap-8 p-6 pb-20 max-w-6xl mx-auto">
            {months.map((month) => {
              const days = getDaysForMonth(month);
              const monthKey = getMonthKey(month);

              return (
                <div
                  key={monthKey}
                  ref={(el) => (monthRefs.current[monthKey] = el)}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden scroll-mt-6"
                >
                  {/* Month Header */}
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">
                      {month.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h3>
                  </div>

                  {/* Weekday Header */}
                  <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (d) => (
                        <div
                          key={d}
                          className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wide"
                        >
                          {d}
                        </div>
                      )
                    )}
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-7 auto-rows-fr">
                    {days.map((day, idx) => {
                      const dayTasks = tasks.filter((t) => {
                        const start = new Date(t.startDate);
                        const end = new Date(t.endDate);
                        start.setHours(0, 0, 0, 0);
                        end.setHours(0, 0, 0, 0);
                        const current = new Date(day.date);
                        current.setHours(0, 0, 0, 0);
                        return current >= start && current <= end;
                      });

                      const isToday =
                        day.date.toDateString() === new Date().toDateString();

                      return (
                        <div
                          key={idx}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDropOnDay(e, day.date)}
                          className={`min-h-[100px] border-b border-r border-slate-100 p-1.5 flex flex-col gap-1 transition-colors ${
                            !day.isCurrentMonth
                              ? "bg-slate-50/30 text-slate-300"
                              : "bg-white"
                          } ${draggedTask ? "hover:bg-blue-50" : ""}`}
                        >
                          <span
                            className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                              isToday
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-700"
                            }`}
                          >
                            {day.date.getDate()}
                          </span>

                          <div className="flex-1 flex flex-col gap-1.5">
                            {dayTasks.map((task) => (
                              <div
                                key={task.id}
                                draggable
                                onDragStart={(e) =>
                                  handleTaskDragStart(e, task.id)
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditModal(task);
                                }}
                                className={`text-[10px] px-2 py-1 rounded-md border cursor-pointer truncate shadow-sm hover:scale-[1.02] transition-transform font-medium ${
                                  STATUS_CONFIG[task.status].color
                                } ${STATUS_CONFIG[task.status].border}`}
                                title={task.title}
                              >
                                {task.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll Tip */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/90 backdrop-blur-md border-t border-slate-200 flex items-center justify-center text-xs text-slate-500 font-medium z-10">
          <MousePointer size={14} className="mr-2 text-slate-400" />
          Tip: Hold{" "}
          <kbd className="mx-1 px-1 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px]">
            Right Click
          </kbd>{" "}
          to drag vertically
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden relative">
      {/* --- Top Header Navigation (Transparent) --- */}
      <header className="flex-none px-6 py-4 bg-transparent z-30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
              {currentView === "timeline" && <CalendarIcon size={20} />}
              {currentView === "board" && <LayoutGrid size={20} />}
              {currentView === "analytics" && <PieChartIcon size={20} />}
              {currentView === "calendar" && <CalendarDays size={20} />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Project Overview
              </h1>
              {/* Editable Project Name */}
              <div className="h-6 flex items-center">
                {isEditingProjectName ? (
                  <form
                    onSubmit={handleProjectNameSubmit}
                    className="flex items-center"
                  >
                    <input
                      ref={projectNameInputRef}
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      onBlur={handleProjectNameSubmit}
                      className="text-xs text-slate-700 font-medium bg-slate-50 border border-slate-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </form>
                ) : (
                  <div
                    onClick={() => setIsEditingProjectName(true)}
                    className="text-xs text-slate-500 font-medium cursor-pointer hover:text-blue-600 hover:bg-slate-50 px-1 -ml-1 rounded transition-all flex items-center gap-1 group"
                    title="Click to rename"
                  >
                    {projectName}
                    <Edit2
                      size={10}
                      className="opacity-0 group-hover:opacity-100"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* View Tabs */}
            <div className="ml-6 flex p-1 bg-slate-100 rounded-lg border border-slate-200 hidden sm:flex">
              <button
                onClick={() => setCurrentView("timeline")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  currentView === "timeline"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <CalendarIcon size={14} /> Timeline
              </button>
              <button
                onClick={() => setCurrentView("board")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  currentView === "board"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <LayoutGrid size={14} /> Board
              </button>
              <button
                onClick={() => setCurrentView("analytics")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  currentView === "analytics"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <PieChartIcon size={14} /> Analytics
              </button>
              <button
                onClick={() => setCurrentView("calendar")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  currentView === "calendar"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <CalendarDays size={14} /> Calendar
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={handleOpenCreateModal}
              className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-md flex items-center gap-2 border border-transparent"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-hidden relative bg-white border-t border-slate-200">
        {currentView === "timeline" && <TimelineView />}
        {currentView === "board" && <BoardView />}
        {currentView === "analytics" && <AnalyticsView />}
        {currentView === "calendar" && <CalendarView />}
      </main>

      {/* --- Bottom Right Floating Toggle (Timeline <-> Calendar) --- */}
      {(currentView === "timeline" || currentView === "calendar") && (
        <button
          onClick={() =>
            setCurrentView(currentView === "timeline" ? "calendar" : "timeline")
          }
          className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-full shadow-xl hover:bg-slate-800 hover:scale-105 transition-all group"
          title={
            currentView === "timeline"
              ? "Switch to Calendar View"
              : "Switch to Timeline View"
          }
        >
          {currentView === "timeline" ? (
            <CalendarDays size={24} />
          ) : (
            <CalendarIcon size={24} />
          )}
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {currentView === "timeline"
              ? "Switch to Calendar"
              : "Switch to Timeline"}
          </span>
        </button>
      )}

      {/* --- Add/Edit Task Modal --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTaskId ? "Edit Task" : "Create New Task"}
      >
        <form onSubmit={handleSaveTask} className="space-y-5">
          {/* ... Modal form content remains the same ... */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Task Name
            </label>
            <input
              required
              autoFocus
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white transition-all placeholder:text-slate-400"
              placeholder="What needs to be done?"
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Start Date
              </label>
              <input
                required
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Deadline
              </label>
              <input
                required
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assignees
            </label>
            <MultiSelectUser
              selectedUsers={formData.assignees || []}
              allKnownUsers={allKnownUsers}
              onChange={(users) =>
                setFormData({ ...formData, assignees: users })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Value (₹)
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all placeholder:text-slate-400"
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as TaskStatus,
                  })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all appearance-none"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            {editingTaskId && (
              <button
                type="button"
                onClick={handleDeleteTask}
                className="px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Delete
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`${
                editingTaskId ? "" : "flex-1"
              } px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${
                editingTaskId ? "flex-1" : "flex-1"
              } px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2`}
            >
              {editingTaskId ? <Save size={16} /> : <Plus size={16} />}{" "}
              {editingTaskId ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectManager;
