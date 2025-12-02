import * as React from "react"
import { cn } from "@/lib/utils"

// Tabs
const Tabs = ({ defaultValue, value, onValueChange, children, className }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || value)

  return (
    <div className={className}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { value: activeTab, onValueChange: onValueChange || setActiveTab })
      )}
    </div>
  )
}

const TabsList = ({ children, className }) => (
  <div className={cn("inline-flex rounded-lg bg-slate-100 p-1", className)}>
    {children}
  </div>
)

const TabsTrigger = ({ value, children, className, ...props }) => (
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

const TabsContent = ({ value, currentValue, children, className }) => (
  currentValue === value && <div className={className}>{children}</div>
)

// Badge
const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
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

// Label
const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
    {...props}
  />
))
Label.displayName = "Label"

// Alert
const Alert = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
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

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

// Select
const Select = ({ value, onValueChange, children }) => (
  <div data-select="">
    {React.Children.map(children, child =>
      React.cloneElement(child, { value, onValueChange })
    )}
  </div>
)

const SelectTrigger = React.forwardRef(({ className, value, ...props }, ref) => (
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

const SelectValue = ({ placeholder, children }) => (
  <span>{children || placeholder}</span>
)

const SelectContent = ({ children, onValueChange }) => (
  <div className="rounded-lg border border-slate-200 bg-white shadow-lg">
    {children}
  </div>
)

const SelectItem = ({ value, children, onValueChange }) => (
  <button
    className="block w-full px-3 py-2 text-sm text-left hover:bg-slate-100"
    onClick={() => onValueChange && onValueChange(value)}
  >
    {children}
  </button>
)

// Skeleton
const Skeleton = ({ className }) => (
  <div className={cn("animate-pulse rounded-lg bg-slate-200", className)} />
)

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Label,
  Alert,
  AlertDescription,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Skeleton,
}
