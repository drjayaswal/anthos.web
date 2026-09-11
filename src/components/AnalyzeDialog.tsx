'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Bot, ChevronDown, Check } from 'lucide-react';
import { getAnalysisModelsAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import type { AnalysisModel } from '@/types';
import QueryDrawer from './QueryDrawer';
import { getProviderByName } from '@/lib/providers';

const FALLBACK_DEFAULT_MODEL: AnalysisModel = {
  id: '6b73ef82-7a41-451e-ac2b-a0107475cb38',
  provider: 'Google',
  name: 'gemma-4-26b-a4b-it',
  default: true,
  settingId: '42821d65-9f24-4b44-b88b-6d3b1c85a12f',
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
  const [confirmed, setConfirmed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setConfirmed(false);
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
    if (!model.default) {
      return;
    }
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
      default: true,
      settingId: selectedModel.settingId || '42821d65-9f24-4b44-b88b-6d3b1c85a12f',
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
              className="data-checked:bg-blue-600 data-checked:border-blue-600"
              onCheckedChange={(c) => setConfirmed(c === true)}
            />
            <Label
              htmlFor="confirm-analyze"
              className="cursor-pointer text-xs font-medium text-black select-none"
            >
              Confirm
            </Label>
          </div>

          <button
            type="submit"
            form="analyze-form"
            disabled={!confirmed || isSubmitDisabled || loadingModels}
            className={cn(
              'flex disabled:cursor-not-allowed items-center justify-center gap-2 px-3.5 py-2 cursor-pointer rounded-lg text-xs font-medium transition-all duration-200 border select-none outline-none',
              (!confirmed || isSubmitDisabled || loadingModels) && 'text-black/30'
            )}
          >
            <span>
              Analyze {selectedCount > 1 ? "Mails" : "Mail"}
            </span>
            <Check
              className={cn(
                'w-3.5 h-3.5 transition-colors',
                confirmed ? 'text-blue-600' : 'text-black/30'
              )}
            />
          </button>
        </div>
      }
    >
      <form id="analyze-form" onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5" ref={dropdownRef}>
          <div className="sm:hidden flex items-center justify-between">
            <Label className="text-[11px] font-semibold text-black/90 flex items-center gap-1.5">
              <span>Select AI Model</span>
            </Label>
            {loadingModels && (
              <span className="text-[9px] text-black/40 animate-pulse">
                Loading models...
              </span>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between p-2.5 ${dropdownOpen && 'rounded-b-none border-b-0'} rounded-2xl bg-white border transition cursor-pointer text-left`}
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
                    <Bot className="w-4 h-4 text-black/70" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-black truncate">
                    {selectedModel.provider}
                  </p>
                  <p className="text-[9px] text-black/50 truncate font-normal">
                    {getProviderByName(selectedModel.provider)?.description || selectedModel.name}
                  </p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-black/50 transition-transform duration-200 shrink-0 ml-1 ${dropdownOpen ? 'rotate-180' : ''}`} />
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
                    className="rounded-b-2xl border border-t-0 p-2 scrollbar-none max-h-48 overflow-y-auto overscroll-contain space-y-1.5"
                  >
                    {availableModels.map((model) => {
                      const isSelected = model.id === selectedModelId;
                      const isDefault = model.default === true;
                      const isModelDisabled = !isDefault;
                      const providerLogo = getProviderByName(model.provider)?.logo;
                      return (
                        <motion.button
                          key={model.id}
                          type="button"
                          disabled={isModelDisabled}
                          whileTap={isModelDisabled ? {} : { scale: 0.98 }}
                          onClick={() => {
                            if (!isModelDisabled) {
                              handleSelectModel(model);
                            }
                          }}
                          className={`w-full flex px-3 py-2 items-center gap-2.5 transition-all duration-200 text-left text-black ${
                            isModelDisabled
                              ? 'opacity-40 cursor-not-allowed rounded-xl'
                              : isSelected
                                ? 'border border-dashed border-black/30 bg-white rounded-xl cursor-pointer'
                                : 'hover:bg-black/5 rounded-xl cursor-pointer'
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
                              <Bot className="w-3.5 h-3.5 text-black/70" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-black block truncate">
                                {model.provider}
                              </span>
                              {isDefault ? (
                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-600/15 text-emerald-700 font-medium shrink-0">
                                  Default
                                </span>
                              ) : (
                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-black/10 text-black/50 font-medium shrink-0">
                                  Paused
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-black/50 block truncate font-normal">
                              {getProviderByName(model.provider)?.description || model.name}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="size-3.5 text-blue-600 shrink-0" strokeWidth={2.5} />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <p className="text-[10px] text-black/45 px-1 pt-1">
              Custom Model feature is in beta,
              Default Models are Gemma 4 26B & Gemini 3.5 Flash Lite
            </p>
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
