import * as React from "react"
import { cn } from "@/lib/utils"

export const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-slate-100 text-slate-800",
    outline: "border border-slate-200 text-slate-700",
  }
  return (
    <div
      ref={ref}
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", variants[variant], className)}
      {...props}
    />
  )
})
Badge.displayName = "Badge"
