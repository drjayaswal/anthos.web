'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2Icon } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { toast } from '@/lib/toast';
import { useSearchParams } from 'next/navigation';

export default function Auth() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/analyze");

  useEffect(() => {
    const redirectParam = searchParams.get("redirect");
    if (redirectParam) {
      setRedirectTo(redirectParam);
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { data, error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: redirectTo,
      });

      if (error) {
        toast.error(error.message ?? 'Could not start Google sign-in');
        setLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      toast.error('No redirect URL from Google sign-in');
      setLoading(false);
    } catch {
      toast.error('Could not start Google sign-in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[94.28vh] flex flex-col items-center justify-center">
      <div className="flex items-center">
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/anthos.png"
            alt="anthos"
            width={100}
            height={100}
            quality={90}
            style={{ width: '240px', height: 'auto' }}
            priority
            className="[html.light_&]:invert"
          />
          <h1 className="text-3xl mb-3 sm:text-4xl md:text-5xl font-bold tracking-tight text-white [html.light_&]:text-black text-center">
            Anthos
          </h1>
          <button
            type="button"
            disabled={loading}
            className={`transition-colors duration-200 active:shadow-inner rounded-2xl px-4 py-2 text-white [html.light_&]:text-black ${loading ? "shadow-inner flex cursor-not-allowed justify-center items-center gap-2 text-white/50 [html.light_&]:text-black/50" : "hover:bg-white/10 [html.light_&]:hover:bg-black/5 cursor-pointer"}`}
            onClick={handleGoogleSignIn}
          >
            {loading && (
              <Loader2Icon className="h-4.5 w-4.5 animate-spin" />
            )}
            {loading ? 'Redirecting…' : 'Continue with Google'}
          </button>
        </div>
      </div>
    </div>
  );
}
