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
  // Default to root path to avoid issues with blob URL paths in restricted environments
  const [currentPath, setCurrentPath] = useState('/');
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
      // In restricted environments, pathname might not reflect app route or might be a blob path
      // Only update if it looks like a valid app route
      const path = window.location.pathname;
      if (['/', '/pipeline', '/leads', '/billing', '/settings'].includes(path)) {
        setCurrentPath(path);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    try {
      window.history.pushState({}, '', path);
    } catch (e) {
      // Ignore SecurityError in restricted environments (e.g. iframe/blob)
      console.debug('Navigation URL update suppressed:', e);
    }
    setCurrentPath(path);
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