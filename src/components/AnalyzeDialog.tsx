'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { CustomButton } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Sparkles, X } from 'lucide-react';

interface AnalyzeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onAnalyze: (store: boolean) => void;
}

export default function AnalyzeDialog({ open, onOpenChange, selectedCount, onAnalyze }: AnalyzeDialogProps) {
  const [store, setStore] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(store);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full sm:w-80 rounded-t-4xl sm:rounded-2xl bg-[#2c0237] border border-white/10 [html.light_&]:bg-white [html.light_&]:border-black/10 text-white shadow-2xl p-0 gap-0 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/10 [html.light_&]:border-black/10">
          <div>
            <DialogTitle className="text-xs font-semibold text-white [html.light_&]:text-black">
              Analyze Selected
            </DialogTitle>
            <DialogDescription className="text-[10px] text-white/50 [html.light_&]:text-black/50">
              {selectedCount > 2 ? (
                <span className="text-red-400 font-semibold">Maximum 2 mails can be analyzed at a time</span>
              ) : (
                `${selectedCount} mail${selectedCount === 1 ? '' : 's'} selected (max 2)`
              )}
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            title="Close dialog"
            className="rounded cursor-pointer p-1 text-white/50 hover:text-white [html.light_&]:text-black/50 [html.light_&]:hover:text-black transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-4 py-4">
            <div className="flex items-center space-x-2.5 rounded-xl bg-white/5 [html.light_&]:bg-black/5 p-3 border border-white/5 [html.light_&]:border-black/5">
              <Checkbox
                id="store"
                checked={store}
                onCheckedChange={(c) => setStore(c === true)}
                className="[html.light_&]:data-checked:border-green-600"
              />
              <div className="flex items-center gap-1.5 flex-1">
                <Label htmlFor="store" className="cursor-pointer text-xs font-medium text-white [html.light_&]:text-black select-none">
                  Store Encrypted in Database
                </Label>
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 cursor-help text-blue-400 [html.light_&]:text-blue-600 shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-62.5 border-border bg-blue-600 text-white text-[10px]">
                      <p>Persist results encrypted in the Database</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10 [html.light_&]:border-black/10">
            <CustomButton
              type="submit"
              disabled={selectedCount === 0 || selectedCount > 2}
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
