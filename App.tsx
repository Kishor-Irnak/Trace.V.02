import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Leads from './pages/Leads';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import { LeadDrawer } from './components/LeadDrawer';
import { UserProfile } from './types';

const App: React.FC = () => {
  const basePath = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  const allowedPaths = ['/', '/pipeline', '/leads', '/billing', '/settings'];

  const normalizeAppPath = (pathname: string) => {
    const withoutBase = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname;
    const appPath = withoutBase.startsWith('/') ? withoutBase : `/${withoutBase}`;
    return allowedPaths.includes(appPath) ? appPath : '/';
  };

  const buildFullPath = (appPath: string) => {
    const normalized = appPath.startsWith('/') ? appPath : `/${appPath}`;
    return `${basePath || ''}${normalized}`;
  };

  const [currentPath, setCurrentPath] = useState<string>(() => normalizeAppPath(window.location.pathname));
  const [isLeadDrawerOpen, setIsLeadDrawerOpen] = useState(false);

  // User State for Real-time Profile Updates
  const [user, setUser] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'JD',
    plan: 'Pro Workspace'
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizeAppPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    const appPath = allowedPaths.includes(path) ? path : '/';
    const fullPath = buildFullPath(appPath);
    try {
      window.history.pushState({}, '', fullPath);
    } catch (e) {
      // Ignore SecurityError in restricted environments (e.g. iframe/blob)
      console.debug('Navigation URL update suppressed:', e);
    }
    setCurrentPath(appPath);
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/': return <Dashboard />;
      case '/pipeline': return <Pipeline />;
      case '/leads': return <Leads />;
      case '/billing': return <Billing />;
      case '/settings': return <Settings user={user} onUpdateUser={setUser} />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      <Layout 
        onNewLead={() => setIsLeadDrawerOpen(true)}
        currentPath={currentPath}
        onNavigate={navigate}
        user={user}
      >
        {renderPage()}
      </Layout>
      
      <LeadDrawer 
        isOpen={isLeadDrawerOpen} 
        onClose={() => setIsLeadDrawerOpen(false)} 
      />
    </>
  );
};

export default App;