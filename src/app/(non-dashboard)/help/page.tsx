'use client';

import { motion } from 'framer-motion';

export default function HelpCenter() {
  const features = [
    {
      title: 'Fetching Emails',
      description: 'Use the Fetch dialog to query your Gmail inbox. You can apply specific filters including read/unread status, lookback period (in days), maximum mail count, important flags, and starred indicators to retrieve exactly what you need.',
      icon: (
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )
    },
    {
      title: 'Local Vault Security',
      description: 'Once fetched, your emails are stored in your browser using high-grade AES-GCM encryption. The cryptographic key is dynamically derived from your unique user ID and email address, ensuring local state remains strictly confidential.',
      icon: (
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      title: 'AI Analysis',
      description: 'Select emails from your Fetched inbox and run them through our AI analysis engine. The engine will intelligently derive processing options based on the content of your selection. You can choose to process the results temporarily or store them permanently.',
      icon: (
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: 'Cloud Vault',
      description: 'Analyzed emails can be manually synchronized to your Cloud Vault (Postgres). Mails stored here are heavily encrypted server-side, providing a secure, persistent backup of your processed intelligence.',
      icon: (
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      )
    },
    {
      title: 'Firebox Navigation',
      description: 'Switch effortlessly between your Fetched and Analyzed inboxes using the primary tab system. Both views support comprehensive real-time search, multi-selection, and a detailed slide-out sheet for reading specific threads.',
      icon: (
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      )
    },
    {
      title: 'CLI eco-system',
      description: 'Integrate Firemail into your existing workflows. Execute secure Fetches and AI-powered Analyzes directly from your terminal using our official CLI.',
      icon: (
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-[94.15vh] p-7 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        <div className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight text-black mt-6">Documentation & Help</h1>
          <p className="text-black/75 text-sm">Learn how to securely fetch, analyze, and manage your intelligence with Firemail.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                {feature.icon}
                <h2 className="text-base font-semibold text-black">{feature.title}</h2>
              </div>
              <p className="text-sm text-black leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}