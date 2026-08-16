import type { Mail } from '@/types';
import type { UserSettings, ModelItem } from '@/app/api/_db/settings';

export const DEMO_USER = {
  id: 'demo-jane-doe',
  email: 'jane.doe@demo.anthos',
  name: 'Jane Doe',
} as const;

export const DEMO_CATEGORIES: { name: string; description?: string | null }[] = [
  { name: 'Work', description: 'Work-related emails and tasks' },
  { name: 'Social', description: 'Social networking and community updates' },
  { name: 'Updates', description: 'Service notifications and product updates' },
  { name: 'Promotions', description: 'Marketing, deals, and promotional content' },
];

export const DEMO_GMAIL_MAILS: Mail[] = [
  {
    id: 'demo-gmail-001',
    threadId: 'demo-thread-001',
    subject: 'Q3 Product Roadmap Review — Action Items Inside',
    sender: 'Alex Rivera <alex.rivera@techcorp.io>',
    recipient: 'jane.doe@demo.anthos',
    body: `Hi Jane,\n\nHope you're doing well! I wanted to follow up on our Q3 product roadmap discussion from last Friday.\n\nHere are the key action items we agreed on:\n\n1. Finalize the feature prioritization matrix by July 20th\n2. Schedule user research sessions for the new dashboard redesign\n3. Review the competitive analysis document I shared last week\n4. Set up a sync with the engineering team about API rate limiting improvements\n\nThe stakeholder presentation is scheduled for August 1st, so we need to have the draft ready by July 28th at the latest.\n\nLet me know if you have any questions or if any of the deadlines need adjustment.\n\nBest regards,\nAlex Rivera\nSenior Product Manager, TechCorp`,
    status: 'unread',
    labels: ['INBOX', 'UNREAD', 'IMPORTANT'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-gmail-002',
    threadId: 'demo-thread-002',
    subject: 'Invitation: Anthos Design System & UI Workshop',
    sender: 'Sarah Chen <sarah.c@designops.org>',
    recipient: 'jane.doe@demo.anthos',
    body: `Hello Jane,\n\nYou are invited to join our upcoming interactive Design System workshop next Wednesday at 2:00 PM EST.\n\nAgenda topics:\n• Harmonious color palettes for dark & light mode\n• Glassmorphism tokens and micro-interactions\n• Streamlined typography hierarchy with Inter & Outfit\n• Mobile drawer swipe-to-dismiss patterns\n\nPlease let me know if this time works for you so we can confirm the calendar invitation.\n\nWarmly,\nSarah Chen\nLead Product Designer`,
    status: 'unread',
    labels: ['INBOX', 'UNREAD'],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-gmail-003',
    threadId: 'demo-thread-003',
    subject: 'URGENT: Production API Gateway Rate Limit Alert',
    sender: 'Marcus Brody <marcus@infrastructure.net>',
    recipient: 'jane.doe@demo.anthos',
    body: `Jane,\n\nOur latency monitoring system detected a 300% surge in requests to /api/mail/analyze over the last 45 minutes. Several worker nodes are approaching 85% CPU saturation.\n\nWe urgently need approval to scale up 3 additional ECS container instances to avoid request throttling.\n\nPlease reply immediately or join the emergency bridge line.\n\nRegards,\nMarcus Brody\nPrincipal Site Reliability Engineer`,
    status: 'unread',
    labels: ['INBOX', 'UNREAD', 'IMPORTANT'],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-gmail-004',
    threadId: 'demo-thread-004',
    subject: 'Customer Feedback Summary — Week 32 NPS Report',
    sender: 'Pulse Feedback <notifications@pulsefeedback.io>',
    recipient: 'jane.doe@demo.anthos',
    body: `Hi Jane,\n\nHere is your weekly summary of user satisfaction metrics for Anthos:\n\n• Net Promoter Score: +68 (up 4 points from last week)\n• Total Reviews Analyzed: 1,420\n• Top Positives: Super fast email categorization, clean UI\n• Top Feature Requests: Multi-account syncing, custom LLM providers\n\nFull interactive analytics can be viewed on your customer insights portal.\n\nBest,\nThe Pulse Feedback Team`,
    status: 'read',
    labels: ['INBOX'],
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-gmail-005',
    threadId: 'demo-thread-005',
    subject: 'Team Offsite & Dinner Planning for Next Thursday 🎉',
    sender: 'Elena Rostova <elena@teamhub.internal>',
    recipient: 'jane.doe@demo.anthos',
    body: `Hey everyone!\n\nTo celebrate completing our Q2 milestones, we're planning a team dinner next Thursday evening at 7:00 PM!\n\nWe have two restaurant candidates:\n1. The Grand Italian Bistro (Downtown)\n2. Skyline Tapas & Terrace (Seaport)\n\nPlease vote in the internal Slack poll before Tuesday at 5 PM so we can lock in the reservation.\n\nCheers,\nElena`,
    status: 'unread',
    labels: ['INBOX', 'UNREAD'],
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-gmail-006',
    threadId: 'demo-thread-006',
    subject: 'Invoice #INV-2025-9042 from CloudScale Services',
    sender: 'Billing Department <billing@cloudscale.io>',
    recipient: 'jane.doe@demo.anthos',
    body: `Dear Jane Doe,\n\nYour monthly cloud hosting and bandwidth invoice for July 2025 has been finalized.\n\nInvoice Number: INV-2025-9042\nTotal Amount Due: $420.00 USD\nDue Date: August 15, 2025\nPayment Method: Card ending in ****4012\n\nYou can download the complete PDF tax breakdown from your billing management panel.\n\nThank you for choosing CloudScale Services.`,
    status: 'read',
    labels: ['INBOX'],
    createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
];

export const DEMO_GMAIL_MAIL: Mail = DEMO_GMAIL_MAILS[0];

export const DEMO_DB_MAILS: Mail[] = [
  {
    id: 'demo-db-001',
    threadId: 'demo-thread-db-001',
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
  },
  {
    id: 'demo-db-002',
    threadId: 'demo-thread-db-002',
    subject: 'Q2 Financial Audit & Board Approval Memo',
    sender: 'CFO Office <finance@corporate.io>',
    recipient: 'jane.doe@demo.anthos',
    body: `Dear Team,\n\nThe Board of Directors has formally ratified our Q2 financial audit statement.\n\nKey Takeaways:\n• Revenue increased by 22% quarter-over-quarter\n• Enterprise ARR now exceeds $12.4M\n• Budget for hiring 6 additional AI engineering specialists approved\n\nPlease ensure your departmental expenditure reports are submitted to finance by month-end.\n\nBest,\nOffice of the Chief Financial Officer`,
    status: 'read',
    labels: ['INBOX'],
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    categories: ['Work'],
    priority: ['0.92'],
    summary: 'Q2 financial audit ratified by Board of Directors. 22% QoQ revenue increase, $12.4M ARR, and budget for 6 AI engineers approved.',
  },
  {
    id: 'demo-db-003',
    threadId: 'demo-thread-db-003',
    subject: 'Cloud Infrastructure SLA & Uptime Review',
    sender: 'DevOps Monitoring <alerts@infra-mon.com>',
    recipient: 'jane.doe@demo.anthos',
    body: `Uptime Report for June 2025:\n\n• Global System Availability: 99.982%\n• Zero Sev-1 Outages\n• Average API response time: 84ms\n• SSL Certificates auto-renewed for all production domains\n\nRoutine maintenance is scheduled for Sunday at 02:00 UTC with no expected customer downtime.\n\nDevOps Operations`,
    status: 'read',
    labels: ['INBOX'],
    createdAt: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
    categories: ['Updates', 'Work'],
    priority: ['-0.25', '0.1'],
    summary: 'June 2025 SLA review: 99.982% uptime, zero critical outages, 84ms average API latency, routine Sunday maintenance planned.',
  },
  {
    id: 'demo-db-004',
    threadId: 'demo-thread-db-004',
    subject: 'Community Meetup Photos & Open Source Highlights',
    sender: 'Developer Relations <devrel@anthos-community.org>',
    recipient: 'jane.doe@demo.anthos',
    body: `Hello Anthos Community!\n\nThank you to the 180+ developers who attended our London Open Source Meetup last Thursday!\n\nHighlights:\n• 4 new community PRs merged\n• Lightning talks on encrypted AI workflows\n• Photos from the networking session are now live in our photo gallery\n\nStay tuned for the next virtual hackathon announcement coming next month.\n\nCheers,\nDevRel Team`,
    status: 'read',
    labels: ['INBOX'],
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    categories: ['Social'],
    priority: ['-0.55'],
    summary: 'London Open Source Meetup highlights: 180+ attendees, 4 community PRs merged, photo gallery published, next hackathon coming soon.',
  },
  {
    id: 'demo-db-005',
    threadId: 'demo-thread-db-005',
    subject: 'Exclusive 35% Early Renewal Discount for Anthos Pro',
    sender: 'SaaS Vendor <offers@enterprisecloud.com>',
    recipient: 'jane.doe@demo.anthos',
    body: `Hi Jane,\n\nAs a valued early adopter, we are pleased to offer you an exclusive 35% discount when renewing your Anthos Enterprise annual license.\n\nOffer Details:\n• 35% off all recurring user seats\n• Priority 24/7 dedicated support SLA\n• Free migration assistance for custom model endpoints\n\nThis promotional rate is locked in until the end of the current billing cycle.\n\nEnterprise Sales Team`,
    status: 'read',
    labels: ['INBOX'],
    createdAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
    categories: ['Promotions'],
    priority: ['-0.85'],
    summary: 'Exclusive 35% annual renewal discount on Anthos Enterprise license, including priority SLA and custom model assistance.',
  },
  {
    id: 'demo-db-006',
    threadId: 'demo-thread-db-006',
    subject: 'Updated Policy: Remote Collaboration & Equipment Expenses',
    sender: 'Human Resources <hr@corporate.io>',
    recipient: 'jane.doe@demo.anthos',
    body: `Dear Employees,\n\nPlease review our updated remote collaboration guidelines effective August 1st:\n\n1. Annual Home Office & Tech Equipment Stipend increased to $1,000\n2. Flexible core working hours (10 AM – 3 PM local time)\n3. Asynchronous daily check-ins replacing mandatory standup calls\n\nPlease submit all reimbursement receipts via the internal employee portal.\n\nHuman Resources Department`,
    status: 'read',
    labels: ['INBOX'],
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    categories: ['Updates'],
    priority: ['0.7'],
    summary: 'Updated remote work policy: $1,000 annual equipment stipend, flexible core hours (10 AM – 3 PM), and asynchronous check-in guidelines.',
  },
];

export const DEMO_DB_MAIL: Mail = DEMO_DB_MAILS[0];

export const DEMO_ANALYZED_MAP: Record<string, { categories: string[]; priority: string[]; summary: string }> = {
  'demo-gmail-001': {
    categories: ['Work', 'Updates'],
    priority: ['0.85', '0.4'],
    summary: 'Q3 product roadmap follow-up with 4 action items. Stakeholder presentation deadline August 1st, draft due July 28th. Requires feature prioritization, user research scheduling, competitive analysis review, and engineering sync.',
  },
  'demo-gmail-002': {
    categories: ['Work', 'Social'],
    priority: ['0.45', '0.65'],
    summary: 'Design System workshop invitation for Wednesday at 2 PM EST covering dark mode tokens, glassmorphism, typography, and mobile drawer gestures.',
  },
  'demo-gmail-003': {
    categories: ['Work'],
    priority: ['0.95'],
    summary: 'CRITICAL ALERT: API Gateway request surge causing 85% CPU saturation on /api/mail/analyze. Requires immediate authorization to provision 3 ECS instances.',
  },
  'demo-gmail-004': {
    categories: ['Updates'],
    priority: ['0.25'],
    summary: 'Weekly customer satisfaction digest: NPS increased to +68 across 1,420 reviews with positive feedback on categorization speed.',
  },
  'demo-gmail-005': {
    categories: ['Social'],
    priority: ['-0.35'],
    summary: 'Team celebration dinner planning for next Thursday. Italian Bistro vs Skyline Tapas poll open until Tuesday 5 PM.',
  },
  'demo-gmail-006': {
    categories: ['Work', 'Updates'],
    priority: ['0.6', '0.1'],
    summary: 'CloudScale Services invoice #INV-2025-9042 for $420.00 USD due on August 15, 2025. Standard monthly hosting charge.',
  },
};

export const DEMO_ANALYZED_MAIL: Mail = {
  ...DEMO_GMAIL_MAIL,
  categories: DEMO_ANALYZED_MAP['demo-gmail-001'].categories,
  priority: DEMO_ANALYZED_MAP['demo-gmail-001'].priority,
  summary: DEMO_ANALYZED_MAP['demo-gmail-001'].summary,
};

export function getDemoAnalyzedMail(mail: Mail, activeModelNames: string[] = ['Anthos Default']): Mail {
  const mapped = DEMO_ANALYZED_MAP[mail.id];
  if (mapped) {
    return {
      ...mail,
      categories: mapped.categories,
      priority: mapped.priority,
      summary: mapped.summary,
    };
  }
  return {
    ...mail,
    categories: ['Work', 'Updates'],
    priority: ['0.65', '0.3'],
    summary: `Analyzed with [${activeModelNames.join(', ')}]: High-priority summary and contextual classifications generated for "${mail.subject}".`,
  };
}

export const DEMO_DEFAULT_SETTINGS: UserSettings = {
  id: 'demo-settings-001',
  userId: DEMO_USER.id,
  models: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const DEMO_SETTINGS_KEY = 'firemail-demo-settings';
export const DEMO_MODE_KEY = 'firemail-demo';

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
