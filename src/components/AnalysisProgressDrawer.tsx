'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, X, Trash2, ChevronRightIcon } from 'lucide-react';
import type { Mail, AnalysisModel, EmailAnalysisResult } from '@/types';
import { runEmailAnalysisAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

export interface LiveLogItem {
  id: string;
  time: string;
  level: string;
  tag: string;
  stage: 'clean' | 'regex' | 'llm' | 'supervisor' | 'retry' | 'complete' | 'info' | 'error';
  message?: string;
}
const TAG_STYLES: Record<string, string> = {
  CLEAN: 'bg-cyan-500',
  REGEX: 'bg-teal-500',
  REVIEW: 'bg-amber-500',
  LLM: 'bg-purple-600',
  APPROVED: 'bg-emerald-600',
  RETRY: 'bg-orange-500',
  DONE: 'bg-green-600',
  ERROR: 'bg-red-600',
  INFO: 'bg-blue-600',
  START: 'bg-indigo-500',
  CONNECT: 'bg-sky-600',
};


interface AnalysisProgressDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  active: boolean;
  onActiveChange?: (active: boolean) => void;
  emails: Mail[];
  model: AnalysisModel;
  onComplete: (results: EmailAnalysisResult[]) => void;
  onStreamStateChange?: (streaming: boolean, done: boolean) => void;
  onDismiss?: () => void;
  savedLogs?: LiveLogItem[];
  onLogsChange?: (logs: LiveLogItem[]) => void;
  onClearLogs?: () => void;
}

function parseLogStage(message: string): {
  stage: 'clean' | 'regex' | 'llm' | 'supervisor' | 'retry' | 'complete' | 'info' | 'error';
  tag: string;
  cleanMessage: string;
} {
  const lower = message.toLowerCase();

  if (lower.includes('cleaning email')) {
    return { stage: 'clean', tag: 'CLEAN', cleanMessage: 'Cleaning email content' };
  }
  if (lower.includes('running regex categorization') || lower.includes('running regex')) {
    return { stage: 'regex', tag: 'REGEX', cleanMessage: 'Running regex categorization' };
  }
  if (lower.includes('supervisor approved')) {
    return { stage: 'supervisor', tag: 'APPROVED', cleanMessage: 'Supervisor approved category' };
  }
  if (lower.includes('supervisor rejected')) {
    return { stage: 'retry', tag: 'RETRY', cleanMessage: 'Supervisor rejected category' };
  }
  if (lower.includes('reclassifying')) {
    return { stage: 'retry', tag: 'RETRY', cleanMessage: 'Reclassifying rejected email' };
  }
  if (lower.includes('running supervisor review') || lower.includes('semaphore for supervisor') || lower.includes('supervisor llm')) {
    return { stage: 'supervisor', tag: 'REVIEW', cleanMessage: 'Running supervisor review' };
  }
  if (lower.includes('categorized as')) {
    const match = message.match(/categorized as ['"]?([^'",\n)]+)['"]?/i);
    const cat = match ? match[1].trim() : '';
    const cleanMsg = cat ? `Categorized as ${cat}`.split(' ').slice(0, 5).join(' ') : 'Email categorized by LLM';
    return { stage: 'llm', tag: 'LLM', cleanMessage: cleanMsg };
  }
  if (lower.includes('running llm categorization') || lower.includes('semaphore for categorization') || lower.includes('classification llm') || lower.includes('sending to llm')) {
    return { stage: 'llm', tag: 'LLM', cleanMessage: 'Running LLM categorization' };
  }
  if (lower.includes('completed') || lower.includes('finished analysis') || lower.includes('total analysis time')) {
    return { stage: 'complete', tag: 'DONE', cleanMessage: 'Analysis completed successfully' };
  }
  if (lower.includes('error') || lower.includes('failed')) {
    return { stage: 'error', tag: 'ERROR', cleanMessage: 'Analysis execution failed' };
  }
  const words = message.trim().split(/\s+/).slice(0, 5).join(' ');
  return { stage: 'info', tag: 'INFO', cleanMessage: words || 'Processing queue' };
}

