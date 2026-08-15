'use client';

import { useEffect, useState } from 'react';
import { DEMO_MODE_KEY } from '@/lib/demo-data';
import Restriction from './Restriction';
import Auth from './Auth';

export default function DemoAdminGate() {
  const [checked, setChecked] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(localStorage.getItem(DEMO_MODE_KEY) === 'true');
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (isDemo) {
    return <Restriction />;
  }

  return <Auth />;
}
