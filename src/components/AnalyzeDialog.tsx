'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Sparkles, X, Bot, Check, ChevronDown } from 'lucide-react';
import { getAnalysisModelsAction } from '@/app/actions';
import type { AnalysisModel } from '@/types';

const FALLBACK_DEFAULT_MODEL: AnalysisModel = {
  id: 'hardcoded-llama-70b',
  name: 'Llama 70B',
  displayName: 'Llama 70B (Default)',
  model: 'llama-3.3-70b-versatile',
  logo: '/ai-default.png',
};

interface AnalyzeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onAnalyze: (store: boolean, selectedModel?: AnalysisModel | null) => void;
  models?: AnalysisModel[];
}

export default function AnalyzeDialog({
  open,
  onOpenChange,
  selectedCount,
  onAnalyze,
  models: propModels,
}: AnalyzeDialogProps) {
  const [store, setStore] = useState(false);
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
          const customModels = res.models.filter((m) => m.id !== 'hardcoded-llama-70b');
          if (selectedCount > 2 && customModels.length > 0) {
            setSelectedModelId((prev) =>
              prev === 'hardcoded-llama-70b' || !res.models!.some((m) => m.id === prev)
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
    if (model.id === 'hardcoded-llama-70b' && selectedCount > 2) {
      return;
    }
    setSelectedModelId(model.id);
    setDropdownOpen(false);

    const modalFields = {
      selectedModel: model,
      selectedModelId: model.id,
      modelName: model.model,
      name: model.name,
      displayName: model.displayName,
      logo: model.logo ?? null,
      store,
      selectedCount,
    };
    console.log('Analyze Dialog fields (Model Selected):', modalFields);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const modalFields = {
      selectedModel,
      selectedModelId: selectedModel?.id,
      modelName: selectedModel?.model,
      name: selectedModel?.name,
      displayName: selectedModel?.displayName,
      logo: selectedModel?.logo ?? null,
      store,
      selectedCount,
    };
    console.log('Analyze Dialog fields (Submit):', modalFields);
    onAnalyze(store, selectedModel);
    onOpenChange(false);
  };

  const isHardcodedModel = selectedModel?.id === 'hardcoded-llama-70b';
  const isSubmitDisabled = selectedCount === 0 || (isHardcodedModel && selectedCount > 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full sm:w-96 rounded-t-4xl sm:rounded-2xl bg-white border sm:border-b border-b-0 text-black shadow-2xl p-0 gap-0 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b">
          <div>
            <DialogTitle className="text-xs font-semibold text-black">
              Analyze Selected
            </DialogTitle>
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
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-black/5 border round hover:border-black/20 transition cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-black/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {selectedModel.logo ? (
                        <Image
                          src={selectedModel.logo}
                          alt={selectedModel.name}
                          width={24}
                          height={24}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-black/70" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-black truncate">
                        {selectedModel.name}
                      </p>
                      <p className="text-[9px] font-mono text-black/50 truncate">
                        {selectedModel.model}
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
                        className="rounded-xl bg-gray-50 border shadow-xl p-1.5 max-h-48 overflow-y-auto overscroll-contain touch-pan-y space-y-1"
                      >
                        {availableModels.map((model) => {
                          const isSelected = model.id === selectedModelId;
                          const isHardcoded = model.id === 'hardcoded-llama-70b';
                          const isModelDisabled = isHardcoded && selectedCount > 2;
                          return (
                            <motion.button
                              key={model.id}
                              type="button"
                              disabled={isModelDisabled}
                              whileHover={isModelDisabled ? {} : { scale: 1.01 }}
                              whileTap={isModelDisabled ? {} : { scale: 0.98 }}
                              onClick={() => {
                                if (!isModelDisabled) {
                                  handleSelectModel(model);
                                }
                              }}
                              data-prevent-drawer-drag
                              className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-left ${isModelDisabled
                                ? 'opacity-40 cursor-not-allowed bg-black/5'
                                : isSelected
                                  ? 'bg-black/10 font-semibold cursor-pointer'
                                  : 'hover:bg-black/5 cursor-pointer'
                                }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-5 h-5 rounded-md bg-black/10 flex items-center justify-center shrink-0 overflow-hidden">
                                  {model.logo ? (
                                    <Image
                                      src={model.logo}
                                      alt={model.name}
                                      width={20}
                                      height={20}
                                      unoptimized
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Bot className="w-3 h-3 text-black/70" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-black block truncate">
                                      {model.name}
                                    </span>
                                    {isModelDisabled && (
                                      <span className="text-[8px] px-1 py-0.2 rounded bg-red-600/20 text-red-600 font-medium shrink-0">
                                        Max 2
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[8px] font-mono text-black/40 block truncate">
                                    {model.model}
                                  </span>
                                </div>
                              </div>
                              {isSelected && !isModelDisabled && (
                                <Check className="w-3.5 h-3.5 text-green-600 shrink-0 ml-1" />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="flex items-center space-x-2.5 rounded-xl bg-black/5 p-3 border">
              <Checkbox
                id="store"
                checked={store}
                onCheckedChange={(c) => {
                  const newStore = c === true;
                  setStore(newStore);
                  console.log('Analyze Dialog fields (Store Toggled):', {
                    selectedModel,
                    selectedModelId,
                    store: newStore,
                    selectedCount,
                  });
                }}
              />
              <div className="flex items-center gap-1.5 flex-1">
                <Label htmlFor="store" className="cursor-pointer text-xs font-medium text-black select-none">
                  Store Encrypted in Database
                </Label>
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 cursor-help text-blue-600 shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-62.5 border-border bg-blue-600 text-white text-[10px]">
                      <p>Persist results encrypted in the Database</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t">
            <button
              type="submit"
              disabled={isSubmitDisabled || loadingModels}
              className="inline-flex items-center gap-1.5 rounded-lg cursor-pointer bg-black px-3 py-1.5 text-xs font-medium text-white transition hover:bg-black/90 active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5 fill-white" />
              <span>Analyze</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
