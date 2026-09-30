'use client';

import { useState, useCallback } from 'react';
import RootLogin from '@/components/RootLogin';
import Analyze from '@/components/Analyze';

export default function RootPage() {
  const [authenticated, setAuthenticated] = useState(false);

  const handleSuccess = useCallback(() => {
    setAuthenticated(true);
  }, []);

  if (!authenticated) {
    return <RootLogin onSuccess={handleSuccess} />;
  }

  return (
    <Analyze
      sessionUserId="root"
      sessionUserEmail="root@anthos.dev"
      isRootUser
    />
  );
}
