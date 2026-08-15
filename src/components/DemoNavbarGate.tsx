'use client';

import { useEffect, useState } from 'react';
import { DEMO_MODE_KEY } from '@/lib/demo-data';
import AppNavbar from '@/components/AppNavbar';

export default function DemoNavbarGate() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(localStorage.getItem(DEMO_MODE_KEY) === 'true');
  }, []);

  if (!isDemo) return null;

  return <AppNavbar authenticated={true} isAdmin={false} />;
}
