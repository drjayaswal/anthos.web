'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Wand2Icon } from 'lucide-react';

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
      <DialogContent className="rounded-xl border border-gray-200/75 bg-white sm:max-w-xs max-w-xs">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl tracking-tight text-black">Analyze selected</DialogTitle>
            <DialogDescription className="text-[10px] text-black/60">
              {selectedCount > 2 ? (
                <span className="text-red-500 font-semibold">Maximum 2 mails can be analyzed at a time</span>
              ) : (
                `${selectedCount} mail${selectedCount === 1 ? '' : 's'} selected (max 2)`
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex items-center space-x-2">
              <Checkbox id="store" checked={store} onCheckedChange={(c) => setStore(c === true)} />
              <div className="flex items-center gap-1.5">
                <Label htmlFor="store" className="cursor-pointer text-sm font-medium text-black">
                  Store Context
                </Label>
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 cursor-help text-blue-600" strokeWidth={3} />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-62.5 border-border bg-blue-600 text-[10px]">
                      <p>Persist results encrypted in the Database</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-2 border-t-gray-200/75 bg-white">
            <Button type="button" variant="no_outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={selectedCount === 0 || selectedCount > 2}>
              <Wand2Icon />
              Analyze
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
