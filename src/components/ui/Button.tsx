import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/src/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'glow';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-primary text-[#0B0F14] hover:bg-primary-hover",
      outline: "border border-border bg-transparent hover:bg-surface text-text-primary hover:border-text-muted/30",
      ghost: "hover:bg-surface hover:text-text-primary text-text-muted",
      glow: "bg-primary text-[#0B0F14] shadow-[0_0_12px_rgba(94,230,255,0.4)] hover:shadow-[0_0_20px_rgba(94,230,255,0.6)]",
    };

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
    };

    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        className={cn(baseStyles, variants[variant], sizes[size], "btn-shine cursor-default", className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
