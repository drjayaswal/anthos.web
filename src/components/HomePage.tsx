'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  logo: string;
  logoClassName?: string;
  logoWrapperClassName?: string;
  models: string[];
  description: string;
  badge: string;
  speed: string;
}

const PROVIDERS: Provider[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    logo: '/providers/anthropic.png',
    logoWrapperClassName: 'w-10 h-10',
    logoClassName: 'w-6 h-6',
    models: ['Claude 3.7 Sonnet', 'Claude 3.5 Haiku', 'Claude Opus'],
    description: 'Deep reasoning, nuanced human-like summarization, and exceptional instruction following.',
    badge: 'State-of-the-Art Reasoning',
    speed: '200k Context Window',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    logo: '/providers/openai.png',
    logoWrapperClassName: 'h-10 px-3 min-w-[80px]',
    logoClassName: 'h-5 w-auto max-w-[85px]',
    models: ['GPT-4o', 'GPT-4o mini', 'o1', 'o3-mini'],
    description: 'Industry-standard versatility, multimodal understanding, and reliable structured outputs.',
    badge: 'Universal Intelligence',
    speed: 'High Throughput',
  },
  {
    id: 'google',
    name: 'Google',
    logo: '/providers/google.png',
    logoWrapperClassName: 'h-10 px-3 min-w-[75px]',
    logoClassName: 'h-4.5 w-auto max-w-[75px]',
    models: ['Gemini 2.5 Pro', 'Gemini 2.0 Flash'],
    description: 'Massive 1M+ token context windows for processing huge email threads and attachments.',
    badge: '1M+ Token Context',
    speed: 'Ultra-Fast Flash',
  },
  {
    id: 'bedrock',
    name: 'Amazon Bedrock',
    logo: '/providers/amazon-bedrock.png',
    logoWrapperClassName: 'h-10 px-2.5 min-w-[65px]',
    logoClassName: 'h-7 w-auto max-w-[65px]',
    models: ['Claude on AWS', 'Llama 3 on Bedrock', 'Amazon Titan'],
    description: 'Enterprise VPC compliance, SOC2 certification, and managed cloud infrastructure.',
    badge: 'AWS Enterprise VPC',
    speed: 'Enterprise SLA',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    logo: '/providers/openrouter.png',
    logoWrapperClassName: 'w-10 h-10',
    logoClassName: 'w-6 h-6',
    models: ['200+ Models', 'Dynamic Auto-Routing', 'Cost Optimizer'],
    description: 'Single unified API key accessing over 200 foundation models with automatic fallback.',
    badge: '200+ Unified Models',
    speed: 'Smart Auto-Routing',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    logo: '/providers/perplexity.png',
    logoWrapperClassName: 'w-10 h-10',
    logoClassName: 'w-6 h-6',
    models: ['Sonar Pro', 'Sonar Online', 'Sonar Medium'],
    description: 'Live web-grounded email context and citation synthesis for market news and background.',
    badge: 'Web-Grounded Context',
    speed: 'Live Citations',
  },
  {
    id: 'nvidia',
    name: 'NVIDIA',
    logo: '/providers/nvidia.png',
    logoWrapperClassName: 'h-10 px-2 min-w-[55px]',
    logoClassName: 'h-7 w-auto max-w-[55px]',
    models: ['NVIDIA NIM', 'Llama 3 on TensorRT-LLM', 'DGX Cloud'],
    description: 'Ultra-low latency GPU microservices optimized for extreme high-frequency mail triage.',
    badge: 'TensorRT-LLM Powered',
    speed: '< 50ms Latency',
  },
  {
    id: 'groq',
    name: 'Groq',
    logo: '/providers/groq.png',
    logoWrapperClassName: 'h-10 px-3 min-w-[70px]',
    logoClassName: 'h-5 w-auto max-w-[70px]',
    models: ['Llama 3.3 70B Versatile', 'Mixtral 8x7B', 'Gemma 2'],
    description: 'Blazing-fast LPU inference engine delivering 500+ tokens/second for instantaneous inbox scoring.',
    badge: '500+ Tokens/Sec',
    speed: 'Instantaneous Scoring',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    logo: '/providers/ollama.png',
    logoWrapperClassName: 'w-10 h-10',
    logoClassName: 'w-6 h-6',
    models: ['Local Llama 3.3', 'Local Mistral', 'Local Qwen 2.5'],
    description: '100% offline, local-first on your machine. Zero email data ever leaves your computer.',
    badge: '100% Local & Offline',
    speed: 'Zero Data Leaves Device',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    logo: '/providers/deepseek.png',
    logoWrapperClassName: 'h-10 px-3 min-w-[85px]',
    logoClassName: 'h-4.5 w-auto max-w-[90px]',
    models: ['DeepSeek-V3', 'DeepSeek-R1 (Reasoning)'],
    description: 'Breakthrough open-weights reasoning model with chain-of-thought email prioritization.',
    badge: 'Open Weights Reasoning',
    speed: 'Chain-of-Thought',
  },
];

export default function HomePage() {
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
      </section>

      <section id="providers" className="relative z-10 w-full py-16 overflow-hidden border-y border-dashed dark:border-white/20 [html.light_&]:border-black/20 dark:bg-white/2 [html.light_&]:bg-white/60 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 text-center mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight dark:text-white [html.light_&]:text-black">
            Supported AI Providers
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-white/60 [html.light_&]:text-black/60 font-mono max-w-xl mx-auto">
            Connect any model with your own API keys or run completely offline with air-gapped local models
          </p>
        </div>
        <div className="relative w-full overflow-hidden mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)">
          <motion.div
            className="flex gap-4 w-max items-center py-2"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 32 }}
          >
            {[...PROVIDERS, ...PROVIDERS].map((provider, idx) => (
              <div
                key={`${provider.id}-${idx}`}
                className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl dark:bg-white/5 [html.light_&]:bg-black/1 border dark:border-white/10 [html.light_&]:border-black/5 transition-all duration-300 backdrop-blur-md shrink-0 shadow-sm group cursor-default"
              >
                <div
                  className={`rounded-xl bg-white flex items-center justify-center p-1.5 shadow-sm border border-black/5 ${
                    provider.logoWrapperClassName || 'w-10 h-10'
                  }`}
                >
                  <Image
                    src={provider.logo}
                    alt={provider.name}
                    width={120}
                    height={40}
                    className={`object-contain transition-transform duration-300 group-hover:scale-105 ${
                      provider.logoClassName || 'w-6 h-6'
                    }`}
                    unoptimized
                  />
                </div>
                <div className="flex flex-col text-left pr-1">
                  <span className="text-xs sm:text-sm font-bold text-white [html.light_&]:text-black tracking-tight whitespace-nowrap">
                    {provider.name}
                  </span>
                  <span className="text-[10px] font-mono text-purple-300 [html.light_&]:text-purple-700 whitespace-nowrap">
                    {provider.badge}
                  </span>
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
              Log in with Gmail or explore with simulated demo data. Pull recent or unread emails with full thread metadata.
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
