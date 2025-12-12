import React, { useState } from 'react';

interface AuthProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, name?: string) => Promise<void>;
  onGoogle: () => Promise<void>;
  error?: string | null;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, onGoogle, error }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        await onRegister(email, password, name);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md bg-white shadow-card rounded-2xl p-8 border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Trace CRM</p>
            <h1 className="text-xl font-semibold text-slate-900 mt-1">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to access your pipeline and leads.
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
            <img 
              src="https://i.postimg.cc/QC67xcXT/T-logo.png" 
              alt="Trace Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-medium">Full name</label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium">Email</label>
            <input
              type="email"
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium">Password</label>
            <input
              type="password"
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800 transition disabled:opacity-60"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={onGoogle}
            className="w-full py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-md hover:bg-slate-50 transition flex items-center justify-center gap-2"
          >
            <span>Continue with Google</span>
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500 text-center">
          {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
          <button
            type="button"
            className="text-slate-900 font-semibold"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Create an account' : 'Sign in instead'}
          </button>
        </p>
      </div>
    </div>
  );
};

