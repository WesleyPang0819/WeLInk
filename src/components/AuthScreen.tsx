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
    <div className="min-h-[100dvh] bg-[var(--t-bg)] flex flex-col items-center justify-center p-6 text-[var(--t-text)] font-sans relative overflow-hidden pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: 'var(--t-primary)', opacity: 0.12 }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: 'var(--t-accent)', opacity: 0.07 }} />

      <div className="w-full max-w-[340px] sm:max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--t-surface)] border border-[var(--t-border)] flex items-center justify-center shadow-xl backdrop-blur-xl mb-6">
            <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--t-accent)]" />
          </div>
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-[var(--t-text)] font-display tracking-tight leading-tight">
            Unlock Link Vault
          </h2>
          <p className="mt-2 text-center text-[13px] sm:text-sm text-[var(--t-muted)] font-bold tracking-widest uppercase">
            Private workspace
          </p>
        </div>

        <div className="bg-[var(--t-surface)] py-6 px-6 sm:py-8 sm:px-10 shadow-2xl border border-[var(--t-border)] rounded-[24px] backdrop-blur-xl ring-1 ring-[var(--t-border)]">
          <form className="space-y-5 sm:space-y-6" onSubmit={handleAuth}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm p-3 sm:p-4 rounded-xl flex items-center justify-center font-medium">
                {error}
              </div>
            )}
            <div>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full h-[46px] sm:h-[54px] px-4 border border-[var(--t-border)] bg-[var(--t-input)] rounded-[18px] text-[var(--t-text)] placeholder:text-[var(--t-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--t-accent)] focus:border-[var(--t-accent)] transition-all text-center tracking-widest font-mono text-base sm:text-lg"
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading || !password}
                className="w-full h-[46px] sm:h-[54px] flex justify-center items-center gap-2 px-4 border border-transparent rounded-[18px] shadow-lg text-[13px] sm:text-sm font-bold text-white bg-[var(--t-primary)] hover:bg-[var(--t-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--t-accent)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] uppercase tracking-widest"
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
