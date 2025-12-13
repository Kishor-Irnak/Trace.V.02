import React, { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import Leads from "./pages/Leads";
import ProjectManager from "./pages/ProjectManager";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import { Auth } from "./pages/Auth";
import { LeadDrawer } from "./components/LeadDrawer";
import { UserProfile } from "./types";
import { authService } from "./services/authService";

const App: React.FC = () => {
  /* -------------------- Routing Setup -------------------- */
  const basePath = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");

  // ✅ FIXED: correct spelling + lowercase URL
  const allowedPaths = [
    "/",
    "/pipeline",
    "/project-manager",
    "/leads",
    "/billing",
    "/settings",
  ];

  const extractRedirectPath = () => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (!redirect) return null;
    try {
      return decodeURIComponent(redirect);
    } catch {
      return redirect;
    }
  };

  const normalizeAppPath = (pathname: string) => {
    let cleanPath = pathname;

    if (basePath && basePath !== "/" && pathname.startsWith(basePath)) {
      cleanPath = pathname.slice(basePath.length);
    }

    const redirectPath = extractRedirectPath();
    if (redirectPath) cleanPath = redirectPath;

    const appPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    const normalizedPath = appPath === "/" ? "/" : appPath.replace(/\/$/, "");

    return allowedPaths.includes(normalizedPath) ? normalizedPath : "/";
  };

  const buildFullPath = (appPath: string) => {
    const normalized = appPath.startsWith("/") ? appPath : `/${appPath}`;
    return `${basePath}${normalized}`;
  };

  const [currentPath, setCurrentPath] = useState(() =>
    normalizeAppPath(window.location.pathname)
  );

  const [isLeadDrawerOpen, setIsLeadDrawerOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [user, setUser] = useState<UserProfile>({
    name: "John Doe",
    email: "john@example.com",
    avatar: "JD",
    plan: "Pro Workspace",
  });

  useEffect(() => {
    const updatePath = () => {
      const normalized = normalizeAppPath(window.location.pathname);
      setCurrentPath(normalized);
    };

    updatePath();
    window.addEventListener("popstate", updatePath);
    return () => window.removeEventListener("popstate", updatePath);
  }, [basePath]);

  useEffect(() => {
    const unsubscribe = authService.onChange((firebaseUser) => {
      if (firebaseUser) {
        const name =
          firebaseUser.displayName ||
          firebaseUser.email?.split("@")[0] ||
          "User";

        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        setUser({
          name,
          email: firebaseUser.email || "",
          avatar: initials,
          plan: "Pro Workspace",
        });

        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        sessionStorage.removeItem("hasVisitedApp");
      }

      setAuthLoading(false);
      setAuthError(null);
    });

    return () => unsubscribe();
  }, []);

  const navigate = (path: string) => {
    const safePath = allowedPaths.includes(path) ? path : "/";
    const fullPath = buildFullPath(safePath);

    window.history.pushState({}, "", fullPath);
    setCurrentPath(safePath);
  };

  /* -------------------- Page Renderer -------------------- */
  const renderPage = () => {
    switch (currentPath) {
      case "/":
        return <Dashboard />;
      case "/pipeline":
        return <Pipeline />;
      case "/leads":
        return <Leads />;
      case "/project-manager":
        return <ProjectManager />;
      case "/billing":
        return <Billing />;
      case "/settings":
        return <Settings user={user} onUpdateUser={setUser} />;
      default:
        return <Dashboard />;
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    navigate("/");
  };

  return (
    <>
      {authLoading ? (
        <div className="min-h-screen flex items-center justify-center text-sm">
          Loading...
        </div>
      ) : isAuthenticated ? (
        <>
          <Layout
            currentPath={currentPath}
            onNavigate={navigate}
            onNewLead={() => setIsLeadDrawerOpen(true)}
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
          onLogin={(email, password) =>
            authService
              .signIn(email, password)
              .catch((e) => setAuthError(e.message))
          }
          onRegister={(email, password, name) =>
            authService
              .signUp(email, password, name)
              .catch((e) => setAuthError(e.message))
          }
          onGoogle={() =>
            authService.signInWithGoogle().catch((e) => setAuthError(e.message))
          }
        />
      )}
    </>
  );
};

export default App;
