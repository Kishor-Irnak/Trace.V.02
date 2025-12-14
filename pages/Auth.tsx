import React, { useState } from "react";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  LayoutDashboard,
  Kanban,
  TrendingUp,
} from "lucide-react";

interface AuthProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, name?: string) => Promise<void>;
  onGoogle: () => Promise<void>;
  error?: string | null;
}

export const Auth: React.FC<AuthProps> = ({
  onLogin,
  onRegister,
  onGoogle,
  error,
}) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await onLogin(email, password);
      } else {
        await onRegister(email, password, name);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Outer Container - Grey background with whitespace around the box
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Main Card - Floating Box Design */}
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[650px] border border-slate-200">
        {/* --- LEFT SIDE: FORM --- */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-between relative bg-white">
          {/* Header: Minimal "T" Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl font-serif">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Trace
            </span>
          </div>

          {/* Form Content */}
          <div className="max-w-sm w-full mx-auto my-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h1>
              <p className="text-slate-500 text-sm">
                {mode === "login"
                  ? "Please enter your details."
                  : "Start your 30-day free trial."}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "register" && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3.5 top-3 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-slate-400"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={mode === "register"}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-3 text-slate-400"
                    size={16}
                  />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-slate-400"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-3 text-slate-400"
                    size={16}
                  />
                  <input
                    type="password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-slate-400"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 bg-slate-50"
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    Remember me
                  </span>
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    className="text-xs font-bold text-slate-900 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>

              <button
                type="button"
                onClick={onGoogle}
                className="w-full py-3 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5 bg-white"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>
            </form>

            <p className="mt-6 text-xs text-slate-500 text-center">
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                className="text-slate-900 font-bold hover:underline"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Sign up for free" : "Log in"}
              </button>
            </p>
          </div>

          {/* Footer: Powered By */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Powered by
              </span>
              <span className="text-xs font-bold text-slate-800">
                Kishor Irnak
              </span>
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: CONTENT (Hidden on Mobile) --- */}
        <div className="hidden lg:flex w-1/2 bg-slate-950 relative flex-col justify-center p-16 text-white overflow-hidden">
          {/* Subtle Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-950"></div>

          {/* Content Container */}
          <div className="relative z-10 max-w-md ml-auto mr-auto">
            {/* Feature List (Styled like a menu) */}
            <div className="space-y-4">
              {/* Item 1 */}
              <div className="group p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-default">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg text-white">
                      <LayoutDashboard size={20} />
                    </div>
                    <span className="font-bold text-sm tracking-wide">
                      Role-Based Workspaces
                    </span>
                  </div>
                  <ArrowRight
                    size={16}
                    className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-slate-400"
                  />
                </div>
                <p className="text-xs text-slate-400 pl-11 leading-relaxed">
                  Tailored environments designed specifically for Sales,
                  Doctors, and Engineers.
                </p>
              </div>

              {/* Item 2 */}
              <div className="group p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-default">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg text-white">
                      <Kanban size={20} />
                    </div>
                    <span className="font-bold text-sm tracking-wide">
                      Visual Pipelines
                    </span>
                  </div>
                  <ArrowRight
                    size={16}
                    className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-slate-400"
                  />
                </div>
                <p className="text-xs text-slate-400 pl-11 leading-relaxed">
                  Drag-and-drop boards to track progress and keep deals moving
                  forward.
                </p>
              </div>

              {/* Item 3 */}
              <div className="group p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-default">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg text-white">
                      <TrendingUp size={20} />
                    </div>
                    <span className="font-bold text-sm tracking-wide">
                      Real-time Analytics
                    </span>
                  </div>
                  <ArrowRight
                    size={16}
                    className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-slate-400"
                  />
                </div>
                <p className="text-xs text-slate-400 pl-11 leading-relaxed">
                  Instant insights into revenue growth, task velocity, and team
                  performance.
                </p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
              <p className="text-xs text-slate-500">
                © 2024 Trace CRM. All rights reserved.
              </p>
              <div className="text-xs text-slate-500 font-medium">v2.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
