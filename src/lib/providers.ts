export interface Provider {
  name: string;
  id: string;
  logo: string;
  logoClassName?: string;
  description?: string;
}

export const PROVIDERS: readonly Provider[] = [
  {
    name: 'Anthropic',
    id: 'anthropic',
    logo: '/providers/anthropic.png',
    logoClassName: 'h-4 sm:h-5 max-w-[130px]',
    description: 'Claude 3.7 Sonnet, Claude 3.5 Haiku, Claude 3 Opus',
  },
  {
    name: 'OpenAI',
    id: 'openai',
    logo: '/providers/openai.png',
    logoClassName: 'h-5.5 sm:h-6 max-w-[110px]',
    description: 'GPT-4o, GPT-4o-mini, o1, o3-mini',
  },
  {
    name: 'Google',
    id: 'google',
    logo: '/providers/google.png',
    logoClassName: 'h-5.5 sm:h-6 max-w-[95px]',
    description: 'Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 1.5 Flash',
  },
  {
    name: 'Amazon Bedrock',
    id: 'bedrock',
    logo: '/providers/amazon-bedrock.png',
    logoClassName: 'h-5.5 sm:h-6 max-w-[105px]',
    description: 'AWS Bedrock hosted foundation models',
  },
  {
    name: 'OpenRouter',
    id: 'openrouter',
    logo: '/providers/openrouter.png',
    logoClassName: 'h-4.5 sm:h-5 max-w-[130px]',
    description: 'Unified gateway to 100+ open and proprietary models',
  },
  {
    name: 'Perplexity',
    id: 'perplexity',
    logo: '/providers/perplexity.png',
    logoClassName: 'h-5 sm:h-5.5 max-w-[115px]',
    description: 'Sonar Pro, Sonar reasoning and search models',
  },
  {
    name: 'NVIDIA',
    id: 'nvidia',
    logo: '/providers/nvidia.png',
    logoClassName: 'h-7.5 sm:h-8 max-w-[50px]',
    description: 'NVIDIA NIM microservices and accelerated models',
  },
  {
    name: 'Groq',
    id: 'groq',
    logo: '/providers/groq.png',
    logoClassName: 'h-5 sm:h-5.5 max-w-[85px]',
    description: 'Ultra-fast LPU inference (Llama 3.3 70B, Mixtral)',
  },
  {
    name: 'Ollama',
    id: 'ollama',
    logo: '/providers/ollama.png',
    logoClassName: 'h-5.5 sm:h-6 max-w-[95px]',
    description: 'Local, air-gapped zero-data-leakage inference',
  },
  {
    name: 'DeepSeek',
    id: 'deepseek',
    logo: '/providers/deepseek.png',
    logoClassName: 'h-5.5 sm:h-6 max-w-[115px]',
    description: 'DeepSeek-V3, DeepSeek-R1 reasoning models',
  },
] as const;

export function isSupportedProvider(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return PROVIDERS.some(
    (p) => p.name.toLowerCase() === normalized || p.id.toLowerCase() === normalized
  );
}

export function getProviderByName(name: string): Provider | undefined {
  const normalized = name.trim().toLowerCase();
  return PROVIDERS.find(
    (p) => p.name.toLowerCase() === normalized || p.id.toLowerCase() === normalized
  );
}
