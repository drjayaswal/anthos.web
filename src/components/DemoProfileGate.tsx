'use client';

import { useEffect, useState } from 'react';
import { DEMO_MODE_KEY, DEMO_USER } from '@/lib/demo-data';
import Profile from './Profile';
import Auth from './Auth';
import type { UserProfile } from '@/app/api/_db/profile';

const DEMO_PROFILE: UserProfile = {
  id: DEMO_USER.id,
  name: DEMO_USER.name,
  email: DEMO_USER.email,
  image: null,
  emailVerified: true,
  authCreatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  appCreatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  totalEncryptedMails: 1,
  provider: 'demo',
  providerAccountId: 'demo-google-account',
  scopes: 'https://www.googleapis.com/auth/gmail.readonly demo',
  providerLinkedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  sessions: [
    {
      id: 'demo-session-1',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ipAddress: '127.0.0.1 (Demo)',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      userId: DEMO_USER.id,
    },
  ],
};

export default function DemoProfileGate() {
  const [checked, setChecked] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(localStorage.getItem(DEMO_MODE_KEY) === 'true');
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (isDemo) {
    return <Profile profile={DEMO_PROFILE} />;
  }

  return <Auth />;
}
