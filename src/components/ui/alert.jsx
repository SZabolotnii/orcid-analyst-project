import * as React from "react"
import { cn } from "@/lib/utils"

export const Alert = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-slate-50 text-slate-900 border border-slate-200",
    destructive: "border-red-200 bg-red-50 text-red-900",
  }
  return (
    <div
      ref={ref}
      role="alert"
      className={cn("relative w-full rounded-lg border px-4 py-3 text-sm", variants[variant], className)}
      {...props}
    />
  )
})
Alert.displayName = "Alert"

export const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"
