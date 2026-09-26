export interface SenderCategory {
  label: string;
  className: string;
}

export const SENDER_CATEGORY_RULES: Array<{
  regex: RegExp;
  label: string;
  className: string;
  description: string;
}> = [
  {
    regex: /(no[-_.]?reply|donotreply|do[-_.]not[-_.]reply|dont[-_.]?reply|auto[-_.]?(generated|reply|response)|automated|mailer[-_.]?daemon|daemon)/i,
    label: 'No-Reply',
    className: 'bg-amber-600/10 text-amber-600',
    description: 'Automated or transactional system replies',
  },
  {
    regex: /(notifications?|notify|alerts?|system|updates?|digest|service[-_.]?desk|bot@)/i,
    label: 'Notification',
    className: 'bg-pink-600/10 text-pink-600',
    description: 'System alerts, digests & status updates',
  },
  {
    regex: /(billing|invoice|receipt|payments?|finance|orders?@)/i,
    label: 'Billing',
    className: 'bg-emerald-600/10 text-emerald-600',
    description: 'Invoices, receipts & financial transactions',
  },
  {
    regex: /(support|helpdesk|help@|customer[-_.]?care|care@)/i,
    label: 'Support',
    className: 'bg-sky-600/10 text-sky-600',
    description: 'Customer service & helpdesk inquiries',
  },
  {
    regex: /(promotions?|promo|marketing|deals?|offers?|discount|campaign|newsletters?|bulletin|specials)/i,
    label: 'Promotion',
    className: 'bg-lime-600/10 text-lime-600!',
    description: 'Marketing campaigns, offers & newsletters',
  },
];

const CATEGORY_RULES = SENDER_CATEGORY_RULES;

export function getSenderCategory(sender: string): SenderCategory | null {
  if (!sender) return null;

  const emailMatch = sender.match(/<([^>]+)>/);
  const target = emailMatch ? emailMatch[1] : sender;

  for (const rule of CATEGORY_RULES) {
    if (rule.regex.test(target) || rule.regex.test(sender)) {
      return {
        label: rule.label,
        className: rule.className,
      };
    }
  }

  return null;
}
