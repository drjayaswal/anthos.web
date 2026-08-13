'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: '1. Gmail API Integration & Data Fetching',
      content:
        "Flar requires read-only access to your Gmail account via OAuth. We fetch email metadata and content strictly based on your applied filters (read/unread status, lookback days, importance, and starred status). Flar's use and transfer of information received from Google APIs to any other app will adhere to Google API Services User Data Policy, including the Limited Use requirements.",
    },
    {
      title: '2. Local Vault & Encryption',
      content:
        'Mails fetched to your local device are encrypted entirely within your browser utilizing AES-GCM standards. The cryptographic key is derived directly from your user ID and email address. This ensures that the raw fetched data at rest in your local environment cannot be read by any external party.',
    },
    {
      title: '3. AI Analysis Processing',
      content:
        'When you actively select emails for analysis, only the specific subset of emails you choose is transmitted to your configured AI processing providers. This data is strictly utilized to generate derived insights and categorization options based on the payload. It is never used to train public or global AI models.',
    },
    {
      title: '4. Cloud Vault Storage',
      content:
        'You may explicitly opt to sync analyzed emails to the Flar Postgres cloud database. All synchronized data is subjected to robust server-side encryption prior to persistence. We do not aggregate, sell, or distribute your cloud vault data to third-party brokers.',
    },
    {
      title: '5. Data Retention & Deletion',
      content:
        "Local vault data can be cleared at any time by clearing your browser storage. Cloud vault data can be managed or permanently deleted through your account settings. Revoking OAuth access directly via your Google Account will instantly sever Flar's ability to fetch new data.",
    },
  ];

  return (
    <div className="min-h-0 text-white">
      <main className="sm:mx-auto mx-2 max-w-4xl sm:mt-0 mt-10 px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex flex-row items-center justify-between gap-3 border-b border-dashed border-white/15 pb-4 sm:pb-5">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center text-white shrink-0">
                <Lock className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-white sm:text-2xl truncate">
                Privacy Policy
              </h1>
            </div>
            <p className="text-xs text-white/40 sm:text-sm truncate">
              Our data protection practices, encryption guarantees, and privacy commitments.
            </p>
          </div>
        </div>

        <section className="space-y-4 sm:space-y-5">
          {sections.map((section, idx) => {
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="text-white space-y-1.5"
              >
                <h2 className="text-xs sm:text-sm font-semibold text-white">
                  {section.title}
                </h2>
                <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed">
                  {section.content}
                </p>
              </motion.div>
            );
          })}
        </section>
      </main>
    </div>
  );
}