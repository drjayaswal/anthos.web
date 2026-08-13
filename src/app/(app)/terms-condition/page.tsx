'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export default function TermsAndConditions() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content:
        'By authenticating with Google and utilizing Flar, you agree to these Terms and Conditions. If you do not agree with any part of these terms, you must immediately cease use of the service and revoke authentication privileges.',
    },
    {
      title: '2. Service Provision & Limitations',
      content:
        'Flar acts as a secure intermediary and analysis tool for your existing Gmail data. We do not guarantee uninterrupted functionality of external Google APIs, nor do we guarantee the absolute accuracy of AI-derived analysis. The service is provided "as is" without warranties of any kind.',
    },
    {
      title: '3. User Responsibilities & Security',
      content:
        'You are responsible for maintaining the security of the local device and environment from which you access Flar. Because the Local Vault utilizes browser-based AES-GCM encryption derived from your authenticated identity, safeguarding your machine and session credentials is your responsibility.',
    },
    {
      title: '4. API Usage and Fair Use',
      content:
        'Users must not abuse the fetching or analysis mechanisms. Excessive automated querying of the Gmail API via Flar that triggers Google rate limits may result in temporary or permanent throttling of syncing capabilities.',
    },
    {
      title: '5. Limitation of Liability',
      content:
        'In no event shall Flar, its developers, or its contributors be liable for any indirect, incidental, or consequential damages resulting from the use of the platform, the loss of data, unauthorized device access, or inaccuracies in AI-generated analysis.',
    },
  ];

  return (
    <div className="min-h-0 text-white">
      <main className="max-w-4xl sm:mx-auto mx-2 sm:mt-0 mt-10 px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex flex-row items-center justify-between gap-3 border-b border-dashed border-white/15 pb-4 sm:pb-5">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center text-white shrink-0">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-white sm:text-2xl truncate">
                Terms &amp; Conditions
              </h1>
            </div>
            <p className="text-xs text-white/40 sm:text-sm truncate">
              Terms and conditions governing the use of Flar services, integrations, and vaults.
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