const ERROR_DISPLAY_MAP: Record<string, string> = {
  INVALID_PAYLOAD: 'Invalid email selection. Please select valid emails.',
  INVALID_PROVIDER: 'Unsupported AI provider. Please check Settings.',
  MISSING_API_KEY: 'API key is missing. Please configure your key in Settings.',
  MODEL_NOT_FOUND: 'Model not found. Please check your model name in Settings.',
  LLM_INIT_FAILED: 'Model not found or unavailable. Check model name in Settings.',
  INVALID_API_KEY: 'Invalid API key. Please check your API key in Settings.',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please wait a moment and try again.',
  TOKEN_LIMIT_EXCEEDED: 'Email content exceeds model context limit.',
  PROVIDER_UNAVAILABLE: 'AI provider is unreachable. Please try again later.',
  LLM_ERROR: 'AI model failed to process the emails.',
  CONNECTION_FAILED: 'Unable to connect to AI server. Check your connection.',
  ANALYSIS_FAILED: 'Analysis failed. Please try again.',
};

function getShortErrorMessage(rawError?: string, errorCode?: string): string {
  if (errorCode && ERROR_DISPLAY_MAP[errorCode]) {
    return ERROR_DISPLAY_MAP[errorCode];
  }
  if (!rawError || typeof rawError !== 'string') {
    return 'Analysis failed. Please try again.';
  }

  const trimmed = rawError.trim();
  const lower = trimmed.toLowerCase();

  // Model not found or unavailable
  if (
    lower.includes('model_not_found') ||
    lower.includes('model not found') ||
    lower.includes('does not exist') ||
    lower.includes('do not have access') ||
    lower.includes('no such model') ||
    lower.includes('404')
  ) {
    return ERROR_DISPLAY_MAP.LLM_INIT_FAILED;
  }

  // API key / Authentication
  if (
    lower.includes('api key') ||
    lower.includes('api_key') ||
    lower.includes('401') ||
    lower.includes('unauthorized') ||
    lower.includes('forbidden') ||
    lower.includes('credentials') ||
    lower.includes('permission denied')
  ) {
    return ERROR_DISPLAY_MAP.INVALID_API_KEY;
  }

  // Rate limits
  if (
    lower.includes('rate limit') ||
    lower.includes('429') ||
    lower.includes('quota') ||
    lower.includes('too many requests') ||
    lower.includes('resource_exhausted')
  ) {
    return ERROR_DISPLAY_MAP.RATE_LIMIT_EXCEEDED;
  }

  // Token limits
  if (
    lower.includes('context length') ||
    lower.includes('maximum context') ||
    lower.includes('token limit') ||
    lower.includes('prompt too large')
  ) {
    return ERROR_DISPLAY_MAP.TOKEN_LIMIT_EXCEEDED;
  }

  // Provider unsupported
  if (lower.includes('unsupported provider')) {
    return ERROR_DISPLAY_MAP.INVALID_PROVIDER;
  }

  // Unreachable / connection
  if (
    lower.includes('connection refused') ||
    lower.includes('timed out') ||
    lower.includes('timeout') ||
    lower.includes('network') ||
    lower.includes('502') ||
    lower.includes('503') ||
    lower.includes('504') ||
    lower.includes('unreachable')
  ) {
    return ERROR_DISPLAY_MAP.PROVIDER_UNAVAILABLE;
  }

  // If message contains JSON syntax or traceback or is verbose, use clean generic message
  if (trimmed.includes('{') || trimmed.includes('Traceback') || trimmed.length > 75) {
    return ERROR_DISPLAY_MAP.ANALYSIS_FAILED;
  }

  return trimmed;
}

