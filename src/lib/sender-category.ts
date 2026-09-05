export interface SenderCategory {
  label: string;
  className: string;
}

const CATEGORY_RULES: Array<{
  regex: RegExp;
  label: string;
  className: string;
}> = [
  {
    regex: /(no[-_.]?reply|donotreply|do[-_.]not[-_.]reply|dont[-_.]?reply|auto[-_.]?(generated|reply|response)|automated|mailer[-_.]?daemon|daemon)/i,
    label: 'No-Reply',
    className: 'bg-amber-600/10 text-amber-600',
  },
  {
    regex: /(promotions?|promo|marketing|deals?|offers?|discount|campaign|newsletters?|bulletin|specials)/i,
    label: 'Promotion',
    className: 'bg-purple-600/10 text-purple-600',
  },
  {
    regex: /(notifications?|notify|alerts?|system|updates?|digest|service[-_.]?desk|bot@)/i,
    label: 'Notification',
    className: 'bg-blue-600/10 text-blue-600',
  },
  {
    regex: /(billing|invoice|receipt|payments?|finance|orders?@)/i,
    label: 'Billing',
    className: 'bg-emerald-600/10 text-emerald-600',
  },
  {
    regex: /(support|helpdesk|help@|customer[-_.]?care|care@)/i,
    label: 'Support',
    className: 'bg-sky-600/10 text-sky-600',
  },
];

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
