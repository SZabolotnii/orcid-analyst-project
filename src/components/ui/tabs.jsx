import * as React from "react"
import { cn } from "@/lib/utils"

// Tabs
export const Tabs = ({ defaultValue, value, onValueChange, children, className }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || value)
  
  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value)
    }
  }, [value])

  const handleValueChange = (newValue) => {
    setActiveTab(newValue)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <div className={className}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { 
          currentValue: activeTab, 
          onValueChange: handleValueChange 
        })
      )}
    </div>
  )
}

export const TabsList = ({ children, currentValue, onValueChange, className }) => (
  <div className={cn("inline-flex rounded-lg bg-slate-100 p-1", className)}>
    {React.Children.map(children, child =>
      React.cloneElement(child, { currentValue, onValueChange })
    )}
  </div>
)

export const TabsTrigger = ({ value, currentValue, onValueChange, children, className, ...props }) => {
  const isActive = currentValue === value
  
  return (
    <button
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-white shadow-sm",
        className
      )}
      onClick={() => {
        if (onValueChange) {
          onValueChange(value)
        }
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export const TabsContent = ({ value, currentValue, children, className }) => {
  return currentValue === value ? <div className={className}>{children}</div> : null
}
