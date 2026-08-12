'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2Icon } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from './ui/button';
import { toast } from '@/lib/toast';
import { useSearchParams } from 'next/navigation';

export default function Auth() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/");

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
          <div className="flex flex-col gap-4 items-center justify-center">
            <Image
              src="/firemail-opensource.svg"
              alt="firemail"
              width={100}
              height={100}
              quality={90}
              style={{ width: '240px', height: 'auto' }}
              priority
            />
          <button
            type="button"
            disabled={loading}
            className={`cursor-pointer active:bg-gray-200/30 active:shadow-inner text-black rounded-2xl px-4 py-2 ${loading && "bg-gray-200/30 shadow-inner flex justify-center items-center gap-2"}`}
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
