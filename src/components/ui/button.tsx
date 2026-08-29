import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button cursor-pointer inline-flex shrink-0 items-center justify-center rounded-md! border-0! bg-clip-padding text-sm whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)] active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        custom_button:
          "bg-white text-black border border-dashed hover:border-transparent rounded-xl duration-150! shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)] active:translate-y-0.5",
        custom:
          "bg-white text-black border border-dashed hover:border-transparent rounded-xl duration-200 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)] hover:-translate-y-px active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]",
        light: "border border-gray-200/75 bg-white hover:-translate-y-px active:translate-y-0.5 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)] text-black rounded-xl",
        classic: "bg-white hover:opacity-85 text-black hover:-translate-y-px active:translate-y-0.5 rounded-xl ring-0 outline-0 border-0 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)]",
        classic_accent: "bg-white hover:bg-accent hover:text-black text-black hover:-translate-y-px active:translate-y-0.5 rounded-xl ring-0 outline-0 border-0 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)]",
        accent: "bg-accent text-white hover:opacity-90 hover:-translate-y-px active:translate-y-0.5 rounded-xl ring-0 outline-0 border-0 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.1)]",
        ghost: "bg-transparent border text-black hover:-translate-y-px active:translate-y-0.5 rounded-xl shadow-[inset_0_-2px_4px_rgba(0,0,0,0.15)]",
        no_outline: "bg-transparent text-foreground active:translate-y-0.5 rounded-xl ring-0 outline-0 border-0 shadow-none",
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.1)] hover:-translate-y-px active:translate-y-0.5",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground shadow-[inset_0_-3px_6px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.05)] hover:-translate-y-px active:translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground shadow-[inset_0_-3px_6px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.05)] hover:-translate-y-px active:translate-y-0.5",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.15)] hover:-translate-y-px active:translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline shadow-none",
      },
      color: {
        purple: "bg-linear-to-b from-white to-gray-100 hover:from-purple-600 hover:to-purple-800 hover:text-white",
        red: "bg-linear-to-b from-white to-gray-100 hover:from-red-600 hover:to-red-800 hover:text-white",
        yellow: "bg-linear-to-b from-white to-gray-100 hover:from-yellow-600 hover:to-yellow-800 hover:text-white",
        amber: "bg-linear-to-b from-white to-gray-100 hover:from-amber-600 hover:to-amber-800 hover:text-white",
        blue: "bg-linear-to-b from-white to-gray-100 hover:from-blue-600 hover:to-blue-800 hover:text-white",
        teal: "bg-linear-to-b from-white to-gray-100 hover:from-teal-600 hover:to-teal-800 hover:text-white",
        green: "bg-linear-to-b from-white to-gray-100 hover:from-green-600 hover:to-green-800 hover:text-white",
        black: "bg-linear-to-b from-white to-gray-100 active:to-white active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]",
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
      color: "black",
    },
  }
)

export type ButtonColor =
  | "purple"
  | "red"
  | "yellow"
  | "amber"
  | "blue"
  | "teal"
  | "green"
  | "black";

function Button({
  className,
  variant = "default",
  size = "default",
  color = "black",
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
  color = "black",
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
