'use client';

import { useEffect, useState } from 'react';
import { DEMO_MODE_KEY, DEMO_USER } from '@/lib/demo-data';
import Home from './Home';
import Auth from './Auth';

export default function DemoGate() {
  const [checked, setChecked] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(localStorage.getItem(DEMO_MODE_KEY) === 'true');
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (isDemo) {
    return <Home sessionUserId={DEMO_USER.id} />;
  }

  return <Auth />;
}
