'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { CustomButton } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

import { PROVIDERS } from '@/lib/providers';

export default function HomePage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleContinue = () => {
    if (session?.user) {
      router.push('/analyze');
    } else {
      router.push('/connect');
    }
  };

  return (
    <div className="min-h-screen w-full sm:mt-0 mt-10 bg-[#2c0237] dark:text-white [html.light_&]:bg-gray-50 [html.light_&]:text-black transition-colors duration-300 overflow-x-hidden selection:bg-purple-500/30 selection:text-white">
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold [html.light_&]:text-black dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.1]"
        >
          Triage Your Inbox with{' '}
          <span className="dark:underline decoration-0 underline-offset-4 [html.light_&]:text-accent dark:text-white decoration-dashed">
            Any Model
          </span>{' '}
          You Like
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-sm sm:text-base md:text-lg dark:text-white/40 [html.light_&]:text-black/60 max-w-2xl mx-auto leading-relaxed"
        >
          Anthos brings continuous priority scoring (<code className="text-white font-mono font-bold">-1.0</code> to <code className="text-white font-mono font-bold">+1.0</code>), custom category mapping, and client-side zero-knowledge encryption across your Gmail communications.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <CustomButton
            onClick={handleContinue}
            className="cursor-pointer p-6 text-xl! rounded-2xl"
          >
            <span>Continue with Anthos</span>
          </CustomButton>
        </motion.div>
      </section>

      <section id="providers" className="relative z-10 w-full py-16 overflow-hidden border-y border-dashed dark:border-white/20 [html.light_&]:border-black/20 dark:bg-white/2 [html.light_&]:bg-black/2 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 text-center mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight dark:text-white [html.light_&]:text-black">
            Supported AI Providers
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-white/60 [html.light_&]:text-black/60 font-mono max-w-xl mx-auto">
          Connect any model with your own API keys with BYOK architecture
          </p>
        </div>
        <div className="relative w-full overflow-hidden dark:bg-white [html.light_&]:bg-white/90 border-y-6 border-double border-accent">
          <motion.div
            className="flex gap-8 sm:gap-12 w-max items-center py-4"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 32 }}
          >
            {[...PROVIDERS, ...PROVIDERS].map((provider, idx) => (
              <div
                key={`${provider.id}-${idx}`}
                className="flex items-center justify-center shrink-0 px-2"
                title={provider.name}
              >
                <div className="h-11 sm:h-12 flex items-center justify-center">
                  <Image
                    src={provider.logo}
                    alt={provider.name}
                    width={180}
                    height={48}
                    className={`w-auto object-contain transition-all duration-300 ${provider.id == "bedrock" && "scale-150"} select-none ${
                      provider.logoClassName || 'h-6'
                    }`}
                    unoptimized
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20 border-t border-dashed dark:border-white/20 [html.light_&]:border-black/20">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight dark:text-white [html.light_&]:text-black mt-2">
            How Anthos Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative p-6 rounded-4xl border-dashed dark:bg-white/5 [html.light_&]:bg-white border dark:border-white/20 [html.light_&]:border-black/20">
            <span className="text-4xl font-extrabold dark:text-white [html.light_&]:text-black font-mono">01</span>
            <h3 className="text-base font-bold text-white [html.light_&]:text-black mt-2">
              Connect & Fetch
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-white/70 [html.light_&]:text-black/70 leading-relaxed">
              Log in with Gmail. Pull recent or unread emails with full thread metadata.
            </p>
          </div>

          <div className="relative p-6 rounded-4xl border-dashed dark:bg-white/5 [html.light_&]:bg-white border dark:border-white/20 [html.light_&]:border-black/20">
            <span className="text-4xl font-extrabold dark:text-white [html.light_&]:text-black font-mono">02</span>
            <h3 className="text-base font-bold text-white [html.light_&]:text-black mt-2">
              Select Your AI Model
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-white/70 [html.light_&]:text-black/70 leading-relaxed">
              Pick from Anthropic, OpenAI, Google, Groq, Ollama, DeepSeek, or any of our 10 providers. Run multi-model scoring.
            </p>
          </div>

          <div className="relative p-6 rounded-4xl border-dashed dark:bg-white/5 [html.light_&]:bg-white border dark:border-white/20 [html.light_&]:border-black/20">
            <span className="text-4xl font-extrabold dark:text-white [html.light_&]:text-black font-mono">03</span>
            <h3 className="text-base font-bold text-white [html.light_&]:text-black mt-2">
              Prioritize & Encrypt
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-white/70 [html.light_&]:text-black/70 leading-relaxed">
              Triage with priority scatter plots and categorize instantly. Persist sensitive summaries encrypted into your vault.
            </p>
          </div>
        </div>
      </section>

      <section id="security" className="relative sm:blur sm:hover:blur-none sm:transition-all sm:duration-500 bg-white [html.light_&]:bg-accent border-dashed dark:border-accent [html.light_&]:border-white sm:border-3 border-x-0 sm:rounded-[40px] z-10 w-full max-w-7xl mx-auto p-6 sm:p-10">
        <div className="max-w-3xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight dark:text-black [html.light_&]:text-white">
            Your Email Data Belongs to You Alone.
          </h2>
          <p className="mt-4 text-sm sm:text-base dark:text-black [html.light_&]:text-white leading-relaxed">
            Unlike traditional email clients or browser extensions that harvest your inbox contents to train ad profiles, Anthos never stores plain-text emails. All database records use AES-256-GCM encryption with client-side keys, and when using Ollama, no data ever leaves your computer.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium dark:text-black [html.light_&]:text-white">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 accent" />
              Zero Plaintext Email Persistence
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 accent" />
              Air-Gapped Ollama Support
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 accent" />
              Client-Controlled API Keys
            </span>
          </div>
        </div>
      </section>

      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl sm:text-5xl font-extrabold dark:text-white [html.light_&]:text-black tracking-tight">
          Ready to Take Control of Your Inbox?
        </h2>
      </section>
    </div>
  );
}
