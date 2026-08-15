'use client';

import { useEffect, useState } from 'react';
import { DEMO_MODE_KEY, getDemoSettings } from '@/lib/demo-data';
import Settings from './Settings';
import Auth from './Auth';

export default function DemoSettingsGate() {
  const [checked, setChecked] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(localStorage.getItem(DEMO_MODE_KEY) === 'true');
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (isDemo) {
    const settings = getDemoSettings();
    return <Settings settings={settings} demoMode />;
  }

  return <Auth />;
}
