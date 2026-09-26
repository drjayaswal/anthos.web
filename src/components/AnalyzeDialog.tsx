'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Bot, ChevronDown, Check, Loader2 } from 'lucide-react';
import { getAnalysisModelsAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import type { AnalysisModel } from '@/types';
import QueryDrawer from './QueryDrawer';
import { getProviderByName } from '@/lib/providers';

const FALLBACK_DEFAULT_MODEL: AnalysisModel = {
  id: '6b73ef82-7a41-451e-ac2b-a0107475cb38',
  provider: 'Google',
  name: 'gemini-3.5-flash-lite',
  default: true,
};

interface AnalyzeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onAnalyze: (selectedModel?: AnalysisModel | null) => void;
  models?: AnalysisModel[];
}

export default function AnalyzeDialog({
  open,
  onOpenChange,
  selectedCount,
  onAnalyze,
  models: propModels,
}: AnalyzeDialogProps) {
  const [fetchedModels, setFetchedModels] = useState<AnalysisModel[]>([]);
  const availableModels = propModels && propModels.length > 0
    ? propModels
    : (fetchedModels.length > 0 ? fetchedModels : [FALLBACK_DEFAULT_MODEL]);

  const [selectedModelId, setSelectedModelId] = useState<string>(
    propModels && propModels.length > 0
      ? (propModels.find((m) => m.default)?.id || propModels[0].id)
      : FALLBACK_DEFAULT_MODEL.id
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [confirmed, setConfirmed] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setConfirmed(true);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    if (!open || (propModels && propModels.length > 0)) return;

    let isMounted = true;
    (async () => {
      try {
        setLoadingModels(true);
        const res = await getAnalysisModelsAction();
        if (isMounted && res.ok && res.models && res.models.length > 0) {
          setFetchedModels(res.models);
          const defaultMod = res.models.find((m) => m.default) || res.models[0];
          setSelectedModelId(defaultMod.id);
        }
      } catch {
      } finally {
        if (isMounted) setLoadingModels(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [open, propModels]);

  const selectedModel = availableModels.find((m) => m.id === selectedModelId) || availableModels.find((m) => m.default) || availableModels[0] || FALLBACK_DEFAULT_MODEL;

  const handleSelectModel = (model: AnalysisModel) => {
    setSelectedModelId(model.id);
    setDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed || isSubmitDisabled || loadingModels) return;
    const modelObject: AnalysisModel = {
      id: selectedModel.id,
      provider: selectedModel.provider,
      name: selectedModel.name,
      default: selectedModel.default === true,
    };
    onAnalyze(modelObject);
    onOpenChange(false);
  };

  const isSubmitDisabled = selectedCount === 0 || selectedCount > 10;

  return (
    <QueryDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Analyze Mails"
      description="Select an AI model to analyze up to 10 emails"
      footerAction={
        <div className="w-full flex items-center justify-between gap-3 select-none">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm-analyze"
              checked={confirmed}
              className="border-foreground/40 data-checked:bg-background data-checked:border-background"
              onCheckedChange={(c) => setConfirmed(c === true)}
            />
            <Label
              htmlFor="confirm-analyze"
              className="cursor-pointer text-xs font-medium text-foreground select-none"
            >
              Confirm
            </Label>
          </div>

          <button
            type="submit"
            form="analyze-form"
            disabled={!confirmed || isSubmitDisabled || loadingModels}
            className={cn(
              'flex disabled:cursor-not-allowed items-center justify-center gap-2 px-3.5 py-2 cursor-pointer rounded-lg text-xs font-medium transition-all duration-200 border border-dashed select-none outline-none text-foreground border-foreground/40',
              (!confirmed || isSubmitDisabled || loadingModels) && 'opacity-30'
            )}
          >
            <span>
              Analyze {selectedCount > 1 ? "Mails" : "Mail"}
            </span>
            {loadingModels ? (
              <Loader2 className="w-3.5 h-3.5 text-foreground animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5 text-foreground transition-colors" />
            )}
          </button>
        </div>
      }
    >
      <form id="analyze-form" onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5" ref={dropdownRef}>
          <label className="sm:hidden block text-[10px] font-medium text-foreground/60 uppercase tracking-wide">
            AI Model
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between p-2.5 ${dropdownOpen && 'rounded-b-none'} transition cursor-pointer text-left`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 flex rounded-4xl items-center justify-center shrink-0 overflow-hidden">
                  {getProviderByName(selectedModel.provider)?.logo ? (
                    <Image
                      src={getProviderByName(selectedModel.provider)!.logo}
                      alt={selectedModel.provider}
                      width={20}
                      height={20}
                      unoptimized
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Bot className="w-4 h-4 text-foreground/70" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {selectedModel.provider}
                    </p>
                    {selectedModel.default ? (
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium shrink-0">
                        Default
                      </span>
                    ) : (
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium shrink-0">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-foreground/50 truncate font-normal">
                    {selectedModel.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                {loadingModels && (
                  <Loader2 className="w-3.5 h-3.5 text-foreground animate-spin" />
                )}
                <ChevronDown className={`w-4 h-4 text-foreground/50 transition-transform duration-200 shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div
                    className="rounded-2xl bg-foreground/10 p-2 scrollbar-none max-h-48 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] overflow-y-auto overscroll-contain space-y-1.5"
                  >

                    {availableModels.map((model) => {
                      const isSelected = model.id === selectedModelId;
                      const isDefault = model.default === true;
                      const providerLogo = getProviderByName(model.provider)?.logo;
                      return (
                        <motion.button
                          key={model.id}
                          type="button"
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            handleSelectModel(model);
                          }}
                          className={`w-full flex px-3 py-2 items-center gap-2.5 transition-all duration-200 text-left text-foreground ${isSelected
                              ? 'bg-foreground/15 rounded-xl cursor-pointer'
                              : 'hover:bg-foreground/10 rounded-xl cursor-pointer'
                            }`}
                        >
                          <div className="w-7 h-7 flex rounded-4xl items-center justify-center shrink-0 overflow-hidden">
                            {providerLogo ? (
                              <Image
                                src={providerLogo}
                                alt={model.provider}
                                width={20}
                                height={20}
                                unoptimized
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Bot className="w-3.5 h-3.5 text-foreground/70" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-foreground block truncate">
                                {model.provider}
                              </span>
                              {isDefault ? (
                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium shrink-0">
                                  Default
                                </span>
                              ) : (
                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium shrink-0">
                                  Custom
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-foreground/50 block truncate font-normal">
                              {model.name}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="size-3.5 text-foreground shrink-0" strokeWidth={2.5} />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {selectedCount > 10 && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs">
              Maximum 10 mails allowed for analysis (currently selected: {selectedCount}).
            </div>
          )}
        </div>
      </form>
    </QueryDrawer>
  );
}
