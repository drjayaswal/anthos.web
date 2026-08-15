"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement>(null);
  const startYRef = React.useRef<number | null>(null);
  const currentYRef = React.useRef<number>(0);
  const startTimeRef = React.useRef<number>(0);
  const isDraggingRef = React.useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 640) return;
    const touch = e.touches[0];
    const target = e.target as HTMLElement;
    if (target.closest('input, select, textarea, [data-prevent-drawer-drag], [aria-label*="Slide"], [aria-label*="slide"]')) {
      return;
    }
    startYRef.current = touch.clientY;
    currentYRef.current = touch.clientY;
    startTimeRef.current = Date.now();
    isDraggingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startYRef.current === null) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - startYRef.current;
    
    if (deltaY > 0) {
      isDraggingRef.current = true;
      currentYRef.current = touch.clientY;
      if (contentRef.current) {
        contentRef.current.style.transition = 'none';
        contentRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (startYRef.current === null) return;
    const deltaY = currentYRef.current - startYRef.current;
    const time = Date.now() - startTimeRef.current;
    const velocity = deltaY / (time || 1);

    if (contentRef.current) {
      contentRef.current.style.transition = 'transform 0.22s cubic-bezier(0.32, 0.72, 0, 1)';
      if (isDraggingRef.current && (deltaY > 75 || (deltaY > 30 && velocity > 0.4))) {
        contentRef.current.style.transform = 'translateY(100%)';
        setTimeout(() => {
          closeBtnRef.current?.click();
          if (contentRef.current) {
            contentRef.current.style.transform = '';
            contentRef.current.style.transition = '';
          }
        }, 180);
      } else {
        contentRef.current.style.transform = '';
      }
    }

    startYRef.current = null;
    isDraggingRef.current = false;
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={contentRef}
        data-slot="dialog-content"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "fixed bottom-0 sm:bottom-auto sm:top-1/2 left-0 sm:left-1/2 right-0 sm:right-auto z-50 grid w-full sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2 gap-4 rounded-t-4xl sm:rounded-2xl bg-white p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 outline-none duration-150 data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-8 sm:data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom-8 sm:data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        <div className="sm:hidden flex shrink-0 justify-center -mt-1 pb-1 cursor-grab active:cursor-grabbing select-none touch-none">
          <div className="h-1.5 w-12 rounded-full bg-white/25 [html.light_&]:bg-black/25" />
        </div>
        {children}
        <DialogPrimitive.Close ref={closeBtnRef} data-slot="dialog-close" asChild>
          {showCloseButton ? (
            <Button
              className="[html.light_&]:bg-white dark:bg-transparent dark:text-white absolute hover:text-red-600 sm:text-black text-red-600 top-2 right-2"
              size="icon-sm"
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </Button>
          ) : (
            <button type="button" className="hidden" aria-hidden="true" tabIndex={-1}>
              Close
            </button>
          )}
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none ",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
