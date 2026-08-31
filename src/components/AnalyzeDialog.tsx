'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Sparkles, X, Bot, ChevronDown } from 'lucide-react';
import { getAnalysisModelsAction } from '@/app/actions';
import { CustomButton } from '@/components/ui/button';
import type { AnalysisModel } from '@/types';

import { getProviderByName } from '@/lib/providers';

const FALLBACK_DEFAULT_MODEL: AnalysisModel = {
  id: 'hardcoded-gpt-oss-120b',
  provider: 'Open AI',
  name: 'gpt-oss-120b',
  default: true,
  settingId: 'system-default',
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
    propModels && propModels.length > 0 ? propModels[0].id : FALLBACK_DEFAULT_MODEL.id
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
          const customModels = res.models.filter((m) => !m.id.startsWith('hardcoded-') && !m.default);
          if (selectedCount > 2 && customModels.length > 0) {
            setSelectedModelId((prev) =>
              prev.startsWith('hardcoded-') || !res.models!.some((m) => m.id === prev)
                ? customModels[0].id
                : prev
            );
          } else {
            setSelectedModelId((prev) =>
              !res.models!.some((m) => m.id === prev) ? res.models![0].id : prev
            );
          }
        }
      } catch {
      } finally {
        if (isMounted) setLoadingModels(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [open, propModels, selectedCount]);

  const selectedModel = availableModels.find((m) => m.id === selectedModelId) || availableModels[0] || FALLBACK_DEFAULT_MODEL;

  const handleSelectModel = (model: AnalysisModel) => {
    const isHardcoded = model.id.startsWith('hardcoded-') || model.default === true;
    if (isHardcoded && selectedCount > 2) {
      return;
    }
    setSelectedModelId(model.id);
    setDropdownOpen(false);

    const modelObject: AnalysisModel = {
      id: model.id,
      provider: model.provider,
      name: model.name,
      default: isHardcoded,
      settingId: model.settingId || (isHardcoded ? 'system-default' : ''),
    };
    console.log('Analyze Dialog fields (Model Selected):', {
      model: modelObject,
      selectedCount,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isDefault = selectedModel.id.startsWith('hardcoded-') || selectedModel.default === true;
    const modelObject: AnalysisModel = {
      id: selectedModel.id,
      provider: selectedModel.provider,
      name: selectedModel.name,
      default: isDefault,
      settingId: selectedModel.settingId || (isDefault ? 'system-default' : ''),
    };
    console.log('Analyze Dialog fields (Submit):', {
      model: modelObject,
      selectedCount,
    });
    onAnalyze(modelObject);
    onOpenChange(false);
  };

  const isHardcodedModel = selectedModel?.id.startsWith('hardcoded-') || selectedModel?.default === true;
  const isSubmitDisabled = selectedCount === 0 || (isHardcodedModel && selectedCount > 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full sm:w-80 rounded-t-4xl sm:rounded-2xl bg-white border sm:border-b border-b-0 text-black shadow-2xl p-0 gap-0 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b">
          <div>
            <DialogTitle className="text-sm font-semibold text-black">
              Analyze Mails
            </DialogTitle>
            <DialogDescription className="text-xs text-black/50">
              Select an AI model to analyze your emails
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            title="Close dialog"
            className="rounded cursor-pointer p-1 text-black/50 hover:text-red-600!"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-4 py-4 space-y-3">
            <div className="space-y-1.5" ref={dropdownRef}>
              <div className="flex items-center justify-between">
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
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white border shadow-[inset_0_-2px_4px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.05)] transition cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 flex rounded-xl items-center justify-center shrink-0 overflow-hidden">
                      {getProviderByName(selectedModel.provider)?.logo ? (
                        <Image
                          src={getProviderByName(selectedModel.provider)!.logo}
                          alt={selectedModel.provider}
                          width={24}
                          height={24}
                          unoptimized
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-black/70" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-black truncate">
                        {selectedModel.provider}
                      </p>
                      <p className="text-[9px] font-mono text-black/50 truncate">
                        {selectedModel.name}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-black/50 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -4 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -4 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      data-prevent-drawer-drag
                      className="overflow-hidden mt-1.5"
                    >
                      <div
                        data-prevent-drawer-drag
                        className="rounded-2xl border p-2 scrollbar-none bg-black/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] max-h-48 overflow-y-auto overscroll-contain touch-pan-y space-y-1.5"
                      >
                        {availableModels.map((model) => {
                          const isSelected = model.id === selectedModelId;
                          const isHardcoded = model.id.startsWith('hardcoded-') || model.default === true;
                          const isModelDisabled = isHardcoded && selectedCount > 2;
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
                              data-prevent-drawer-drag
                              className={`w-full flex items-center justify-between px-3 py-2 transition-all duration-200 text-left text-black ${isModelDisabled
                                ? 'opacity-40 cursor-not-allowed rounded-xl'
                                : isSelected
                                  ? 'rounded-xl bg-white shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)] cursor-pointer'
                                  : 'hover:bg-black/5 rounded-xl cursor-pointer'
                                }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 overflow-hidden">
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
                                    <Bot className="w-3 h-3 text-black/70" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-black block truncate">
                                      {model.provider}
                                    </span>
                                    {isModelDisabled && (
                                      <span className="text-[8px] px-1 py-0.2 rounded bg-red-600/20 text-red-600 font-medium shrink-0">
                                        Max 2
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[9px] font-mono text-black/50 block truncate">
                                    {model.name}
                                  </span>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t">
            <CustomButton
              type="submit"
              disabled={isSubmitDisabled || loadingModels}
              size="sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Analyze</span>
            </CustomButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
