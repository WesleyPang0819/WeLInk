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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err: any) {
      setError('Wrong password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-zinc-100 font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center shadow-xl shadow-black/50 backdrop-blur-xl">
            <Lock className="w-7 h-7 text-indigo-400" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white font-display tracking-tight">
          Unlock Link Vault
        </h2>
        <p className="mt-3 text-center text-sm text-zinc-500 font-medium tracking-wide uppercase">
          Private workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-zinc-900/60 py-8 px-4 shadow-2xl border border-zinc-800/60 sm:rounded-3xl sm:px-10 backdrop-blur-xl ring-1 ring-white/5">
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
                  className="appearance-none block w-full px-4 py-4 border border-zinc-700/50 bg-zinc-950/50 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-center tracking-widest font-mono text-lg"
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !password}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-600/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] uppercase tracking-widest"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <Vault size={18} />
                    Unlock
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
