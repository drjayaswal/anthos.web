import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button cursor-pointer inline-flex shrink-0 items-center justify-center rounded-md! border border-transparent bg-clip-padding text-sm whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.15)] active:not-aria-[haspopup]:translate-y-px active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        custom_button:
          "bg-white text-black border border-dashed border-black/20 hover:border-transparent rounded-xl duration-200 active:scale-95 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.15)]",
        custom:
          "bg-white text-black border border-dashed border-black/20 hover:border-transparent rounded-xl duration-200 active:scale-95 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.15)]",
        light: "border border-gray-200/75 bg-white hover:-translate-y-px active:translate-y-px hover:shadow-sm text-black rounded-xl",
        classic: "bg-white hover:opacity-85 text-black active:scale-98 active:translate-y-0.5 rounded-xl ring-0 outline-0 border-0",
        classic_accent: "bg-white hover:bg-accent hover:text-black text-black active:scale-98 active:translate-y-0.5 rounded-xl ring-0 outline-0 border-0",
        accent: "bg-accent text-white hover:opacity-90 active:scale-98 active:translate-y-0.5 rounded-xl ring-0 outline-0 border-0",
        ghost: "bg-transparent border border-black/15 text-black active:scale-98 active:translate-y-0.5 rounded-xl",
        no_outline: "bg-transparent text-foreground active:scale-98 active:translate-y-0.5 rounded-xl ring-0 outline-0 border-0 shadow-none",
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-primary underline-offset-4 hover:underline shadow-none",
      },
      color: {
        purple: "hover:bg-purple-600 hover:text-white",
        red: "hover:bg-red-600 hover:text-white",
        yellow: "hover:bg-yellow-600 hover:text-white",
        blue: "hover:bg-blue-600 hover:text-white",
        teal: "hover:bg-teal-600 hover:text-white",
        green: "hover:bg-green-600 hover:text-white",
        black: "hover:bg-black hover:text-white",
      },
      size: {
        default:
          "h-8 gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1.5 rounded-xl px-2.5 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xl: "h-11 gap-2 px-3 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      color: "purple",
    },
  }
)

export type ButtonColor =
  | "purple"
  | "red"
  | "yellow"
  | "blue"
  | "green"
  | "black";

function Button({
  className,
  variant = "default",
  size = "default",
  color = "purple",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-color={color}
      className={cn(buttonVariants({ variant, size, color, className }))}
      {...props}
    />
  )
}

function CustomButton({
  className,
  variant = "custom_button",
  size = "default",
  color = "purple",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant={variant}
      size={size}
      color={color}
      className={className}
      {...props}
    />
  )
}

export { Button, CustomButton, buttonVariants }
