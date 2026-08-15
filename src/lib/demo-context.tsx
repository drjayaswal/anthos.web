'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { DEMO_MODE_KEY, DEMO_SETTINGS_KEY } from './demo-data';

interface DemoContextValue {
  isDemo: boolean;
  enterDemo: () => void;
  exitDemo: () => void;
}

const DemoContext = createContext<DemoContextValue>({
  isDemo: false,
  enterDemo: () => {},
  exitDemo: () => {},
});

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(localStorage.getItem(DEMO_MODE_KEY) === 'true');
  }, []);

  const enterDemo = useCallback(() => {
    localStorage.setItem(DEMO_MODE_KEY, 'true');
    setIsDemo(true);
    window.location.href = '/';
  }, []);

  const exitDemo = useCallback(() => {
    localStorage.removeItem(DEMO_MODE_KEY);
    localStorage.removeItem(DEMO_SETTINGS_KEY);
    setIsDemo(false);
    window.location.href = '/thank-you';
  }, []);

  return (
    <DemoContext.Provider value={{ isDemo, enterDemo, exitDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoMode() {
  return useContext(DemoContext);
}
