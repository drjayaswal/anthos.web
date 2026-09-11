'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, X } from 'lucide-react';
import type { Mail, AnalysisModel, EmailAnalysisResult } from '@/types';
import { runEmailAnalysisAction } from '@/app/actions';
import { cn } from '@/lib/utils';

export interface LiveLogItem {
  id: string;
  time: string;
  level: string;
  tag: string;
  message: string;
  stage: 'clean' | 'regex' | 'llm' | 'supervisor' | 'retry' | 'complete' | 'info' | 'error';
}

interface AnalysisProgressDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  active: boolean;
  emails: Mail[];
  model: AnalysisModel;
  onComplete: (results: EmailAnalysisResult[]) => void;
  onStreamStateChange?: (streaming: boolean, done: boolean) => void;
  onDismiss?: () => void;
  savedLogs?: LiveLogItem[];
  onLogsChange?: (logs: LiveLogItem[]) => void;
}

function parseLogStage(message: string): {
  stage: 'clean' | 'regex' | 'llm' | 'supervisor' | 'retry' | 'complete' | 'info' | 'error';
  tag: string;
  cleanMessage: string;
} {
  const lower = message.toLowerCase();

  if (lower.includes('cleaning email')) {
    return { stage: 'clean', tag: 'CLEAN', cleanMessage: message };
  }
  if (lower.includes('running regex categorization')) {
    return { stage: 'regex', tag: 'REGEX', cleanMessage: message };
  }
  if (lower.includes('supervisor approved')) {
    return {
      stage: 'supervisor',
      tag: 'APPROVED',
      cleanMessage: message.replace(/\|\s*$/, '').trim(),
    };
  }
  if (lower.includes('supervisor rejected') || lower.includes('reclassifying')) {
    return {
      stage: 'retry',
      tag: 'RETRY',
      cleanMessage: message.replace(/\|\s*$/, '').trim(),
    };
  }
  if (lower.includes('running supervisor review') || lower.includes('semaphore for supervisor') || lower.includes('supervisor llm')) {
    return { stage: 'supervisor', tag: 'REVIEW', cleanMessage: message };
  }
  if (lower.includes('categorized as')) {
    return {
      stage: 'llm',
      tag: 'LLM',
      cleanMessage: message,
    };
  }
  if (lower.includes('running llm categorization') || lower.includes('semaphore for categorization') || lower.includes('classification llm') || lower.includes('sending to llm')) {
    return { stage: 'llm', tag: 'LLM', cleanMessage: message };
  }
  if (lower.includes('completed') || lower.includes('finished analysis') || lower.includes('total analysis time')) {
    return { stage: 'complete', tag: 'DONE', cleanMessage: message };
  }
  if (lower.includes('error') || lower.includes('failed')) {
    return { stage: 'error', tag: 'ERROR', cleanMessage: message };
  }
  return { stage: 'info', tag: 'INFO', cleanMessage: message };
}

