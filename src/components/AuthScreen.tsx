import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Vault, Lock } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const email = import.meta.env.VITE_OWNER_EMAIL;
    if (!email) {
      setError('System Error: Owner email not configured.');
      setLoading(false);
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch {
      setError('Wrong password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--t-bg)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[var(--t-text)] font-sans relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: 'var(--t-primary)', opacity: 0.12 }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: 'var(--t-accent)', opacity: 0.07 }} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[var(--t-surface)] border border-[var(--t-border)] flex items-center justify-center shadow-xl backdrop-blur-xl">
            <Lock className="w-7 h-7 text-[var(--t-accent)]" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-[var(--t-text)] font-display tracking-tight">
          Unlock Link Vault
        </h2>
        <p className="mt-3 text-center text-sm text-[var(--t-muted)] font-medium tracking-wide uppercase">
          Private workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[var(--t-surface)] py-8 px-4 shadow-2xl border border-[var(--t-border)] sm:rounded-3xl sm:px-10 backdrop-blur-xl ring-1 ring-[var(--t-border)]">
          <form className="space-y-6" onSubmit={handleAuth}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded-xl flex items-center justify-center font-medium">
                {error}
              </div>
            )}
            <div>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-4 border border-[var(--t-border)] bg-[var(--t-input)] rounded-2xl text-[var(--t-text)] placeholder:text-[var(--t-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--t-accent)] focus:border-[var(--t-accent)] transition-all text-center tracking-widest font-mono text-lg"
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading || !password}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-[var(--t-primary)] hover:bg-[var(--t-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--t-accent)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] uppercase tracking-widest"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <><Vault size={18} />Unlock</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
