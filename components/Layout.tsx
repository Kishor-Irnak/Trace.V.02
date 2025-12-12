import React, { useState } from 'react';
import { LayoutDashboard, Kanban, Users, CreditCard, Settings, Bell, Search, Plus, Menu, X } from 'lucide-react';
import { GlassButton } from './ui/Glass';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onNewLead: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
  user: UserProfile;
  onSignOut?: () => void;
}

const SidebarItem = ({ to, icon: Icon, label, isActive, onClick }: { to: string, icon: any, label: string, isActive: boolean, onClick: (path: string) => void }) => {
  return (
    <button 
      onClick={() => onClick(to)}
      className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 group text-left
        ${isActive 
          ? 'bg-slate-100 text-slate-900' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`
      }
    >
      <Icon size={16} strokeWidth={2} />
      <span>{label}</span>
    </button>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, onNewLead, currentPath, onNavigate, user, onSignOut }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getPageTitle = () => {
    switch (currentPath) {
      case '/': return 'Dashboard';
      case '/pipeline': return 'Pipeline';
      case '/leads': return 'Leads';
      case '/billing': return 'Billing';
      case '/settings': return 'Settings';
      default: return 'Trace';
    }
  };

  const handleNavigate = (path: string) => {
    onNavigate(path);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-background text-primary">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:h-full md:w-60 flex flex-col ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 px-2">
            <img 
              src="https://i.postimg.cc/QC67xcXT/T-logo.png" 
              alt="Trace Logo" 
              className="w-6 h-6 object-contain"
            />
            <span className="text-sm font-semibold tracking-tight">Trace</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
          
        <div className="px-4 mb-6">
            <button className="w-full flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-500 hover:border-slate-300 transition-colors text-left">
              <Search size={14} />
              <span>Search...</span>
              <span className="ml-auto text-[10px] bg-white border border-slate-200 px-1 rounded text-slate-400">⌘K</span>
            </button>
        </div>

        <nav className="flex flex-col gap-0.5 px-4">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" isActive={currentPath === '/'} onClick={handleNavigate} />
          <SidebarItem to="/pipeline" icon={Kanban} label="Pipeline" isActive={currentPath === '/pipeline'} onClick={handleNavigate} />
          <SidebarItem to="/leads" icon={Users} label="Leads" isActive={currentPath === '/leads'} onClick={handleNavigate} />
        </nav>

        <div className="mt-8 px-4">
          <h3 className="text-[11px] font-semibold text-slate-400 px-3 mb-2 uppercase tracking-wider">Settings</h3>
          <nav className="flex flex-col gap-0.5">
            <SidebarItem to="/billing" icon={CreditCard} label="Billing" isActive={currentPath === '/billing'} onClick={handleNavigate} />
            <SidebarItem to="/settings" icon={Settings} label="Configuration" isActive={currentPath === '/settings'} onClick={handleNavigate} />
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-border">
          <div className="flex items-center gap-2 px-1">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate text-slate-900">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.plan}</p>
            </div>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="text-[10px] font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 px-2 py-1 rounded-md transition"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-border bg-surface z-10 shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              className="md:hidden p-1 -ml-1 text-slate-500 hover:text-slate-800"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-semibold text-slate-800">{getPageTitle()}</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <button className="relative p-2 rounded-md hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800">
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="h-4 w-px bg-slate-200 mx-1"></div>
            <GlassButton onClick={onNewLead} className="!py-1.5 !px-3 !text-xs whitespace-nowrap">
              <Plus size={14} />
              <span className="hidden sm:inline">New Lead</span>
              <span className="sm:hidden">New</span>
            </GlassButton>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <div className="h-full max-w-[1600px] mx-auto">
              {children}
          </div>
        </div>
      </main>
    </div>
  );
};