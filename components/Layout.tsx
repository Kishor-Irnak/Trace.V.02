import React, { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Kanban,
  Users,
  GanttChart,
  CreditCard,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  HelpCircle,
  FileSpreadsheet,
  Briefcase,
  MousePointer,
} from "lucide-react";

import { GlassButton } from "./ui/Glass";
import { UserProfile } from "../types";
// Import services and templates to get role info
import { crmService } from "../services/crmService";
import { ROLE_TEMPLATES } from "../templates";

interface LayoutProps {
  children: React.ReactNode;
  onNewLead: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
  user: UserProfile;
  onSignOut?: () => void;
}

const SidebarItem = ({
  to,
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  to: string;
  icon: any;
  label: string;
  isActive: boolean;
  onClick: (path: string) => void;
}) => {
  return (
    <button
      onClick={() => onClick(to)}
      className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 text-left
        ${
          isActive
            ? "bg-slate-100 text-slate-900"
            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
        }`}
    >
      <Icon size={16} strokeWidth={2} />
      <span>{label}</span>
    </button>
  );
};

export const Layout: React.FC<LayoutProps> = ({
  children,
  onNewLead,
  currentPath,
  onNavigate,
  user,
  onSignOut,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // NEW: State for current role to display in sidebar footer
  const [currentRole, setCurrentRole] = useState<string>("sales");

  const helpRef = useRef<HTMLDivElement>(null);

  // Close help dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setShowHelp(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // NEW: Subscribe to settings to update sidebar footer dynamically
  useEffect(() => {
    const unsubscribe = crmService.subscribeSettings((settings) => {
      if (settings && settings.role) {
        setCurrentRole(settings.role);
      }
    });
    return () => unsubscribe();
  }, []);

  const getPageTitle = () => {
    const path = currentPath.split("?")[0];
    switch (path) {
      case "/":
        return "Dashboard";
      case "/pipeline":
        return "Pipeline";
      case "/leads":
        return "Leads";
      case "/project-manager":
        return "Project Manager";
      case "/billing":
        return "Billing";
      case "/settings":
        return "Settings";
      default:
        return "Trace";
    }
  };

  const handleNavigate = (path: string) => {
    onNavigate(path);
    setIsSidebarOpen(false);
    setShowHelp(false);
  };

  const handleSettingsNavigation = (
    tab: "profile" | "workspace" | "notifications"
  ) => {
    localStorage.setItem("activeSettingsTab", tab);
    onNavigate("/settings");
    setShowHelp(false);
  };

  // Helper to get Role Icon and Label
  const getRoleDisplay = () => {
    const template = ROLE_TEMPLATES[currentRole] || ROLE_TEMPLATES.sales;
    const Icon = template.icon;
    // Clean up label (e.g. "Doctor / Clinic" -> "Doctor Workspace")
    const cleanLabel = template.label.split("/")[0].trim() + " Workspace";

    return { Icon, cleanLabel };
  };

  const { Icon: RoleIcon, cleanLabel } = getRoleDisplay();

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-background text-primary">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border transform transition-transform duration-300 md:static md:translate-x-0 md:w-60 flex flex-col
        ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
      >
        <div className="p-4 flex items-center justify-between">
          {/* LOGO UPDATE: Replaced Image with CSS 'T' Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg font-serif">T</span>
            </div>
            <span className="text-sm font-bold text-slate-900">Trace</span>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 mb-6">
          <button className="w-full flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-500 hover:border-slate-300 transition-colors">
            <Search size={14} />
            <span>Search...</span>
          </button>
        </div>

        <nav className="flex flex-col gap-0.5 px-4">
          <SidebarItem
            to="/"
            icon={LayoutDashboard}
            label="Dashboard"
            isActive={currentPath === "/"}
            onClick={handleNavigate}
          />
          <SidebarItem
            to="/pipeline"
            icon={Kanban}
            label="Pipeline"
            isActive={currentPath === "/pipeline"}
            onClick={handleNavigate}
          />
          <SidebarItem
            to="/leads"
            icon={Users}
            label="Leads"
            isActive={currentPath === "/leads"}
            onClick={handleNavigate}
          />
          <SidebarItem
            to="/project-manager"
            icon={GanttChart}
            label="Timeline"
            isActive={currentPath === "/project-manager"}
            onClick={handleNavigate}
          />
        </nav>

        <div className="mt-8 px-4">
          <h3 className="text-[11px] font-semibold text-slate-400 px-3 mb-2 uppercase">
            Settings
          </h3>
          <nav className="flex flex-col gap-0.5">
            <SidebarItem
              to="/billing"
              icon={CreditCard}
              label="Billing"
              isActive={currentPath === "/billing"}
              onClick={handleNavigate}
            />
            <SidebarItem
              to="/settings"
              icon={Settings}
              label="Configuration"
              isActive={currentPath === "/settings"}
              onClick={handleNavigate}
            />
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
              {user.avatar}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium truncate text-slate-900">
                {user.name}
              </p>
              <div
                className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSettingsNavigation("workspace")}
                title="Click to change workspace"
              >
                <RoleIcon size={10} />
                <span className="truncate">{cleanLabel}</span>
              </div>
            </div>
          </div>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="mt-3 w-full px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors"
            >
              Log Out
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center justify-between px-6 border-b bg-surface relative z-20">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-slate-500 hover:text-slate-700"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-semibold text-slate-800">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative" ref={helpRef}>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  showHelp
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
                title="Help & Information"
              >
                <HelpCircle size={18} />
              </button>

              {showHelp && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Quick Tips
                    </h4>
                    <button
                      onClick={() => setShowHelp(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex gap-3 text-xs text-slate-600">
                      <div className="mt-0.5 min-w-[20px] text-slate-900">
                        <Briefcase size={16} />
                      </div>
                      <div>
                        <strong className="text-slate-900 block mb-0.5">
                          Switch Roles
                        </strong>
                        Go to{" "}
                        <span
                          className="font-semibold cursor-pointer hover:text-slate-900 underline decoration-dotted"
                          onClick={() => handleSettingsNavigation("workspace")}
                        >
                          Settings &gt; Workspace
                        </span>{" "}
                        to switch modes.
                      </div>
                    </li>
                    <li className="flex gap-3 text-xs text-slate-600">
                      <div className="mt-0.5 min-w-[20px] text-slate-900">
                        <FileSpreadsheet size={16} />
                      </div>
                      <div>
                        <strong className="text-slate-900 block mb-0.5">
                          Data Management
                        </strong>
                        You can bulk Import CSVs or Export your data directly
                        from the{" "}
                        <span
                          className="font-semibold cursor-pointer hover:text-slate-900 underline decoration-dotted"
                          onClick={() => handleNavigate("/leads")}
                        >
                          Leads Page
                        </span>
                        .
                      </div>
                    </li>
                    <li className="flex gap-3 text-xs text-slate-600">
                      <div className="mt-0.5 min-w-[20px] text-slate-900">
                        <MousePointer size={16} />
                      </div>
                      <div>
                        <strong className="text-slate-900 block mb-0.5">
                          Easy Navigation
                        </strong>
                        Hold{" "}
                        <kbd className="bg-slate-100 border border-slate-300 px-1 rounded text-[10px] text-slate-700">
                          Right Click
                        </kbd>{" "}
                        to drag and scroll through the Pipeline views.
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            <button
              onClick={() => handleSettingsNavigation("notifications")}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all relative group"
              title="Notifications (in Settings)"
            >
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white group-hover:scale-125 transition-transform"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
};
