import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-button-label transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90",
                secondary:
                    "bg-[var(--surface-400)] text-[rgba(38,37,30,0.6)] hover:text-[var(--color-error)] transition-colors duration-150",
                tertiary:
                    "bg-[var(--surface-500)] text-[rgba(38,37,30,0.6)] hover:text-[var(--color-error)] transition-colors duration-150",
                destructive:
                    "border-transparent bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90 transition-colors duration-150",
                outline: "text-[var(--foreground)] border-[var(--border-primary)] hover:bg-[var(--surface-400)] transition-colors duration-150",
                success:
                    "bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]/90 transition-colors duration-150",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
