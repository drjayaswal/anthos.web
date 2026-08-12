'use client';

import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-[94.15vh] p-7 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full bg-white shadow-2xl shadow-black/50 p-8 sm:p-12"
      >
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-8">Privacy Policy</h1>

        <div className="space-y-8 text-zinc-600 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-zinc-900">1. Gmail API Integration & Data Fetching</h2>
            <p>
              Firemail requires read-only access to your Gmail account via OAuth. We fetch email metadata and content strictly based on your applied filters (read/unread status, lookback days, importance, and starred status). Firemail's use and transfer of information received from Google APIs to any other app will adhere to Google API Services User Data Policy, including the Limited Use requirements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-zinc-900">2. Local Vault & Encryption</h2>
            <p>
              Mails fetched to your local device are encrypted entirely within your browser utilizing AES-GCM standards. The cryptographic key is derived directly from your user ID and email address. This ensures that the raw fetched data at rest in your local environment cannot be read by any external party.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-zinc-900">3. AI Analysis Processing</h2>
            <p>
              When you actively select emails for analysis, only the specific subset of emails you choose is transmitted to our AI processing providers. This data is strictly utilized to generate derived insights and categorization options based on the payload. It is not used to train global AI models.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-zinc-900">4. Cloud Vault Storage</h2>
            <p>
              You may explicitly opt to sync analyzed emails to the Firemail Postgres cloud database. All synchronized data is subjected to robust server-side encryption prior to persistence. We do not aggregate, sell, or distribute your cloud vault data to third-party brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-zinc-900">5. Data Retention & Deletion</h2>
            <p>
              Local vault data can be cleared at any time by clearing your browser storage. Cloud vault data can be managed or permanently deleted through your account settings. Revoking OAuth access directly via your Google Account will instantly sever Firemail's ability to fetch new data.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}