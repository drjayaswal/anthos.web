'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShieldCheck, Eye, EyeOff, ArrowRight, Lock } from 'lucide-react';

interface RootLoginProps {
  onSuccess: () => void;
}

export default function RootLogin({ onSuccess }: RootLoginProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('anthos_root_auth');
    if (saved === 'true') {
      onSuccess();
    }
  }, [onSuccess]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!password.trim() || loading) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: password.trim() }),
        });

        const data = await res.json();

        if (data.ok) {
          sessionStorage.setItem('anthos_root_auth', 'true');
          onSuccess();
        } else {
          setError(data.error || 'Authentication failed');
          setShake(true);
          setTimeout(() => setShake(false), 600);
        }
      } catch {
        setError('Failed to connect');
        setShake(true);
        setTimeout(() => setShake(false), 600);
      } finally {
        setLoading(false);
      }
    },
    [password, loading, onSuccess]
  );

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center justify-center w-full lg:w-[45%] px-6 sm:px-12 lg:px-16 relative"
      >
        <div className="relative z-10 w-full max-w-sm space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <Image
                src="/anthos.svg"
                alt="Anthos"
                width={72}
                height={72}
                quality={90}
                priority
                style={{ width: '72px', height: 'auto' }}
              />
            </div>
            <div className="text-center space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Root Access
              </h1>
              <p className="text-sm text-white/50 font-medium">
                Administrator authentication required
              </p>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: 'easeOut' }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label
                htmlFor="root-password"
                className="block text-xs font-semibold text-white/60 uppercase tracking-widest"
              >
                Password
              </label>
              <motion.div
                animate={shake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <input
                  id="root-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter admin password"
                  autoFocus
                  autoComplete="off"
                  className="w-full h-12 pl-5 pr-12 text-sm font-medium text-white placeholder:text-white/25 rounded-2xl border border-white/15 outline-none transition-all duration-300 focus:border-white/35 focus:bg-white/2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </motion.div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -5 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -5 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs font-medium text-red-600 w-fit mx-auto text-center px-1">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full h-12 flex items-center justify-center gap-2.5 text-sm font-semibold transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5 opacity-50" />
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center text-[11px] text-white/25 font-medium"
          >
            This is a restricted endpoint.
          </motion.p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="hidden lg:block lg:w-[55%] relative overflow-hidden"
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
        )}

        <Image
          src="https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=1200&q=80&auto=format&fit=crop"
          alt="Nature landscape"
          fill
          priority
          quality={100}
          sizes="55vw"
          className={`object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
      </motion.div>
    </div>
  );
}
