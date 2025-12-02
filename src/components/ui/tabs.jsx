import * as React from "react"
import { cn } from "@/lib/utils"

// Tabs
export const Tabs = ({ defaultValue, value, onValueChange, children, className }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || value)

  return (
    <div className={className}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { value: activeTab, onValueChange: onValueChange || setActiveTab })
      )}
    </div>
  )
}

export const TabsList = ({ children, className }) => (
  <div className={cn("inline-flex rounded-lg bg-slate-100 p-1", className)}>
    {children}
  </div>
)

export const TabsTrigger = ({ value, children, className, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:shadow-sm",
      className
    )}
    onClick={(e) => {
      if (props.onValueChange) props.onValueChange(value)
    }}
    {...props}
  >
    {children}
  </button>
)

export const TabsContent = ({ value, children, className, ...props }) => {
  const currentValue = props.value
  return currentValue === value ? <div className={className}>{children}</div> : null
}
