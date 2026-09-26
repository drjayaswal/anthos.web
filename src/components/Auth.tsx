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
      <div className="flex items-center">
        <div className="flex flex-col gap-5 items-center justify-center">
          <Image
            src="/anthos.svg"
            alt="anthos"
            width={100}
            height={100}
            quality={90}
            style={{ width: '100px', height: 'auto' }}
            priority
          />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-center">
            Anthos
          </h1>
          <SocialButton
            social="google"
            theme="brand"
            isLoading={loading}
            onClick={handleGoogleSignIn}
            className={`ring-0 rounded-4xl bg-transparent ${loading ? 'text-white/40' : 'active:scale-100 shadow-none hover:shadow-md hover:scale-101 hover:bg-white/5 text-white'}`}
          >
            {loading ? 'Loading...' : 'Continue with Google'}
          </SocialButton>
        </div>
      </div>
    </div>
  );
}