export default function AnalysisProgressDrawer({
  open,
  onOpenChange,
  active,
  onActiveChange,
  emails,
  model,
  onComplete,
  onStreamStateChange,
  savedLogs,
  onLogsChange,
  onClearLogs,
}: AnalysisProgressDrawerProps) {
  const [logs, setLogs] = useState<LiveLogItem[]>(() => savedLogs || []);
  const [statusMessage, setStatusMessage] = useState<string>(() =>
    savedLogs && savedLogs.length > 0
      ? `Analysis complete (${savedLogs.length} logs recorded)`
      : 'Connecting to Anthos AI stream...'
  );
  const [isDone, setIsDone] = useState<boolean>(() => !active && Boolean(savedLogs && savedLogs.length > 0));
  const [hasError, setHasError] = useState<boolean>(false);
  const [internalActive, setInternalActive] = useState<boolean>(active);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  useEffect(() => {
    setInternalActive(active);
    if (active) {
      setHasError(false);
    }
  }, [active]);

  const isDrawerActive = internalActive && active && !hasError && !isDone;

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pendingResultsRef = useRef<EmailAnalysisResult[] | null>(null);

  const logsRef = useRef(logs);
  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  const onLogsChangeRef = useRef(onLogsChange);
  useEffect(() => {
    onLogsChangeRef.current = onLogsChange;
  }, [onLogsChange]);

  const onClearLogsRef = useRef(onClearLogs);
  useEffect(() => {
    onClearLogsRef.current = onClearLogs;
  }, [onClearLogs]);

  const handleClearLogs = useCallback(() => {
    try {
      localStorage.removeItem('anthos_analysis_logs');
    } catch { }
    setLogs([]);
    setIsDone(false);
    setStatusMessage('No analysis logs recorded');
    onLogsChangeRef.current?.([]);
    onClearLogsRef.current?.();
    toast.success('Analysis logs deleted from storage');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!active && savedLogs && savedLogs.length > 0 && logs.length === 0) {
      setLogs(savedLogs);
      setIsDone(true);
      setStatusMessage(`Analysis complete (${savedLogs.length} logs recorded)`);
    }
  }, [savedLogs, active, logs.length]);

  const pushLogItem = useCallback((
    tag: string,
    level = 'INFO',
    stage?: 'clean' | 'regex' | 'llm' | 'supervisor' | 'retry' | 'complete' | 'info' | 'error',
    message?: string
  ) => {
    let finalStage = stage;
    let finalTag = tag;
    let finalMessage = message;
    if (!finalStage || !finalMessage) {
      const parsed = parseLogStage(message || tag);
      if (!finalStage) finalStage = parsed.stage;
      if (!finalTag) finalTag = parsed.tag;
      if (!finalMessage) finalMessage = parsed.cleanMessage;
    }

    const item: LiveLogItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      level,
      tag: finalTag,
      stage: finalStage,
      message: finalMessage,
    };

    setLogs((prev) => [...prev, item]);
  }, []);

  useEffect(() => {
    if ((isDone || hasError || !open) && logs.length > 0) {
      onLogsChangeRef.current?.(logs);
    }
  }, [isDone, hasError, open, logs]);

  useEffect(() => {
    return () => {
      if (logsRef.current.length > 0) {
        onLogsChangeRef.current?.(logsRef.current);
      }
    };
  }, []);

  const callbacksRef = useRef({ onStreamStateChange, onComplete, onOpenChange, onActiveChange });
  useEffect(() => {
    callbacksRef.current = { onStreamStateChange, onComplete, onOpenChange, onActiveChange };
  }, [onStreamStateChange, onComplete, onOpenChange, onActiveChange]);

  const emailsRef = useRef(emails);
  const modelRef = useRef(model);
  useEffect(() => {
    emailsRef.current = emails;
    modelRef.current = model;
  }, [emails, model]);

  const finishAnalysis = useCallback((results: EmailAnalysisResult[]) => {
    pendingResultsRef.current = results;
    setIsDone(true);
    setInternalActive(false);
    setStatusMessage(`Analysis complete! ${results.length} email(s) processed.`);
    callbacksRef.current.onStreamStateChange?.(false, true);
    callbacksRef.current.onActiveChange?.(false);
    if (logsRef.current.length > 0) {
      onLogsChangeRef.current?.(logsRef.current);
    }
    setTimeout(() => {
      callbacksRef.current.onOpenChange(false);
      setTimeout(() => {
        callbacksRef.current.onComplete(results);
      }, 300);
    }, 600);
  }, []);

  const handleAnalysisError = useCallback((errorMessage?: string, errorCode?: string) => {
    setInternalActive(false);
    setHasError(true);
    callbacksRef.current.onActiveChange?.(false);
    callbacksRef.current.onStreamStateChange?.(false, false);
    const cleanMsg = getShortErrorMessage(errorMessage, errorCode);
    pushLogItem('ERROR', 'ERROR', 'error', 'Analysis failed');
    setStatusMessage(cleanMsg);
    if (logsRef.current.length > 0) {
      onLogsChangeRef.current?.(logsRef.current);
    }
    setTimeout(() => {
      callbacksRef.current.onOpenChange(false);
      setTimeout(() => {
        toast.error(cleanMsg);
      }, 300);
    }, 600);
  }, [pushLogItem]);

  useEffect(() => {
    if (!active) {
      if (wsRef.current) {
        try {
          wsRef.current.close(1000, 'Inactive');
        } catch { }
        wsRef.current = null;
      }
      return;
    }

    // New analysis starting: delete old logs from state, parent, and localStorage
    try {
      localStorage.removeItem('anthos_analysis_logs');
    } catch { }
    setLogs([]);
    onLogsChangeRef.current?.([]);
    setIsDone(false);
    setHasError(false);
    setStatusMessage('Connecting to Anthos AI...');
    pendingResultsRef.current = null;
    callbacksRef.current.onStreamStateChange?.(true, false);

    const currentEmails = emailsRef.current;
    const currentModel = modelRef.current;

    const aiHttpUrl = process.env.NEXT_PUBLIC_AI_SERVER_URL || 'http://localhost:8000';
    const wsUrl = aiHttpUrl.replace(/^http/, 'ws').replace(/\/+$/, '') + '/analyse';

    let socket: WebSocket | null = null;
    let fallbackTriggered = false;
    let completed = false;
    let unmounted = false;

    const triggerHttpFallback = async (reason: string) => {
      if (fallbackTriggered || completed || unmounted) return;
      fallbackTriggered = true;

      pushLogItem('CONNECT', 'WARN', 'info', `Connection closed: ${reason}`);
      pushLogItem('LLM', 'INFO', 'llm', 'Analyzing via fallback');
      setStatusMessage('Analyzing emails via HTTP fallback...');

      try {
        const res = await runEmailAnalysisAction(currentEmails, currentModel);
        if (unmounted) return;
        if (res.ok && res.results) {
          completed = true;
          pushLogItem('DONE', 'INFO', 'complete', 'Analysis completed successfully');
          finishAnalysis(res.results);
        } else {
          completed = true;
          handleAnalysisError(res.error, 'ANALYSIS_FAILED');
        }
      } catch {
        if (unmounted) return;
        completed = true;
        handleAnalysisError('Unable to connect to AI server. Check your connection.', 'CONNECTION_FAILED');
      }
    };

    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        if (unmounted) return;
        pushLogItem('CONNECT', 'INFO', 'info', 'Connected to AI stream');
        setStatusMessage('Transmitting emails and model settings...');

        const payload = {
          emails: currentEmails.map((m) => ({
            id: m.id,
            subject: m.subject || null,
            body: m.body || '',
            sender: m.sender || '',
            threadId: m.threadId || m.id,
          })),
          model: {
            id: currentModel.id,
            name: currentModel.name,
            provider: currentModel.provider,
            default: currentModel.default === true,
          },
        };
        socket?.send(JSON.stringify(payload));
      };

      socket.onmessage = (event) => {
        if (unmounted) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'confirmation') {
            setStatusMessage(data.message || `Processing ${data.email_count || currentEmails.length} email(s)...`);
            pushLogItem('START', 'INFO', 'info', 'Processing email queue');
          } else if (data.type === 'log') {
            const parsed = data.message ? parseLogStage(data.message) : null;
            const tag = data.tag || parsed?.tag || 'INFO';
            const stage = (data.stage as LiveLogItem['stage']) || parsed?.stage || 'info';
            const message = data.message || parsed?.cleanMessage;
            pushLogItem(tag, data.level || 'INFO', stage, message);
          } else if (data.type === 'complete') {
            if (data.results && Array.isArray(data.results)) {
              completed = true;
              pushLogItem('DONE', 'INFO', 'complete', 'Analysis completed successfully');
              finishAnalysis(data.results);
            } else {
              completed = true;
              handleAnalysisError('Analysis completed with invalid response format.', 'ANALYSIS_FAILED');
            }
          } else if (data.type === 'error') {
            completed = true;
            const errorCode: string = data.error_code || 'ANALYSIS_FAILED';
            handleAnalysisError(data.message, errorCode);
          } else {
            // Unexpected response or unrecognized message format
            completed = true;
            const unexpectedMsg =
              (typeof data.message === 'string' && data.message) ||
              (typeof data.detail === 'string' && data.detail) ||
              (typeof data.error === 'string' && data.error) ||
              'Received unexpected response from AI server.';
            handleAnalysisError(unexpectedMsg, data.error_code || 'ANALYSIS_FAILED');
          }
        } catch {
          completed = true;
          handleAnalysisError('Received unexpected non-JSON response from server.', 'ANALYSIS_FAILED');
        }
      };

      socket.onerror = () => {
        if (!unmounted && !completed) {
          triggerHttpFallback('Network error or origin policy mismatch');
        }
      };

      socket.onclose = (event) => {
        if (!unmounted && !completed && !pendingResultsRef.current && event.code !== 1000) {
          triggerHttpFallback(`Code ${event.code} ${event.reason || ''}`);
        }
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to instantiate connection';
      triggerHttpFallback(msg);
    }

    return () => {
      unmounted = true;
      if (socket) {
        try {
          socket.close(1000, 'Unmounted');
        } catch { }
      }
      wsRef.current = null;
    };
  }, [active, pushLogItem, finishAnalysis]);


  useEffect(() => {
    if (open && autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, open]);

  const handleScroll = () => {
    if (!terminalContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = terminalContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 40;
    setAutoScroll(atBottom);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="analysis-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-1000"
            onClick={() => onOpenChange(false)}
          />

          <motion.aside
            key="analysis-drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed top-0 right-0 z-10000 w-full sm:w-60 h-full bg-white border-l flex flex-col overflow-hidden text-black select-text"
          >
            {/* Header */}
            <div className="py-3 px-4 sm:px-3 border-b border-black/10 flex items-center justify-between gap-3 shrink-0 bg-white/95 backdrop-blur-xs">
              <div className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false)
                  }}
                  className="flex items-center gap-1 p-1.5 transition-all duration-200 rounded-4xl disabled:opacity-20 disabled:cursor-not-allowed text-xs cursor-pointer"
                >
                  <ChevronRightIcon className="size-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleClearLogs}
                  disabled={logs.length === 0 || isDrawerActive}
                  title="Delete logs from local storage"
                  aria-label="Delete logs from local storage"
                  className="flex items-center gap-1 px-2 py-1.5 border border-dashed border-black/20 hover:border-red-600 hover:bg-red-600 transition-all duration-200 rounded-md disabled:opacity-20 disabled:cursor-not-allowed text-xs cursor-pointer"
                >
                  <span className='hidden sm:block text-xs'>Erase</span>
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Terminal logs list */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-white">
              <div
                ref={terminalContainerRef}
                onScroll={handleScroll}
                className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-3 font-mono text-[11px] space-y-1.5 scrollbar-thin w-full"
              >
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-xs gap-2 py-16">
                    {isDrawerActive ? (
                      <>
                        <RotateCw className="size-4 animate-spin text-zinc-500" />
                        <span className="font-sans text-zinc-500">Connecting to stream...</span>
                      </>
                    ) : (
                      <span className="font-sans">Nothing to show here...</span>
                    )}
                  </div>
                ) : (
                  logs.map((log) => {
                    const tagBg = TAG_STYLES[log.tag] ?? 'bg-black';

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: 4 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 leading-relaxed py-0.5"
                      >
                        {/* Timestamp */}
                        <span className="w-13 text-black/40 text-[10px] shrink-0 select-none">
                          {log.time}
                        </span>

                        {/* Fixed-size Badge */}
                        <span
                          className={cn(
                            'inline-flex items-center justify-center w-16 h-4 text-[8.5px] rounded text-white font-bold shrink-0 tracking-wide',
                            tagBg
                          )}
                        >
                          {log.tag}
                        </span>

                        {/* Meaningful short message (<= 5 words) */}
                        {log.message && (
                          <span className="text-black/80 text-[11px] font-sans font-medium truncate min-w-0 flex-1 select-text">
                            {log.message}
                          </span>
                        )}
                      </motion.div>
                    );
                  })
                )}
                <div ref={terminalEndRef} />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
