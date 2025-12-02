import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const buttonVariants = {
  variants: {
    variant: {
      default: "bg-indigo-600 text-white hover:bg-indigo-700",
      outline: "border border-slate-200 text-slate-700 hover:bg-slate-50",
      ghost: "hover:bg-slate-100 text-slate-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
    },
    size: {
      default: "px-4 py-2 text-sm font-medium",
      sm: "px-3 py-1.5 text-xs font-medium",
      lg: "px-6 py-3 text-base font-medium",
      icon: "h-10 w-10",
    },
  },
}

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        buttonVariants.variants.variant[variant],
        buttonVariants.variants.size[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
