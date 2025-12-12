import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Leads from './pages/Leads';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import { Auth } from './pages/Auth';
import { LeadDrawer } from './components/LeadDrawer';
import { UserProfile } from './types';
import { authService } from './services/authService';

const App: React.FC = () => {
  const basePath = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  const allowedPaths = ['/', '/pipeline', '/leads', '/billing', '/settings'];

  const extractRedirectPath = () => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (!redirect) return null;
    try {
      const decoded = decodeURIComponent(redirect);
      return decoded;
    } catch {
      return redirect;
    }
  };

  const normalizeAppPath = (pathname: string) => {
    let cleanPath = pathname;
    if (basePath && basePath !== '/' && pathname.startsWith(basePath)) {
      cleanPath = pathname.slice(basePath.length);
    }
    // If redirect param exists, use that
    const redirectPath = extractRedirectPath();
    if (redirectPath) {
      cleanPath = redirectPath;
    }
    // Ensure leading slash
    const appPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    // Remove trailing slash (except root)
    const normalizedPath = appPath === '/' ? '/' : appPath.replace(/\/$/, '');
    return allowedPaths.includes(normalizedPath) ? normalizedPath : '/';
  };

  const buildFullPath = (appPath: string) => {
    const normalized = appPath.startsWith('/') ? appPath : `/${appPath}`;
    return `${basePath || ''}${normalized}`;
  };

  const [currentPath, setCurrentPath] = useState<string>(() => normalizeAppPath(window.location.pathname));
  const [isLeadDrawerOpen, setIsLeadDrawerOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // User State for Real-time Profile Updates
  const [user, setUser] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'JD',
    plan: 'Pro Workspace'
  });

  useEffect(() => {
    const updatePath = () => {
      const normalized = normalizeAppPath(window.location.pathname);
      setCurrentPath(normalized);
      // Clean redirect param from URL after processing
      const params = new URLSearchParams(window.location.search);
      if (params.has('redirect')) {
        params.delete('redirect');
        const newUrl = buildFullPath(normalized) + (params.toString() ? `?${params.toString()}` : '') + window.location.hash;
        try {
          window.history.replaceState({}, '', newUrl);
        } catch (e) {
          console.debug('Navigation URL update suppressed:', e);
        }
      }
    };

    // Initial path (handles redirect param)
    updatePath();

    const handlePopState = () => {
      updatePath();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [basePath]);

  useEffect(() => {
    const unsubscribe = authService.onChange((firebaseUser) => {
      if (firebaseUser) {
        const displayName =
          firebaseUser.displayName ||
          (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User');
        const initials = displayName
          .split(' ')
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();
        setUser({
          name: displayName,
          email: firebaseUser.email || '',
          avatar: initials || 'U',
          plan: 'Pro Workspace',
        });
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        // Clear session storage on logout
        sessionStorage.removeItem('hasVisitedApp');
      }
      setAuthLoading(false);
      setAuthError(null);
    });
    return () => unsubscribe();
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

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      // Reset path to root on logout
      setCurrentPath('/');
      const fullPath = buildFullPath('/');
      try {
        window.history.pushState({}, '', fullPath);
      } catch (e) {
        console.debug('Navigation URL update suppressed:', e);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <>
      {authLoading ? (
        <div className="min-h-screen flex items-center justify-center text-slate-600 text-sm">
          Loading...
        </div>
      ) : isAuthenticated ? (
        <>
          <Layout 
            onNewLead={() => setIsLeadDrawerOpen(true)}
            currentPath={currentPath}
            onNavigate={navigate}
            user={user}
            onSignOut={handleSignOut}
          >
            {renderPage()}
          </Layout>
          
          <LeadDrawer 
            isOpen={isLeadDrawerOpen} 
            onClose={() => setIsLeadDrawerOpen(false)} 
          />
        </>
      ) : (
        <Auth
          error={authError}
          onLogin={async (email, password) => {
            setAuthError(null);
            try {
              await authService.signIn(email, password);
            } catch (e: any) {
              setAuthError(e?.message || 'Failed to sign in');
            }
          }}
          onRegister={async (email, password, name) => {
            setAuthError(null);
            try {
              await authService.signUp(email, password, name);
            } catch (e: any) {
              setAuthError(e?.message || 'Failed to create account');
            }
          }}
          onGoogle={async () => {
            setAuthError(null);
            try {
              await authService.signInWithGoogle();
            } catch (e: any) {
              setAuthError(e?.message || 'Failed to sign in with Google');
            }
          }}
        />
      )}
    </>
  );
};

export default App;