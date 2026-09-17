'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, X, Trash2, ChevronRightIcon, MessageSquare, AlertTriangle } from 'lucide-react';
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
  TIME: 'bg-fuchsia-700',
};

const TAG_BORDERS: Record<string, string> = {
  CLEAN: 'border-cyan-500',
  REGEX: 'border-teal-500',
  REVIEW: 'border-amber-500',
  LLM: 'border-purple-600',
  APPROVED: 'border-emerald-600',
  RETRY: 'border-orange-500',
  DONE: 'border-green-600',
  ERROR: 'border-red-600',
  INFO: 'border-blue-600',
  START: 'border-indigo-500',
  CONNECT: 'border-sky-600',
  TIME: 'border-fuchsia-700',
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

  if (
    lower.includes('rate limit') ||
    lower.includes('429') ||
    lower.includes('quota') ||
    lower.includes('too many requests') ||
    lower.includes('resource_exhausted')
  ) {
    return ERROR_DISPLAY_MAP.RATE_LIMIT_EXCEEDED;
  }

  if (
    lower.includes('context length') ||
    lower.includes('maximum context') ||
    lower.includes('token limit') ||
    lower.includes('prompt too large')
  ) {
    return ERROR_DISPLAY_MAP.TOKEN_LIMIT_EXCEEDED;
  }

  if (lower.includes('unsupported provider')) {
    return ERROR_DISPLAY_MAP.INVALID_PROVIDER;
  }

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
  const [showMessages, setShowMessages] = useState<boolean>(false);
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);

  useEffect(() => {
    setInternalActive(active);
    if (active) {
      setHasError(false);
      setShowConfirmClear(false);
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

  const requestClearLogs = useCallback(() => {
    if (logs.length === 0 || isDrawerActive) return;
    setShowConfirmClear(true);
  }, [logs.length, isDrawerActive]);

  const cancelClearLogs = useCallback(() => {
    setShowConfirmClear(false);
  }, []);

  const confirmClearLogs = useCallback(() => {
    setShowConfirmClear(false);
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
      if (e.key === 'Escape') {
        if (showConfirmClear) {
          setShowConfirmClear(false);
          return;
        }
        onOpenChange(false);
      }
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange, showConfirmClear]);

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
            transition={{
              x: { type: 'spring', damping: 32, stiffness: 300, mass: 0.8 },
              width: { duration: 0.28, ease: [0.32, 0.72, 0, 1] },
            }}
            className={cn(
              "fixed top-0 right-0 z-10000 h-full bg-white border-l flex flex-col overflow-hidden text-black select-text transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
              showMessages ? "w-full sm:w-85" : "w-full sm:w-37"
            )}
          >
            <div className="py-3 px-4 sm:px-3 border-b border-black/10 flex items-center justify-between gap-2 shrink-0 bg-white/95 backdrop-blur-xs">
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

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (!showConfirmClear) {
                      setShowMessages((prev) => !prev)
                    }
                  }}
                  title={showMessages ? "Hide messages" : "Show messages"}
                  aria-label={showMessages ? "Hide messages" : "Show messages"}
                  className={cn(
                    "flex items-center justify-center gap-1 px-2 py-1.5 transition-all rounded-md duration-200 text-xs cursor-pointer select-none",
                    showMessages
                      ? "text-indigo-600 bg-indigo-600/10"
                      : "text-black"
                  )}
                >
                  <span className="hidden sm:inline text-xs">{showMessages ? "Hide" : "Show"}</span>
                  <MessageSquare className="size-3.5 sm:hidden" />
                </button>
                {showMessages &&
                  <button
                    type="button"
                    onClick={requestClearLogs}
                    disabled={logs.length === 0 || isDrawerActive}
                    title="Delete logs from local storage"
                    aria-label="Delete logs from local storage"
                    className="flex items-center justify-center gap-1 sm:px-2 sm:py-1.5 not-disabled:hover:text-red-600 transition-all duration-200 rounded-md disabled:opacity-20 disabled:cursor-not-allowed text-xs cursor-pointer"
                  >
                    <span className="hidden sm:inline text-xs">Clear</span>
                    <Trash2 className="size-3.5 sm:hidden" />
                  </button>
                }
              </div>
            </div>

            <div className="relative flex-1 min-h-0 overflow-hidden flex flex-col bg-white">
              <div
                ref={terminalContainerRef}
                onScroll={handleScroll}
                className={cn(
                  "flex-1 min-h-0 px-4 sm:px-3 py-3 font-mono text-[11px] space-y-1.5 scrollbar-thin w-full transition-all duration-200",
                  showConfirmClear
                    ? "overflow-hidden filter blur-xs pointer-events-none select-none opacity-50"
                    : "overflow-y-auto"
                )}
              >
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-xs gap-2 py-16">
                    {isDrawerActive ? (
                      <>
                        <RotateCw className="size-4 animate-spin text-zinc-500" />
                        <span className="font-sans text-zinc-500">Connecting to stream...</span>
                      </>
                    ) : (
                      <span className="font-sans">{showMessages ? "Nothing to show" : "No messages"}</span>
                    )}
                  </div>
                ) : (
                  logs.map((log) => {
                    const tagBg = TAG_STYLES[log.tag] ?? 'bg-black';
                    const tagBorder = TAG_BORDERS[log.tag] ?? 'border-black';

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: 4 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 leading-relaxed py-0.5"
                      >
                        <span className="w-10 text-black/40 text-[10px] shrink-0 select-none">
                          {log.time}
                        </span>

                        <div className={cn("pt-0 px-0.5 pb-0.5 border border-dashed rounded-md border-black shrink-0", tagBorder)}>
                          <span
                            className={cn(
                              'inline-flex items-center justify-center w-16 h-4 text-[8.5px] rounded-sm text-white font-bold shrink-0 tracking-wide',
                              tagBg
                            )}
                          >
                            {log.tag}
                          </span>
                        </div>

                        {showMessages && log.message && (
                          <span className="text-black/40 text-[11px] font-sans font-medium truncate min-w-0 flex-1 select-text">
                            {log.message}
                          </span>
                        )}
                      </motion.div>
                    );
                  })
                )}
                <div ref={terminalEndRef} />
              </div>

              <AnimatePresence>
                {showConfirmClear && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-white/40 backdrop-blur-xs select-none"
                  >
                    <div className="w-full max-w-65 bg-white border border-dashed border-black/30 rounded-xl p-4 flex flex-col items-center text-center space-y-3">
                      <div className="p-2 rounded-full bg-red-600/10 text-red-600">
                        <AlertTriangle className="size-4" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-black tracking-tight">Clear all logs?</h4>
                        <p className="text-[11px] text-black/60 leading-normal">
                          This will remove all recorded session logs from storage.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full pt-1">
                        <button
                          type="button"
                          onClick={cancelClearLogs}
                          className="flex-1 px-3 py-1.5 text-black text-xs font-medium transition-colors cursor-pointer"
                        >
                          No
                        </button>
                        <button
                          type="button"
                          onClick={confirmClearLogs}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-dashed border-red-600 text-red-600 hover:text-white hover:bg-red-600 text-xs font-medium transition-colors shadow-xs cursor-pointer"
                        >
                          Yes, clear
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
