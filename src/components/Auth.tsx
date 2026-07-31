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
          <Button
            type="button"
            size="xl"
            variant="shadow"
            disabled={loading}
            className='px-4'
            onClick={handleGoogleSignIn}
          >
            {loading ? (
              <Loader2Icon className="h-[18px] w-[18px] animate-spin" />
            ) : (
              <Image
                src="/google.svg"
                alt="Google"
                width={18}
                height={18}
                className="bg-white p-0.5 rounded-sm"
              />
            )}
            {loading ? 'Redirecting…' : 'Continue with Google'}
          </Button>
        </div>
        </div>
    </div>
  );
}
