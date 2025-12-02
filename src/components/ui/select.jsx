import * as React from "react"
import { cn } from "@/lib/utils"

export const Select = ({ value, onValueChange, children }) => (
  <div data-select="">
    {React.Children.map(children, child =>
      React.cloneElement(child, { value, onValueChange })
    )}
  </div>
)

export const SelectTrigger = React.forwardRef(({ className, value, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50",
      className
    )}
    {...props}
  />
))
SelectTrigger.displayName = "SelectTrigger"

export const SelectValue = ({ placeholder, children }) => (
  <span>{children || placeholder}</span>
)

export const SelectContent = ({ children, onValueChange }) => (
  <div className="rounded-lg border border-slate-200 bg-white shadow-lg">
    {children}
  </div>
)

export const SelectItem = ({ value, children, onValueChange }) => (
  <button
    className="block w-full px-3 py-2 text-sm text-left hover:bg-slate-100"
    onClick={() => onValueChange && onValueChange(value)}
  >
    {children}
  </button>
)
