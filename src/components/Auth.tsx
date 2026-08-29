'use client';

import { useState } from 'react';
import Image from 'next/image';
import { authClient } from '@/lib/auth-client';
import { toast } from '@/lib/toast';
import { useSearchParams } from 'next/navigation';
import { SocialButton } from './base/buttons/social-button';

export default function Auth() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const redirectTo = searchParams.get("redirect") || "/analyze";

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
      <div className="relative flex items-center border bg-white rounded-xl shadow-md p-3">
        <div className="absolute top-1.5 right-1.5 flex justify-center">
          <div className="w-5 h-5 rounded-full bg-white border shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]" />
        </div>
        <div className="flex flex-col items-center justify-center pb-1">
          <Image
            src="/anthos.svg"
            alt="anthos"
            width={100}
            height={100}
            quality={90}
            style={{ width: '240px', height: 'auto' }}
            priority
          />
          <h1 className="text-3xl mb-3 sm:text-4xl md:text-5xl font-bold tracking-tight text-black text-center">
            Anthos
          </h1>
          <SocialButton
            social="google"
            theme="brand"
            isLoading={loading}
            onClick={handleGoogleSignIn}
            className={`bg-white ring-0 ${loading ? 'text-black/40' : 'text-black'}`}
          >
            {loading ? 'Signing in…' : 'Sign in with Google'}
          </SocialButton>
        </div>
      </div>
    </div>
  );
}
