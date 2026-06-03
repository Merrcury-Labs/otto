import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-button-label transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Primary (Warm Surface) - Cursor Style */
        default:
          "bg-[var(--surface-300)] text-[var(--foreground)] rounded-[8px] py-[10px] px-[12px_10px_10px_14px] hover:text-[var(--color-error)] focus-visible:shadow-[var(--shadow-focus)] outline-none transition-all duration-150",
        /* Destructive - Warm Error */
        destructive:
          "bg-[var(--color-error)] text-white rounded-[8px] py-[10px] px-[12px_10px_10px_14px] hover:bg-[var(--color-error)]/90 focus-visible:shadow-[var(--shadow-focus)] outline-none transition-all duration-150",
        /* Outline - Bordered Style */
        outline:
          "border border-[var(--border-primary)] bg-transparent text-[var(--foreground)] rounded-[8px] py-[10px] px-[12px_10px_10px_14px] hover:bg-[var(--surface-300)] focus-visible:shadow-[var(--shadow-focus)] outline-none transition-all duration-150",
        /* Secondary Pill - Tag Style */
        secondary:
          "bg-[var(--surface-400)] text-[rgba(38,37,30,0.6)] rounded-full py-[3px] px-[8px] hover:text-[var(--color-error)] focus-visible:shadow-[var(--shadow-focus)] outline-none transition-all duration-150",
        /* Tertiary Pill - Active Tag */
        tertiary:
          "bg-[var(--surface-500)] text-[rgba(38,37,30,0.6)] rounded-full py-[3px] px-[8px] focus-visible:shadow-[var(--shadow-focus)] outline-none transition-all duration-150",
        /* Ghost - Transparent */
        ghost:
          "bg-[rgba(38,37,30,0.06)] text-[rgba(38,37,30,0.55)] rounded-[8px] py-[6px] px-[12px] hover:text-[var(--color-error)] focus-visible:shadow-[var(--shadow-focus)] outline-none transition-all duration-150",
        /* Light Surface */
        light:
          "bg-[var(--surface-100)] text-[var(--foreground)] rounded-[8px] py-[0px_8px_1px_12px] hover:text-[var(--color-error)] focus-visible:shadow-[var(--shadow-focus)] outline-none transition-all duration-150",
        /* Link */
        link: "text-[var(--color-accent)] underline-offset-4 hover:underline transition-colors duration-150",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        /* Cursor-inspired sizes */
        cursor: "py-[10px] px-[12px_10px_10px_14px] rounded-[8px]",
        pill: "py-[3px] px-[8px] rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