export default function AnalysisProgressDrawer({
  open,
  onOpenChange,
  active,
  emails,
  model,
  onComplete,
  onStreamStateChange,
  savedLogs,
  onLogsChange,
}: AnalysisProgressDrawerProps) {
  const [logs, setLogs] = useState<LiveLogItem[]>(() => savedLogs || []);
  const [statusMessage, setStatusMessage] = useState<string>(() =>
    savedLogs && savedLogs.length > 0
      ? `Analysis complete (${savedLogs.length} logs recorded)`
      : 'Connecting to Anthos AI stream...'
  );
  const [isDone, setIsDone] = useState<boolean>(() => !active && Boolean(savedLogs && savedLogs.length > 0));
  const [hasError, setHasError] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

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

  useEffect(() => {
    if (!active && savedLogs && savedLogs.length > 0 && logs.length === 0) {
      setLogs(savedLogs);
      setIsDone(true);
      setStatusMessage(`Analysis complete (${savedLogs.length} logs recorded)`);
    }
  }, [savedLogs, active, logs.length]);

  const pushLogItem = useCallback((
    rawMsg: string,
    level = 'INFO',
    forcedStage?: 'clean' | 'regex' | 'llm' | 'supervisor' | 'retry' | 'complete' | 'info' | 'error'
  ) => {
    const parsed = parseLogStage(rawMsg);
    const stage = forcedStage || parsed.stage;

    const item: LiveLogItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      level,
      tag: parsed.tag,
      message: parsed.cleanMessage,
      stage,
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

  const callbacksRef = useRef({ onStreamStateChange, onComplete, onOpenChange });
  useEffect(() => {
    callbacksRef.current = { onStreamStateChange, onComplete, onOpenChange };
  }, [onStreamStateChange, onComplete, onOpenChange]);

  const emailsRef = useRef(emails);
  const modelRef = useRef(model);
  useEffect(() => {
    emailsRef.current = emails;
    modelRef.current = model;
  }, [emails, model]);

  const finishAnalysis = useCallback((results: EmailAnalysisResult[]) => {
    pendingResultsRef.current = results;
    setIsDone(true);
    setStatusMessage(`Analysis complete! ${results.length} email(s) processed.`);
    callbacksRef.current.onStreamStateChange?.(false, true);
    if (logsRef.current.length > 0) {
      onLogsChangeRef.current?.(logsRef.current);
    }
    setTimeout(() => {
      callbacksRef.current.onOpenChange(false);
      callbacksRef.current.onComplete(results);
    }, 600);
  }, []);

  useEffect(() => {
    if (!active) {
      if (wsRef.current) {
        try {
          wsRef.current.close(1000, 'Inactive');
        } catch {}
        wsRef.current = null;
      }
      return;
    }

    setLogs([]);
    setIsDone(false);
    setHasError(false);
    setStatusMessage('Connecting to Anthos AI stream...');
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

      pushLogItem(`WebSocket connection closed: ${reason}`, 'WARN', 'info');
      pushLogItem('Falling back to HTTP /analyse endpoint...', 'INFO', 'llm');
      setStatusMessage('Analyzing emails via HTTP fallback...');

      try {
        const res = await runEmailAnalysisAction(currentEmails, currentModel);
        if (unmounted) return;
        if (res.ok && res.results) {
          completed = true;
          pushLogItem(`HTTP Analysis succeeded for ${res.results.length} email(s)`, 'INFO', 'complete');
          finishAnalysis(res.results);
        } else {
          pushLogItem(`Analysis failed: ${res.error || 'Unknown error'}`, 'ERROR', 'error');
          setStatusMessage(res.error || 'Failed to analyze emails');
          setHasError(true);
          callbacksRef.current.onStreamStateChange?.(false, false);
        }
      } catch (err: unknown) {
        if (unmounted) return;
        const msg = err instanceof Error ? err.message : 'HTTP fallback error';
        pushLogItem(`Fallback error: ${msg}`, 'ERROR', 'error');
        setStatusMessage(msg);
        setHasError(true);
        callbacksRef.current.onStreamStateChange?.(false, false);
      }
    };

    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        if (unmounted) return;
        pushLogItem('Connected to Anthos AI WebSocket stream', 'INFO', 'info');
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
            default: true,
            settingId: currentModel.settingId || null,
            setting_id: currentModel.settingId || null,
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
            pushLogItem(`[CONFIRMED] ${data.message}`, 'INFO', 'clean');
          } else if (data.type === 'log') {
            if (data.message && !data.message.includes('AFC is enabled') && !data.message.includes('Direct use of automatic function calling')) {
              pushLogItem(data.message, data.level || 'INFO');
              setStatusMessage(data.message.replace(/\|\s*$/, '').trim());
            }
          } else if (data.type === 'complete') {
            if (data.results && Array.isArray(data.results)) {
              completed = true;
              pushLogItem(`All emails processed successfully (${data.results.length} result(s))`, 'INFO', 'complete');
              finishAnalysis(data.results);
            }
          } else if (data.type === 'error') {
            pushLogItem(`[ERROR] ${data.message || 'Server error'}: ${data.detail || ''}`, 'ERROR', 'error');
            setStatusMessage(data.message || 'Analysis error');
            setHasError(true);
            callbacksRef.current.onStreamStateChange?.(false, false);
          }
        } catch {
          pushLogItem(String(event.data), 'INFO', 'info');
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
      const msg = err instanceof Error ? err.message : 'Failed to instantiate WebSocket';
      triggerHttpFallback(msg);
    }

    return () => {
      unmounted = true;
      if (socket) {
        try {
          socket.close(1000, 'Unmounted');
        } catch {}
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
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs"
            onClick={() => onOpenChange(false)}
          />

          <motion.aside
            key="analysis-drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-xs bg-white shadow-2xl flex flex-col h-full overflow-hidden text-black select-text"
          >
            <div className="py-3 px-5 border-b border-black/10 flex items-center justify-between gap-3 shrink-0">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs text-black/60 truncate font-mono">
                  {statusMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="p-1 rounded-lg text-black/50 hover:text-black hover:bg-black/5 transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <div className="space-y-2">
                <div
                  ref={terminalContainerRef}
                  onScroll={handleScroll}
                  className="font-mono text-[11px] h-full overflow-y-auto space-y-1.5 scrollbar-thin"
                >
                  {logs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-zinc-500 text-xs gap-2">
                      {active ? (
                        <>
                          <RotateCw className="size-3.5 animate-spin" />
                          <span>Connecting to WebSocket stream at /analyse...</span>
                        </>
                      ) : (
                        <span>No analysis logs available.</span>
                      )}
                    </div>
                  ) : (
                    logs.map((log) => {
                      let tagBg = 'bg-black font-semibold';
                      if (log.tag === 'CLEAN') tagBg = 'bg-cyan-500 font-semibold';
                      else if (log.tag === 'REGEX') tagBg = 'bg-teal-500 font-semibold';
                      else if (log.tag === 'REVIEW') tagBg = 'bg-amber-500 font-semibold';
                      else if (log.tag === 'LLM') tagBg = 'bg-purple-600 font-semibold';
                      else if (log.tag === 'APPROVED') tagBg = 'bg-emerald-600 font-semibold';
                      else if (log.tag === 'RETRY') tagBg = 'bg-orange-500 font-semibold';
                      else if (log.tag === 'DONE') tagBg = 'bg-green-600 font-semibold';
                      else if (log.tag === 'ERROR') tagBg = 'bg-red-600 font-semibold';
                      else if (log.tag === 'INFO') tagBg = 'bg-blue-600 font-semibold';

                      return (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-2 leading-relaxed"
                        >
                          <span className="text-black/50 text-[10px] shrink-0 select-none">{log.time}</span>
                          <span className={cn('px-1.5 py-0.2 text-[9px] rounded text-white font-bold shrink-0', tagBg)}>
                            {log.tag}
                          </span>
                          <span className={cn('break-all truncate text-[10.5px]', log.stage === 'error' ? 'text-red-600 font-semibold' : log.stage === 'complete' ? 'text-green-600 font-semibold' : 'text-black/50')}>
                            {log.message}
                          </span>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
