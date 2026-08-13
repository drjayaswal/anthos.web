'use client';

import { motion } from 'framer-motion';
import {
  DownloadCloud,
  Shield,
  Sparkles,
  Database,
  Inbox,
  Terminal,
  HelpCircle,
  Key,
  Layers,
} from 'lucide-react';

export default function HelpCenter() {
  const guides = [
    {
      title: 'Fetching Emails',
      description:
        'Use the Fetch dialog to query your Gmail inbox. You can apply granular filters including read/unread status, lookback period in days, max count, importance, and starred flags.',
      icon: DownloadCloud,
    },
    {
      title: 'Local Vault Security',
      description:
        'Emails are secured directly within your browser utilizing client-side AES-GCM encryption. Keys are dynamically derived from your unique user identity for zero-knowledge caching.',
      icon: Shield,
    },
    {
      title: 'AI Analysis & Insights',
      description:
        'Select any batch of fetched emails to run through intelligent AI processing models. Derive action items, priorities, summaries, and categorized intelligence in seconds.',
      icon: Sparkles,
    },
    {
      title: 'Cloud Vault Sync',
      description:
        'Optionally sync processed and analyzed emails to your dedicated Cloud Vault. Data is protected with strong server-side encryption for persistent multi-device access.',
      icon: Database,
    },
    {
      title: 'Firebox Navigation',
      description:
        'Seamlessly toggle between Fetched and Analyzed inboxes. Use full-text search, selection bars, sorting, and the slide-out sheet reader for complete email review.',
      icon: Inbox,
    },
    {
      title: 'Custom AI Models & Keys',
      description:
        'Bring your own API keys for OpenAI, Anthropic, Gemini, or custom LLMs in Settings. All keys remain encrypted and are only used for your specific requests.',
      icon: Key,
    },
    {
      title: 'Custom Categories',
      description:
        'Admins and users can configure custom categorization tags and descriptions to organize classification pipelines tailored specifically to their workflow.',
      icon: Layers,
    },
    {
      title: 'CLI Integration',
      description:
        'Connect Anthos directly to your local terminal workflows and shell scripts. Trigger secure fetches and automated AI pipelines programmatically via the Anthos CLI.',
      icon: Terminal,
    },
  ];

  return (
    <div className="min-h-0 text-white">
      <main className="max-w-4xl sm:mt-0 sm:mx-auto mt-10 mx-2 px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex flex-row items-center justify-between gap-3 border-b border-dashed border-white/15 pb-4 sm:pb-5">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center text-white shrink-0">
                <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-white sm:text-2xl truncate">
                Documentation &amp; Help
              </h1>
            </div>
            <p className="text-xs text-white/40 sm:text-sm truncate">
              Learn how to securely fetch, analyze, and manage your intelligence with Anthos.
            </p>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-white">
              Platform Guides &amp; Architecture
            </h2>
            <span className="text-[11px] sm:text-xs text-white/40 font-mono">
              {guides.length} topics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {guides.map((guide, idx) => {
              const Icon = guide.icon;
              return (
                <motion.div
                  key={guide.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="p-2 text-white space-y-1"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-6 w-6 items-center justify-center text-white shrink-0">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-white">
                      {guide.title}
                    </h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed">
                    {guide.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}