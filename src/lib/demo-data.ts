import type { Mail } from '@/types';
import type { UserSettings, ModelItem } from '@/app/api/_db/settings';

// ─── Demo User Identity ────────────────────────────────────────────
export const DEMO_USER = {
  id: 'demo-jane-doe',
  email: 'jane.doe@demo.anthos',
  name: 'Jane Doe',
} as const;

// ─── Demo Categories ───────────────────────────────────────────────
export const DEMO_CATEGORIES: { name: string; description?: string | null }[] = [
  { name: 'Work', description: 'Work-related emails and tasks' },
  { name: 'Social', description: 'Social networking and community updates' },
  { name: 'Updates', description: 'Service notifications and product updates' },
  { name: 'Promotions', description: 'Marketing, deals, and promotional content' },
];

// ─── Dummy Gmail Mail (fetched from cloud) ─────────────────────────
export const DEMO_GMAIL_MAIL: Mail = {
  id: 'demo-gmail-001',
  threadId: 'demo-thread-001',
  subject: 'Q3 Product Roadmap Review — Action Items Inside',
  sender: 'Alex Rivera <alex.rivera@techcorp.io>',
  recipient: 'jane.doe@demo.anthos',
  body: `Hi Jane,\n\nHope you're doing well! I wanted to follow up on our Q3 product roadmap discussion from last Friday.\n\nHere are the key action items we agreed on:\n\n1. Finalize the feature prioritization matrix by July 20th\n2. Schedule user research sessions for the new dashboard redesign\n3. Review the competitive analysis document I shared last week\n4. Set up a sync with the engineering team about API rate limiting improvements\n\nThe stakeholder presentation is scheduled for August 1st, so we need to have the draft ready by July 28th at the latest.\n\nLet me know if you have any questions or if any of the deadlines need adjustment.\n\nBest regards,\nAlex Rivera\nSenior Product Manager, TechCorp`,
  status: 'unread',
  labels: ['INBOX', 'UNREAD', 'IMPORTANT'],
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
};

// ─── Dummy Database Mail (loaded from encrypted DB) ────────────────
export const DEMO_DB_MAIL: Mail = {
  id: 'demo-db-001',
  threadId: 'demo-thread-002',
  subject: 'Your Monthly Security Report — June 2025',
  sender: 'Anthos Security <security@anthos.app>',
  recipient: 'jane.doe@demo.anthos',
  body: `Dear Jane,\n\nYour monthly security report for June 2025 is ready.\n\nSummary:\n• 247 emails processed and encrypted\n• 3 potential phishing attempts blocked\n• All stored emails remain securely encrypted with AES-256\n• No unauthorized access attempts detected\n\nKey Highlights:\n- Your encryption keys were rotated successfully on June 15th\n- 2 new device logins were verified (MacBook Pro, iPhone 15)\n- Email classification accuracy improved to 98.7%\n\nWe recommend enabling two-factor authentication for an extra layer of security if you haven't already.\n\nStay secure,\nAnthos Security Team`,
  status: 'read',
  labels: ['INBOX'],
  createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  categories: ['Updates', 'Work'],
  priority: ['0.3', '0.5'],
  summary: 'Monthly security report for June 2025 — 247 emails processed, 3 phishing attempts blocked, encryption keys rotated, classification accuracy at 98.7%.',
};

// ─── Analyzed version of the Gmail mail ────────────────────────────
export const DEMO_ANALYZED_MAIL: Mail = {
  ...DEMO_GMAIL_MAIL,
  categories: ['Work', 'Updates'],
  priority: ['0.85', '0.4'],
  summary: 'Q3 product roadmap follow-up with 4 action items. Stakeholder presentation deadline August 1st, draft due July 28th. Requires feature prioritization, user research scheduling, competitive analysis review, and engineering sync.',
};

// ─── Demo Settings (default Anthos model) ──────────────────────────
export const DEMO_DEFAULT_SETTINGS: UserSettings = {
  id: 'demo-settings-001',
  userId: DEMO_USER.id,
  models: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ─── LocalStorage keys ─────────────────────────────────────────────
export const DEMO_SETTINGS_KEY = 'firemail-demo-settings';
export const DEMO_MODE_KEY = 'firemail-demo';

// ─── Helpers to get/set demo settings from localStorage ────────────
export function getDemoSettings(): UserSettings {
  if (typeof window === 'undefined') return DEMO_DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(DEMO_SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as UserSettings;
  } catch {}
  return DEMO_DEFAULT_SETTINGS;
}

export function saveDemoSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEMO_SETTINGS_KEY, JSON.stringify(settings));
}
