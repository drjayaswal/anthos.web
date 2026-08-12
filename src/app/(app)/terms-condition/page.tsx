'use client';

import { motion } from 'framer-motion';

export default function TermsAndConditions() {
  return (
    <div className="min-h-[94.15vh] p-7 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full bg-white shadow-2xl shadow-black/50 p-8 sm:p-12"
      >
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-8">Terms and Conditions</h1>

        <div className="space-y-8 text-zinc-600 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-zinc-900">1. Acceptance of Terms</h2>
            <p>
              By authenticating with Google and utilizing Firemail, you agree to these Terms and Conditions. If you do not agree with any part of these terms, you must immediately cease use of the service and revoke authentication privileges.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-zinc-900">2. Service Provision & Limitations</h2>
            <p>
              Firemail acts as a secure intermediary and analysis tool for your existing Gmail data. We do not guarantee uninterrupted functionality of the Gmail API, nor do we guarantee the absolute accuracy of the AI-derived analysis. The service is provided &quot;as is&quot; without warranties of any kind.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-zinc-900">3. User Responsibilities & Security</h2>
            <p>
              You are responsible for maintaining the security of the local machine from which you access Firemail. Because the Local Vault utilizes browser-based AES-GCM encryption derived from your authenticated identity, compromising your local environment or session token may compromise your cached data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-zinc-900">4. API Usage and Fair Use</h2>
            <p>
              Users must not abuse the fetching mechanisms. Excessive querying of the Gmail API via Firemail that triggers Google rate limits may result in temporary or permanent suspension of your Firemail syncing capabilities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-zinc-900">5. Limitation of Liability</h2>
            <p>
              In no event shall Firemail, its developers, or its affiliates be liable for any indirect, incidental, or consequential damages resulting from the use of the platform, the loss of data, unauthorized access to your cloud vault, or inaccuracies in AI-generated analysis.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}